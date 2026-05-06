import type { Context } from "hono";
import { JsonRpcProvider, Wallet, keccak256, toUtf8Bytes } from "ethers";
import { createZGComputeNetworkBroker } from "@0glabs/0g-serving-broker";
import type {
  ChatMessage,
  SealInferenceRequest,
  SealInferenceResponse,
  WorkerEnv,
} from "./types";

// --------------------------------------------------------------------------
// Constants
// --------------------------------------------------------------------------

/** Default model if the caller does not specify one. */
const DEFAULT_MODEL = "llama-3.3-70b-instruct";

/** Initial ledger top-up (in OG) when an account doesn't exist yet.
 *  Cheap enough to not burn the dev key on first call. */
const INITIAL_LEDGER_BALANCE_OG = 0.05;

// --------------------------------------------------------------------------
// Validation
// --------------------------------------------------------------------------

function isChatMessage(x: unknown): x is ChatMessage {
  if (!x || typeof x !== "object") return false;
  const m = x as Record<string, unknown>;
  return (
    (m.role === "system" || m.role === "user" || m.role === "assistant") &&
    typeof m.content === "string"
  );
}

function parseBody(raw: unknown): SealInferenceRequest | { error: string } {
  if (!raw || typeof raw !== "object") return { error: "body must be JSON object" };
  const r = raw as Record<string, unknown>;
  if (!Array.isArray(r.messages) || r.messages.length === 0) {
    return { error: "messages[] required and non-empty" };
  }
  if (!r.messages.every(isChatMessage)) {
    return { error: "each message must be { role: 'system'|'user'|'assistant', content: string }" };
  }
  if (r.model !== undefined && typeof r.model !== "string") {
    return { error: "model must be a string when provided" };
  }
  return { messages: r.messages as ChatMessage[], model: r.model as string | undefined };
}

// --------------------------------------------------------------------------
// Hashing
// --------------------------------------------------------------------------

/** Stable canonical hash of the request payload — what we'll later compare
 *  against on-chain or in the attestation. JSON.stringify with sorted keys
 *  would be safer; for now we trust the message order is preserved. */
function hashRequest(payload: SealInferenceRequest): string {
  return keccak256(toUtf8Bytes(JSON.stringify(payload)));
}

function hashResponse(content: string): string {
  return keccak256(toUtf8Bytes(content));
}

// --------------------------------------------------------------------------
// Mock mode (local dev without funded compute account)
// --------------------------------------------------------------------------

function buildMockResponse(req: SealInferenceRequest): SealInferenceResponse {
  const last = req.messages[req.messages.length - 1];
  const echo = last?.content ?? "(empty)";
  const content =
    `[mock] sealed-inference echo: ${echo.slice(0, 200)}` +
    (echo.length > 200 ? "…" : "");
  return {
    content,
    chatId: "mock-chat-0000000000000000",
    // 65-byte fake sig (130 hex chars + 0x). TEE-attested in real mode.
    signature: "0x" + "ab".repeat(65),
    requestHash: hashRequest(req),
    responseHash: hashResponse(content),
    attestation: { mock: true, note: "MOCK=1; no broker call was made" },
  };
}

// --------------------------------------------------------------------------
// Real broker flow
// --------------------------------------------------------------------------

interface BrokerCallResult {
  content: string;
  chatId: string;
  signature: string;
  attestation: unknown;
}

async function runBrokerFlow(
  env: WorkerEnv,
  req: SealInferenceRequest,
): Promise<BrokerCallResult> {
  if (!env.DEPLOYER_PRIVATE_KEY) {
    throw new Error("DEPLOYER_PRIVATE_KEY secret not set");
  }
  if (!env.ZG_COMPUTE_PROVIDER) {
    throw new Error("ZG_COMPUTE_PROVIDER secret not set");
  }

  // 1. Network setup — JsonRpcProvider + Wallet, both work in Workers
  //    because the 0G broker SDK speaks ethers v6 over fetch.
  const provider = new JsonRpcProvider(env.ZG_RPC_URL);
  const wallet = new Wallet(env.DEPLOYER_PRIVATE_KEY, provider);
  const broker = await createZGComputeNetworkBroker(wallet);

  // 2. Account create / lookup. addLedger throws if one already exists,
  //    so we treat "exists" as success and continue.
  try {
    await broker.ledger.getLedger();
  } catch {
    await broker.ledger.addLedger(INITIAL_LEDGER_BALANCE_OG);
  }

  // 3. Acknowledge provider — required once per (account, provider) pair
  //    before getRequestHeaders will succeed. Idempotent on the SDK side
  //    (it no-ops if already acknowledged), but we still tolerate errors.
  try {
    await broker.inference.acknowledgeProviderSigner(env.ZG_COMPUTE_PROVIDER);
  } catch (err) {
    // Most common case: already acknowledged. Re-throw only if the message
    // doesn't look benign so we don't mask real issues.
    const msg = err instanceof Error ? err.message : String(err);
    if (!/already|acknowledg/i.test(msg)) throw err;
  }

  // 4. Resolve provider's serving endpoint + advertised model.
  const { endpoint, model: providerModel } =
    await broker.inference.getServiceMetadata(env.ZG_COMPUTE_PROVIDER);
  const model = req.model ?? providerModel ?? DEFAULT_MODEL;

  // 5. Build billing-related headers. The SDK signs them with the wallet.
  const headers = await broker.inference.getRequestHeaders(env.ZG_COMPUTE_PROVIDER);

  // 6. Call the provider's OpenAI-compatible chat endpoint.
  const upstream = await fetch(`${endpoint}/v1/chat/completions`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(headers as unknown as Record<string, string>),
    },
    body: JSON.stringify({ model, messages: req.messages }),
  });

  if (!upstream.ok) {
    const text = await upstream.text().catch(() => "");
    throw new Error(`provider ${upstream.status}: ${text.slice(0, 500)}`);
  }

  const chatId =
    upstream.headers.get("ZG-Res-Key") ?? upstream.headers.get("zg-res-key") ?? "";
  const json = (await upstream.json()) as {
    choices?: Array<{ message?: { content?: string } }>;
  };
  const content = json.choices?.[0]?.message?.content ?? "";

  // 7. processResponse verifies the TEE signature and caches usage data.
  //    Return value is `boolean | null` — null means the SDK could not
  //    verify (no attestation cached yet); we still surface the content.
  await broker.inference
    .processResponse(env.ZG_COMPUTE_PROVIDER, chatId, content)
    .catch(() => null);

  // The SDK doesn't expose the raw signature/attestation publicly on the
  // broker yet; we read them from the upstream response headers, which is
  // where the TEE provider returns them per the 0G compute spec.
  const signature =
    upstream.headers.get("ZG-Signature") ??
    upstream.headers.get("zg-signature") ??
    "";
  const attestationRaw =
    upstream.headers.get("ZG-Attestation") ??
    upstream.headers.get("zg-attestation");
  let attestation: unknown = attestationRaw;
  if (attestationRaw) {
    try {
      attestation = JSON.parse(attestationRaw);
    } catch {
      // leave as raw string
    }
  }

  return { content, chatId, signature, attestation };
}

// --------------------------------------------------------------------------
// HTTP handler
// --------------------------------------------------------------------------

export async function sealInferenceHandler(
  c: Context<{ Bindings: WorkerEnv }>,
) {
  let raw: unknown;
  try {
    raw = await c.req.json();
  } catch {
    return c.json({ error: "invalid JSON body" }, 400);
  }

  const parsed = parseBody(raw);
  if ("error" in parsed) return c.json({ error: parsed.error }, 400);

  // Mock branch — used by local dev / CI without a funded broker account.
  if (c.env.MOCK === "1") {
    return c.json(buildMockResponse(parsed), 200);
  }

  let result: BrokerCallResult;
  try {
    result = await runBrokerFlow(c.env, parsed);
  } catch (err) {
    const detail = err instanceof Error ? err.message : String(err);
    return c.json({ error: "broker_error", detail }, 502);
  }

  const body: SealInferenceResponse = {
    content: result.content,
    chatId: result.chatId,
    signature: result.signature,
    requestHash: hashRequest(parsed),
    responseHash: hashResponse(result.content),
    attestation: result.attestation,
  };
  return c.json(body, 200);
}

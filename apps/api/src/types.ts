// Public request/response shapes shared with the React frontend.
// Keep this file dependency-free — it can be re-exported into a shared
// types package later if the frontend wants to pull from it directly.

export type ChatRole = "system" | "user" | "assistant";

export interface ChatMessage {
  role: ChatRole;
  content: string;
}

export interface SealInferenceRequest {
  messages: ChatMessage[];
  model?: string;
}

export interface SealInferenceResponse {
  /** The LLM-generated text for the last assistant turn. */
  content: string;
  /** ZG-Res-Key from the broker response — opaque per-request id. */
  chatId: string;
  /** 65-byte hex signature returned by the TEE provider. */
  signature: string;
  /** keccak256 of the canonical request bytes (hex, 0x-prefixed). */
  requestHash: string;
  /** keccak256 of the response bytes (hex, 0x-prefixed). */
  responseHash: string;
  /** Raw attestation report — pass-through, frontend may verify or display. */
  attestation: unknown;
}

export interface ApiError {
  error: string;
  detail?: string;
}

/** Worker bindings declared in wrangler.toml `[vars]` + `wrangler secret put`. */
export interface WorkerEnv {
  // [vars]
  CHAIN_ID: string;
  ZG_RPC_URL: string;
  AGENT_NFT_ADDRESS: string;
  ROYALTY_HOOK_ADDRESS: string;
  MOCK?: string;
  // secrets
  DEPLOYER_PRIVATE_KEY?: string;
  ZG_COMPUTE_PROVIDER?: string;
}

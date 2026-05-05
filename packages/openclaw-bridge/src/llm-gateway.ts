/**
 * 0G Compute Sealed Inference gateway.
 *
 * Replaces every `client.messages.create()` (Anthropic) and
 * `openai.chat.completions.create()` call in the OpenClaw runtime.
 * Each chat() call: pays the on-chain royalty, then invokes Sealed Inference
 * via @0glabs/0g-serving-broker, then exposes the Remote Attestation report
 * for download.
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/openclaw-bridge.md
 */

// NOTE (Day 3): the real broker import lives at `@0glabs/0g-serving-broker`.
// We keep the import dynamic until Day 3 to avoid a build-time dependency
// on a package that's only needed at runtime.
type Broker = {
  inference: {
    acknowledgeProviderSigner(provider: string): Promise<void>;
    getRequestHeaders(provider: string, body: string): Promise<Record<string, string>>;
    getServiceMetadata(provider: string): Promise<{ endpoint: string; model: string }>;
    processResponse(provider: string, chatId: string): Promise<unknown>;
  };
};

export interface ZGGatewayConfig {
  /** ethers.Signer-compatible signer for broker auth + royalty payments. */
  signer: unknown;
  /** Sealed-inference provider address (set via 0g-compute-cli inference list-providers). */
  providerAddress: string;
  /** Default model id (e.g. "glm-5-fp8" or "qwen3.6-plus"). */
  defaultModel?: string;
  /** Per-call fee paid to RoyaltyHook before each inference (wei). */
  inferenceFeeWei?: bigint;
  /** Optional royalty client. If omitted, gateway runs without on-chain royalty. */
  royaltyClient?: { payAndRun(tokenId: bigint, fee: bigint): Promise<unknown> };
}

export interface ChatRequest {
  tokenId: bigint;
  messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>;
  model?: string;
}

export interface ChatResponse {
  content: string;
  chatId: string | null;
  /** Async download — call to fetch the RA report from the provider. */
  attestation: () => Promise<unknown>;
}

export class ZGLLMGateway {
  private broker: Broker | null = null;

  constructor(private readonly cfg: ZGGatewayConfig) {}

  async init(): Promise<void> {
    const mod = await import('@0glabs/0g-serving-broker' as string).catch(() => {
      throw new Error('Install @0glabs/0g-serving-broker to use ZGLLMGateway');
    });
    // ethers v5 vs v6 type mismatch in the SDK — cast through unknown.
    const create = (mod as { createZGComputeNetworkBroker: (s: unknown) => Promise<Broker> })
      .createZGComputeNetworkBroker;
    this.broker = await create(this.cfg.signer);
    await this.broker.inference.acknowledgeProviderSigner(this.cfg.providerAddress);
  }

  async chat(req: ChatRequest): Promise<ChatResponse> {
    if (!this.broker) throw new Error('Call init() first');

    if (this.cfg.royaltyClient && this.cfg.inferenceFeeWei) {
      await this.cfg.royaltyClient.payAndRun(req.tokenId, this.cfg.inferenceFeeWei);
    }

    const body = JSON.stringify({ messages: req.messages });
    const headers = await this.broker.inference.getRequestHeaders(this.cfg.providerAddress, body);
    const { endpoint, model } = await this.broker.inference.getServiceMetadata(this.cfg.providerAddress);

    const response = await fetch(`${endpoint}/v1/chat/completions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...headers },
      body: JSON.stringify({ model: req.model ?? this.cfg.defaultModel ?? model, messages: req.messages }),
    });

    if (!response.ok) {
      throw new Error(`Sealed Inference failed: ${response.status} ${await response.text()}`);
    }

    const data = (await response.json()) as { choices: Array<{ message: { content: string } }> };
    const chatId = response.headers.get('ZG-Res-Key');

    return {
      content: data.choices[0]?.message?.content ?? '',
      chatId,
      attestation: async () => {
        if (!chatId) throw new Error('No ZG-Res-Key on response — cannot fetch attestation');
        return this.broker!.inference.processResponse(this.cfg.providerAddress, chatId);
      },
    };
  }
}

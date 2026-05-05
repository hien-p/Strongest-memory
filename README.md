# strongest

> A 0G-native runtime for OpenClaw agents — every agent is an **ERC-7857 iNFT** with sealed-inference brains, encrypted persistent memory, and on-chain royalties.

**Hackathon:** [0G APAC Hackathon](https://www.hackquest.io/hackathons/0G-APAC-Hackathon) · Track 1 (Agentic Infrastructure & OpenClaw Lab)
**Status:** Day 1 of 11 (deadline 2026-05-16 23:59 UTC+8)
**Demo:** TBD (Cloudflare Workers — deploy-on-push to `main` via `.github/workflows/deploy.yml`)
**Video:** TBD (Day 9)
**Live contracts:** TBD (Galileo testnet on Day 1, Aristotle mainnet on Day 4)

## Vision — the missing primitive

In the coming agent economy, an AI agent is software that **acts on your behalf, holds your context, and accumulates value.** Today every agent dies when its hosting service shuts down — the brain stays trapped behind an API key the user never controlled. AIverse / Eliza / Virtuals offer consumer-grade agent UX but no ownership; OpenAI's GPTs are tradeable on a marketplace but not portable. **The missing primitive is an agent that you can own, transfer, and earn royalties on, end-to-end on-chain, without ever giving an operator plaintext access to its memory.**

`strongest` is that primitive on 0G:

- **Ownable** — ERC-7857 iNFT on Aristotle mainnet. The token IS the agent's identity.
- **Portable** — encrypted memory blob on 0G Storage; transfer triggers TEE-attested re-encryption so the buyer inherits the full brain, not a fresh receipt.
- **Verifiable** — every inference runs in 0G Sealed Inference (Intel TDX + H100/H200) with a downloadable Remote Attestation per call.
- **Monetizable** — 5% creator royalty paid on-chain on every invocation via `RoyaltyHook`.

### Market

- **AI Agents TAM (2030):** $50.31B (Grand View Research, 45.8% CAGR) / $52.62B (MarketsandMarkets, 46.3% CAGR).
- **0G's bet:** the deAIOS stack — Compute + Storage + Chain + Agent ID + Sealed Inference — is positioned as the canonical agent runtime. Track 1 of this hackathon is named after OpenClaw, 0G's reference agent framework.
- **Why this wins:** the four primitives only cohere into a *product* when wired together by something like `strongest`. We're the integration layer that makes the agent economy tradeable.

## What it is

**Every agent ownable. Every memory encrypted. Every inference verified.**

`strongest` turns AI agents into ownable, encrypted, royalty-bearing assets:

1. Each agent's intelligence (`SOUL.md` + `MEMORY.md` + `skills/`) is encrypted client-side (AES-256-GCM with HKDF-derived per-agent keys) and stored on **0G Storage**.
2. Every LLM call routes through **0G Compute Sealed Inference** (Intel TDX + H100/H200 in TEE mode) with a downloadable Remote Attestation report.
3. Each agent is minted as an **ERC-7857 iNFT** on 0G Aristotle mainnet. The token's `metadataHash` points to the encrypted blob's Merkle root on 0G Storage.
4. Each agent claims a `<name>.0g` namespace via SPACE ID for human-readable discovery.
5. Every inference call routes a **5% royalty** to the creator's wallet on-chain (`RoyaltyHook` contract).
6. iNFT transfers trigger **TEE-attested re-encryption** — the buyer gets the full agent intelligence, not just a receipt.

## 0G integration (4 components)

| Component | How we use it |
|---|---|
| **0G Compute (Sealed Inference)** | Every agent inference + every re-encryption commitment runs in Intel TDX + H100/H200. RA report downloadable per call. |
| **0G Storage (Turbo)** | Agent state encrypted client-side, uploaded to the Turbo indexer. Merkle root → iNFT `metadataHash`. |
| **0G Chain (Aristotle Mainnet)** | `AgentNFT` (ERC-7857) + `Verifier` + `RoyaltyHook` contracts, all verified on chainscan.0g.ai. |
| **Agent ID (.0g TLD)** | Each iNFT claims `<name>.0g` via SPACE ID. Cross-resolution with ENS optional. |

## How we differentiate (the four-pillar delta)

Other strong submissions in this hackathon nail one or two of these pillars. We're shipping **all four**:

| Pillar | What we ship | What competitors typically miss |
|---|---|---|
| **1. Working royalty hook on-chain** | `RoyaltyHook.sol` splits every fee 5% creator / 95% platform with a `payAndRun(tokenId, fee)` ABI; events indexed for the leaderboard. **16 Foundry tests pass (incl. 256-run fuzz).** | Most "agent NFT" submissions describe royalties but don't implement the on-chain split. |
| **2. Real transfer with memory persistence** | After mint, three reference agents accumulate real `MEMORY.md` content. The transfer demo: wallet B buys, the bridge re-encrypts AES locally, Sealed Inference witnesses the JSON commitment, on-chain `Verifier` accepts the signature, B asks "what did we conclude about X?" — agent recalls. | Memory-layer submissions mostly demo "memory exists" without the *visceral* "wallet B inherits prior session" moment. |
| **3. Live on-chain metrics + attestation viewer** | `/metrics/` reads `Transfer` + `InferenceRun` events from Aristotle every 30s. `/verify/` lets anyone paste a signature + recover the signing address on-chain — provable that the response came from the registered TEE oracle. No centralized indexer. | Most submissions ship a slide-deck pitch; the TEE attestation story stays abstract. |
| **4. Sealed Inference as commitment-binder (novel)** | We don't ask the LLM to compute AES (broken by FP non-associativity over multi-KB ciphertext). We compute AES in `node:crypto`, then have Sealed Inference *witness* a 200-byte JSON commitment. The TEE-born signing key signs `(req_hash, res_hash, chatID)` per 0G provider docs. | No prior submission uses Sealed Inference as a crypto witness. The pattern is original to this project. |

## The non-obvious pattern: Sealed Inference as commitment-binder (Hack A)

Naive "Sealed Inference re-encryption" is broken — LLMs are non-deterministic over multi-KB ciphertext (FP non-associativity + speculative decoding). Single-node Phala+Rust runs into vendor approval queues. Custom 0G Compute Service Provider registration is infeasible in 11 days (closed `serviceType` enum, LLM-only proxy, dstack-only verifier).

**What we ship instead:** AES-256-GCM round-trip in `node:crypto` (in our bridge), then ask Sealed Inference to **witness** a deterministic 200-byte JSON commitment `{v, oldHash, newHash, sealedKey, newOwner, ts}` with `temperature=0` and `response_format: json_object`. The TEE-born signing key signs the response covering `(request_hash, response_hash, chatID)`. The on-chain `Verifier` recovers that signing address and accepts the transfer.

**Why this is the pitch:**
- Plaintext keys never touch the LLM.
- The signature provably came from a key generated inside an attested 0G TEE.
- Pure-0G consumer-side stack — no Phala account, no Marlin, no Oasis SaaS. (`dstack` remains as transitive infra dep of 0G's broker; we treat it as upstream 0G infra, not a vendor.)
- "We made Sealed Inference do crypto" without trusting a stochastic transformer to do AES.

See [`../openclaw-0g-hackathon/architecture/inft-design.md`](../openclaw-0g-hackathon/architecture/inft-design.md) for the full spec.

## Architecture

```mermaid
graph TB
    subgraph User["User / Owner"]
        Wallet[EVM Wallet]
        Browser[Static frontend<br/>Cloudflare Workers]
    end

    subgraph OpenClaw["OpenClaw Runtime (EC2)"]
        Bridge[0G Bridge Adapter<br/>llm-gateway + state-sync<br/>+ reencrypt-commitment]
    end

    subgraph ZG_Compute["0G Compute (Sealed Inference)"]
        TEE[Intel TDX + H100<br/>GLM-5 / Qwen3.6-Plus]
    end

    subgraph ZG_Storage["0G Storage Turbo"]
        Indexer[Encrypted blobs<br/>AES-256-GCM]
    end

    subgraph ZG_Chain["0G Aristotle Mainnet"]
        AgentNFT[AgentNFT.sol<br/>ERC-7857]
        Verifier[Verifier.sol]
        RoyaltyHook[RoyaltyHook.sol]
    end

    Browser --> Bridge
    Bridge -->|every LLM call| TEE
    Bridge -->|encrypted state| Indexer
    Bridge -->|JSON commitment| TEE
    TEE -->|TEE-signed payload| Verifier
    Bridge -->|pay royalty| RoyaltyHook
    AgentNFT -.->|metadataHash| Indexer
    Verifier -->|validate signing addr| AgentNFT
    RoyaltyHook -->|5% to creator| Wallet
```

## Test coverage

| Layer | Framework | Count | Status |
|---|---|---|---|
| TS — `crypto.ts` (AES-GCM + HKDF + blob format) | vitest | 13 | ✓ |
| TS — `reencrypt-commitment.ts` (Hack A flow + memory persistence invariant) | vitest | 6 | ✓ |
| Solidity — `RoyaltyHook.sol` (split math + edge cases + 256-run fuzz) | Foundry | 11 | ✓ |
| Solidity — Integration (BeaconProxy + Verifier + Hook deploy chain) | Foundry | 5 | ✓ |
| **Total** | — | **35** | **all pass** |

Run locally:
```bash
pnpm test          # vitest (TS)
pnpm contracts:test  # forge test (Solidity)
```

CI runs all three layers on every push and PR (`.github/workflows/test.yml`).

## Reproduce in 5 minutes

Prerequisites: Node 20+, pnpm 10, Foundry, Rust (only for Hack B moonshot), an EVM wallet with ~5 0G on Aristotle mainnet (or Galileo testnet 0G via [faucet.0g.ai](https://faucet.0g.ai)).

```bash
git clone https://github.com/hien-p/Strongest-memory
cd Strongest-memory
./scripts/install-hooks.sh    # wires .githooks/ into git config
pnpm install
cp .env.example .env  # fill DEPLOYER_PRIVATE_KEY, RE_ENC_MASTER_KEY, etc.

# Build + test contracts (Foundry)
pnpm contracts:build
pnpm contracts:test

# Deploy stub contracts to Galileo testnet
pnpm contracts:deploy:galileo

# Run the frontend (static, Cloudflare Workers)
python3 -m http.server 8787 --directory apps/web
# or: npx wrangler dev
# → http://localhost:8787  (devlog at /logs/)
```

Production deploy is fully automated — push to `main` triggers `.github/workflows/deploy.yml` which runs `wrangler deploy`. Requires `CLOUDFLARE_API_TOKEN` + `CLOUDFLARE_ACCOUNT_ID` repo secrets.

Test wallet (read-only, pre-funded with sample iNFTs): TBD after Day 4 mainnet deploy.

## Repo layout

```
strongest/
├── apps/
│   ├── web/                   Static landing + mint/run/transfer (served by Cloudflare Workers)
│   │   ├── index.html         Landing page
│   │   └── public/logs/       Devlog — every commit adds a card here
│   └── oracle/                Rust scaffold for Hack B WASM verifier (Day 8-9 moonshot only)
├── packages/
│   ├── contracts/             Foundry workspace — AgentNFT + Verifier + RoyaltyHook
│   ├── openclaw-bridge/       OpenClaw → 0G adapter (llm-gateway, state-sync, royalty-hook,
│   │                          inft-registry, crypto, reencrypt-commitment)
│   └── shared-types/          ZG_ARISTOTLE/ZG_GALILEO chain configs + agent types
├── samples/                   3 reference agents (dev-orchestrator, funding-arb, research-agent)
├── scripts/                   Deploy helpers + install-hooks.sh
├── .githooks/                 commit-msg (block Claude attribution) + pre-push (nudge /logs)
├── .github/workflows/         deploy.yml (CF Workers) + commit-guard.yml
├── wrangler.toml              Cloudflare Workers static-asset config
├── CLAUDE.md                  Working rules for Claude Code in this repo
├── CONTRIBUTING.md            Branch + commit + /logs convention
├── .env.example               All required env vars
└── package.json               pnpm workspace root
```

## Live contracts (Aristotle Mainnet, chain ID 16661)

- **AgentNFT (ERC-7857):** TBD after Day 4
- **Verifier (TEE mode):** TBD
- **RoyaltyHook:** TBD

Reference agents minted:
- `dev-orchestrator.0g` — TBD
- `funding-arb.0g` — TBD

## What's reused vs. new

Per HackQuest rules ("Teams may submit … an existing prototype that is further developed and deployed on 0G during the hackathon"):

**Reused (~55%):**
- OpenClaw 2-tier orchestrator on EC2 (~30%) — existing production system, 17+ specialized agents
- manifest.eth / agenthub.eth Agent Registry frontend (~15%) — repurposed for iNFT discovery UI
- GrayBot ERC-8004 reputation patterns (~10%)

**Net-new for this hackathon (~45%):**
- All 0G integration code (Compute broker, Storage SDK, Chain contracts, .0g resolution)
- AgentNFT fork + `RoyaltyHook` contract + Foundry workspace + tests
- `reencrypt-commitment.ts` (the Hack A pattern — AES in `node:crypto` + Sealed Inference witness)
- Static frontend on Cloudflare Workers with mint/run/transfer flows + wagmi/viem in the browser

## Honest disclosures

1. **HKDF master key (`K_M`) lives in the bridge process** for the hackathon — a malicious bridge operator could read plaintext. Production roadmap: rotate `K_M` into a registered 0G Compute Service Provider once non-LLM `serviceType`s ship. The `Verifier` contract already supports multi-oracle consensus.
2. **Sealed Inference signs the commitment, not the AES math.** A bridge that fabricates `(oldHash, newHash)` pairs where AES doesn't actually round-trip would pass the on-chain check. Mitigation: buyers re-decrypt + spot-check before signing the on-chain receipt; the Run UI surfaces this.
3. **Some demo video responses pre-cached** to fit Sealed Inference rate limits (30 req/min). All cached responses match what the live system would produce — disclosed in the video description.
4. **Contracts forked, not audited.** `AgentNFT` + `Verifier` are forked from `0glabs/0g-agent-nft@eip-7857-draft`. `RoyaltyHook` is original. None audited beyond Foundry tests. Use at your own risk on mainnet beyond this demo.
5. **Reference agents pre-minted by us** for the demo. Real users mint their own via the wizard.

## Roadmap (post-hackathon)

- Multi-provider Sealed Inference consensus (register N TEE signing addresses on the on-chain `Verifier`; require N-of-M signatures over the same JSON commitment).
- **Hack B**: tiny Rust→WASM verifier that re-checks the AES-GCM tag against the LLM's committed hashes. `apps/oracle/` is scaffolded for this.
- Rotate `K_M` into a registered 0G Service Provider once non-LLM service types ship (currently `serviceType` enum is closed).
- Agent fine-tuning via 0G Compute fine-tuning service.
- Agent breeding/merging (ERC-7857 child tokens inheriting weighted traits from parents).
- Cross-chain iNFT bridging to Ethereum L1.
- Agent reputation aggregation across ENS + ERC-8004 + .0g.

## Acknowledgments

- [@0G_labs](https://x.com/0G_labs) — deAIOS stack: Compute, Storage, Chain, Sealed Inference
- [@0gfoundation](https://x.com/0gfoundation) — ERC-7857 reference implementation at [`0glabs/0g-agent-nft`](https://github.com/0glabs/0g-agent-nft)
- [@steipete](https://x.com/steipete) — OpenClaw, the agent framework that surpassed React
- [@HackQuest_](https://x.com/HackQuest_) — APAC Hackathon hosts

## License

- Original code: MIT
- Forked code under `packages/contracts/src/` from `0glabs/0g-agent-nft`: retains upstream Apache-2.0
- OpenClaw framework usage: MIT-compatible per upstream

---

## 🇻🇳 Tóm tắt tiếng Việt

`strongest` biến mọi AI agent thành tài sản có thể sở hữu, được mã hóa, và sinh royalty trên mỗi lần sử dụng — chạy hoàn toàn trên stack 0G.

- Mỗi agent là một ERC-7857 iNFT trên 0G Aristotle mainnet.
- "Bộ não" của agent (prompt + memory + skills) được mã hóa client-side bằng AES-256-GCM và lưu trên 0G Storage.
- Mỗi lần inference chạy trong Intel TDX + H100 TEE qua 0G Compute Sealed Inference, kèm RA report tải về được.
- Mỗi lần invoke, 5% phí được chia về creator gốc on-chain qua `RoyaltyHook`.
- Khi chuyển nhượng iNFT, bridge re-encrypt locally rồi nhờ Sealed Inference làm chứng JSON commitment; chữ ký TEE-attested được on-chain `Verifier` xác minh.

Xây cho 0G APAC Hackathon, deadline 2026-05-16.

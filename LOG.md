# Build Log

Chronological record of decisions and shipped commits during the 0G APAC Hackathon. Format: time-stamped entries with commit refs. Strategic narrative + judging-criteria docs live one level up at [`../openclaw-0g-hackathon/`](../openclaw-0g-hackathon/).

---

## Day 1 — 2026-05-05 (Tuesday)

### Decisions locked

| When | Decision | Why |
|---|---|---|
| Morning | Project name = **strongest** (replaces planning placeholder `openclaw-0g`) | User-chosen brand. The repo lives at [`hien-p/Strongest-memory`](https://github.com/hien-p/Strongest-memory). |
| Afternoon | Re-encryption oracle = **Sealed Inference as commitment-binder (Hack A)** — AES in `node:crypto`, JSON commitment witnessed in TEE | Naive option B (LLM does AES) is broken by FP non-associativity. Custom 0G Service Provider registration (option A) is infeasible in 11 days (closed `serviceType` enum, LLM-only proxy, dstack-only verifier, 3-6 week realistic timeline). Hack A is the sharpest pure-0G consumer-side narrative. |
| Afternoon | Drop **Phala / Marlin / Oasis** as oracle hosts | Pure-0G stack at our boundary. `dstack` (Phala's tooling) remains as transitive infra dep of 0G's broker — unavoidable, treated as upstream 0G infra. |
| Afternoon | Keep `apps/oracle/` Rust scaffold as **Hack B moonshot only** (Day 8-9 stretch) | Optional WASM verifier that re-checks AES-GCM tag against the LLM's committed hashes. NOT in critical path. |

### Shipped

#### `41a404b` — chore: initial monorepo scaffold

- pnpm workspace root + `tsconfig.base.json` + `.env.example` + `.gitignore`
- `packages/contracts/`: Foundry workspace, OZ v5.4.0 + forge-std installed via `forge install`. Source tree forked from [`0glabs/0g-agent-nft@eip-7857-draft`](https://github.com/0glabs/0g-agent-nft) into `src/`. Added `RoyaltyHook.sol` (5% creator / 95% platform split with overpay refund). `Deploy.s.sol` wires `Verifier (TEE mode)` → `AgentNFT impl` → `UpgradeableBeacon` → `BeaconProxy` → `RoyaltyHook`. **Foundry tests: 4/4 pass.**
- `packages/openclaw-bridge/`: TS stubs for `ZGLLMGateway`, `StateSync`, `RoyaltyClient`, `INFTRegistry`, `crypto.ts` (AES-256-GCM with HKDF agent-key derivation per `architecture/inft-design.md`).
- `packages/shared-types/`: `ZG_ARISTOTLE` / `ZG_GALILEO` chain configs + agent type primitives.
- `apps/oracle/`: Rust scaffold (axum + aes-gcm + secp256k1 + tokio). `cargo check` clean.
- `apps/web/`: Next.js 15 + Tailwind v4 + RainbowKit/wagmi/viem with `0G Aristotle` + `Galileo` chain definitions and mint/run/transfer route stubs.
- `scripts/`: `deploy-mainnet.sh`, `verify-contracts.sh` (with retry loop), `mint-reference-agents.ts` stub.

#### `ac6ff2b` — chore: install deps + fix typecheck/build issues

- ethers v6 dynamic `Contract` methods: switched to `getFunction('name')` in `royalty-hook.ts` + `inft-registry.ts`.
- `state-sync.ts`: pass `encrypted.blob` (Buffer) to `ZgFile`, not the wrapper.
- `wagmi` config: added explicit `Config` type annotation for portability across the workspace.
- `apps/web` layout: `export const dynamic = 'force-dynamic'` — wagmi/RainbowKit reach for `localStorage` during SSG.
- Lockfile + `next-env.d.ts`.

**Verification after install:**
- `pnpm -r typecheck` ✓ (4/4 packages: shared-types, openclaw-bridge, web)
- `pnpm web build` ✓ (5 routes, 105 kB shared JS)
- `forge test` ✓ (4/4 RoyaltyHook tests)
- `cargo check` ✓ (oracle scaffold)

#### `53d3ff7` — feat(architecture): drop Phala, lock Hack A

After parallel research:

- **Option A** (custom 0G Compute Service Provider): **INFEASIBLE**. Closed `serviceType` enum (chatbot/text-to-image/image-editing/speech-to-text/video-generation), `TargetRoute` only proxies LLM endpoints, attestation gate accepts only `dstack` (Phala) or `cryptopilot` (0G-internal), bare-metal Intel TDX + H100/H200 hardware procurement is 1-2 weeks alone. Realistic timeline: 3-6 weeks.
- **Option B naive** (LLM does AES): broken by FP non-associativity over multi-KB ciphertext.
- **Option B Hack A** (LLM-as-commitment-binder): **GO.** Per 0G provider docs, the TEE signature binds `(request_hash, response_hash, chatID)` to the enclave-born signing key — anyone replaying the chatID→signature mapping has to break the TEE.

Files changed:
- New `packages/openclaw-bridge/src/reencrypt-commitment.ts` orchestrating HKDF + AES-256-GCM round-trip + JSON commitment + Sealed Inference call.
- `apps/oracle/README.md`: reframed as Hack B moonshot (Day 8-9 only).
- `.env.example`: dropped `ORACLE_PRIVATE_KEY` / `ORACLE_TEE_ENDPOINT`; added `RE_ENC_MASTER_KEY` + `ORACLE_SIGNER_ADDRESS`.
- Planning docs updated: `inft-design.md`, `system-diagram.md`, `data-flow.md`, `03-tech-stack.md`, `05-risks-and-mitigations.md`, `11-day-plan.md`, `team-allocation.md`, `video-script.md`, `readme-template.md`, both `README.md`s. Phala remains only in audit-trail entries explaining the pivot.

### Open unknowns flagged for 0G Discord/TG ping

1. Does the broker proxy pass `response_format: json_object` and `seed` unmodified to upstream providers (vLLM/SGLang)?
2. Are the model-binary measurements (`MRTD` / `RTMR`) exposed in the user-fetched RA report, or only the signing-key binding?

### Definition-of-done check

- [x] Repo public on GitHub with skeleton commits
- [ ] Stub contracts deployed + verified on Galileo (needs deployer key + faucet 0G)
- [ ] Live 0G Compute provider list documented (needs `0g-compute-cli inference list-providers`)
- [x] SPACE ID `.0g` application — TODO: user action
- [x] 0G Discord/TG ping draft — TODO: user action

---

## Day 2 — 2026-05-06 (Wednesday)

_(empty — to be filled as work lands)_

---

## Day 3 — 2026-05-07 (Thursday)

_(empty)_

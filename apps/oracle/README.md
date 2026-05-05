# strongest-oracle (Hack B moonshot — NOT in critical path)

> **Status: scaffold only.** The active re-encryption flow lives in [`packages/openclaw-bridge`](../../packages/openclaw-bridge/) under the **Sealed Inference commitment-binder** pattern (Hack A). This Rust crate is reserved for the optional Day 8-9 stretch goal — a tiny WASM verifier that strengthens the trust model.

## Why this exists

The locked architecture (see `../../../openclaw-0g-hackathon/architecture/inft-design.md`) runs AES-256-GCM in `node:crypto` inside the bridge, then asks 0G Sealed Inference to witness a deterministic JSON commitment. The TEE-born signing key signs the response; the on-chain `Verifier` recovers that address and accepts the transfer. This works without any Rust service.

**Hack B (optional)** tightens the trust model: a tiny Rust→WASM verifier re-checks the AES-GCM tag and the sealed-key encoding against the hashes the LLM committed to. The on-chain `Verifier` could delegate to this WASM check via a precompile or off-chain proof. It would let us tell judges: "Sealed Inference signed the commitment AND a cryptographic verifier checked the math" — a stronger story than commitment alone.

## Hack B scope (if attempted)

```
┌─────────────────────────────────────┐
│ apps/oracle (Rust → WASM)           │
│  - Reads (oldHash, newHash, blob)   │
│  - Recomputes AES-GCM tag w/ K_new  │
│  - Verifies tag matches; emits ✓/✗  │
│  - 1KB WASM, runs in-browser or     │
│    server-side as a separate check  │
└─────────────────────────────────────┘
```

Critical-path test by Day 6 EOD:
- ✅ Bridge re-encryption + Sealed Inference commitment + on-chain Verifier — green → optionally start Hack B
- ❌ Anything red — skip Hack B entirely; ship Hack A alone with the honest README disclosure

## Run (dev — when actually scaffolded)

```bash
cd apps/oracle
cargo run

# Health check
curl http://localhost:8787/health
```

## Endpoints (placeholder; only relevant if Hack B is built)

- `GET  /health`    → `{ ok, version, mode }`
- `POST /verify`    → `{ ok, oldHash, newHash }` (Day 8-9 implementation, NOT shipped by default)

## What's NOT here

- Phala / Marlin / Oasis vendor-specific code (architecture pivot 2026-05-05)
- The Day 7 re-encryption critical path (lives in `packages/openclaw-bridge/`)
- Master key handling (`K_M` lives in the bridge, not here)

The current `src/main.rs` + `Cargo.toml` are leftover stubs from the pre-pivot plan and will be replaced by the WASM verifier crate if Hack B is attempted, or deleted in cleanup if not.

# strongest-oracle

Single-node TEE re-encryption oracle for iNFT transfer.

## Run (dev)

```bash
cd apps/oracle
cargo run

# Health check
curl http://localhost:8787/health
```

## Endpoints

- `GET  /health`    → `{ ok, version, mode }`
- `POST /reencrypt` → `{ new_blob, attestation, ... }` (Day 7 implementation)

## Production deployment

Runs in a Phala Cloud confidential VM (Intel TDX + H100 in CC mode). The master key `K_M` is generated *inside* the TEE and never extractable. Attestation is ECDSA-signed with a TEE-derived key.

Design rationale + threat model: `../../../openclaw-0g-hackathon/architecture/inft-design.md`.

> **Honest disclosure**: this is a **single-node** demo. Production would shard `K_M` across N-of-M TEEs (Phala + Marlin + Oasis) via Shamir Secret Sharing. The on-chain `Verifier` already supports multi-oracle consensus — we register one oracle for the demo.

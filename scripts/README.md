# scripts/

Operational scripts run from the repo root.

| File | Purpose | When |
|---|---|---|
| `deploy-mainnet.sh` | Wrapper that calls `forge script` on Aristotle | Day 4 |
| `mint-reference-agents.ts` | Uploads + mints `dev-orchestrator` and `funding-arb` | Day 4-5 |
| `verify-contracts.sh` | Retries `forge verify-contract` for each address | After deploy |

All scripts read env from the repo root `.env` (copy from `.env.example`).

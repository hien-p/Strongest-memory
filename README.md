# strongest

> **OpenClaw × 0G — Verifiable Agent OS.**
> Every agent is a tradeable, encrypted, royalty-bearing **iNFT (ERC-7857)** with sealed-inference brains, on-chain reputation, and persistent encrypted memory.
> Hackathon submission: **0G APAC Hackathon** — Track 1 (Agentic Infrastructure & OpenClaw Lab). Deadline **May 16 2026 23:59 UTC+8**.

---

## What this repo is

This is the actual code monorepo. The strategy/planning docs (11-day plan, judging criteria map, risk register, demo script, etc.) live one level up in [`../openclaw-0g-hackathon/`](../openclaw-0g-hackathon/).

If you're looking for: read:
- **Why we're building this** — `../openclaw-0g-hackathon/docs/01-strategy.md`
- **What ships in 11 days** — `../openclaw-0g-hackathon/docs/02-product-spec.md`
- **Pinned versions, RPCs, SDKs** — `../openclaw-0g-hackathon/docs/03-tech-stack.md`
- **Day-by-day plan** — `../openclaw-0g-hackathon/plans/11-day-plan.md`
- **Architecture diagrams** — `../openclaw-0g-hackathon/architecture/`

## Layout

```
strongest/
├── apps/
│   ├── web/              Next.js 15 frontend (mint / run / transfer flows)
│   └── oracle/           Rust re-encryption oracle (AES-256-GCM in TEE)
├── packages/
│   ├── contracts/        Foundry workspace (AgentNFT, TEEVerifier, RoyaltyHook)
│   ├── openclaw-bridge/  TS shim that plugs OpenClaw runtime into 0G
│   └── shared-types/     Shared TS types between bridge + web
├── scripts/              Deploy + mint + verify helpers
├── .env.example          Required env vars (copy to .env)
└── package.json          pnpm workspace root
```

## Quick start

```bash
# 1. Install deps (pnpm workspace)
pnpm install

# 2. Copy env template
cp .env.example .env
# Then fill DEPLOYER_PRIVATE_KEY, ZG_COMPUTE_PROVIDER, etc.

# 3. Build contracts (Foundry)
pnpm contracts:build

# 4. Deploy stub contracts to Galileo testnet
pnpm contracts:deploy:galileo

# 5. Run the frontend
pnpm web:dev
```

## Status

Day 1 of 11. See `../openclaw-0g-hackathon/README.md` for the live status tracker.

## Networks

| Network | Chain ID | RPC | Explorer |
|---|---|---|---|
| 0G Aristotle Mainnet (final) | 16661 | `https://evmrpc.0g.ai` | `https://chainscan.0g.ai` |
| 0G Galileo Testnet (dev) | 16602 | `https://evmrpc-testnet.0g.ai` | `https://chainscan-galileo.0g.ai` |

## License

- This repo: MIT (our code)
- Forked ERC-7857 reference (`packages/contracts/`): retains upstream Apache-2.0 from `0glabs/0g-agent-nft`

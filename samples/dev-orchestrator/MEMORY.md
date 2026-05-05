# MEMORY — dev-orchestrator

Accumulated context across sessions. Newest at the bottom. Each entry is a one-line summary so the orchestrator can scan + recall fast.

---

## 2026-04-28 — Session "wagmi v2 SSR migration"
- User migrated from wagmi v1 → v2; ran into hydration mismatch in their Next 14 app.
- Root cause: `useAccount()` reading `address` during SSR before WagmiProvider mounted.
- Fix dispatched to `code-writer`: wrapped reads in `if (typeof window !== 'undefined')` guard.
- Outcome: shipped. User confirmed hydration warning gone.
- Tag: `frontend`, `wagmi`, `ssr`

## 2026-05-01 — Session "Foundry verify on a non-Etherscan chain"
- User trying to `forge verify-contract` on a Blockscout-flavored explorer; default `--verifier etherscan` broken.
- Fix: `--verifier blockscout --verifier-url <chain>/api`. Worked first try.
- Note for future: many alt-EVM chains need this; bookmark the pattern.
- Tag: `foundry`, `verification`, `evm`

## 2026-05-02 — Session "ethers v5 → v6 in a workspace"
- User had `@types/ethers` from v5 era leaking into a v6 import; TS errors on `Signer`.
- Fix: dropped the `@types/ethers` package (v6 ships its own types). Ran `pnpm dedupe`.
- Outcome: typecheck green. Filed lesson: never install `@types/X` for libraries that bundle their own types.
- Tag: `ethers`, `typescript`, `pnpm`

## 2026-05-03 — Session "Pre-commit hook keeps failing on every save"
- User's husky `pre-commit` was running `pnpm lint` across the whole monorepo on every commit.
- Suggested switch to `lint-staged` so only staged files lint.
- Dispatched `code-writer` to wire `lint-staged` config; user accepted.
- Tag: `tooling`, `husky`, `lint-staged`

## 2026-05-04 — Session "0G Storage upload from a browser"
- User hit `fs.appendFileSync is not a function` calling `indexer.download()` from a Vite dev server.
- Confirmed known issue per `@0gfoundation/0g-ts-sdk` README: `indexer.download()` is server-only.
- Workaround: use `StorageNode.downloadSegmentByTxSeq()` and reassemble client-side. Pointed user to the relevant test in the SDK repo.
- Tag: `0g-storage`, `browser`, `sdk-quirks`

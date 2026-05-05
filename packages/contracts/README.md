# @strongest/contracts

ERC-7857 AgentNFT (forked from `0glabs/0g-agent-nft @ eip-7857-draft`) + our `RoyaltyHook` + the upstream `Verifier` (TEE mode). Foundry workspace.

## Layout

```
packages/contracts/
├── src/                         Working tree (modify these)
│   ├── AgentNFT.sol             Forked from upstream — upgradeable ERC-7857
│   ├── interfaces/              IERC7857, IERC7857Metadata, IERC7857DataVerifier
│   ├── verifiers/               Verifier (TEE | ZKP) — upstream
│   ├── proxy/                   BeaconProxy + UpgradeableBeacon re-exports
│   ├── Utils.sol                Upstream
│   └── RoyaltyHook.sol          ✨ Our addition — splits inference fees on-chain
├── script/Deploy.s.sol          Verifier → AgentNFT impl → Beacon → Proxy → Hook
├── test/RoyaltyHook.t.sol       Foundry tests for the royalty split
├── lib/                         OpenZeppelin v5.4.0 + forge-std (forge install)
├── contracts-fork/              Pristine clone of upstream — DO NOT EDIT (gitignored)
├── foundry.toml                 0.8.26 + cancun + 0G RPC endpoints
└── remappings.txt               OZ + forge-std paths
```

## Setup

```bash
# One-time: install forge libs (needs network)
forge install OpenZeppelin/openzeppelin-contracts@v5.4.0 \
              OpenZeppelin/openzeppelin-contracts-upgradeable@v5.4.0 \
              foundry-rs/forge-std

forge build
forge test -vv
```

## Deploy

Set env vars first (see root `.env.example`):

```bash
export DEPLOYER_PRIVATE_KEY=0x...
export PLATFORM_TREASURY=0x...
# Optional:
export ZG_NFT_NAME="strongest Agent NFT"
export ZG_NFT_SYMBOL="STRA"
export BLOCKSCOUT_API_KEY="any-non-empty-string"
```

### Galileo testnet (Day 1 — checkpoint)

```bash
forge script script/Deploy.s.sol \
  --rpc-url galileo \
  --broadcast \
  --verify --verifier blockscout \
  --verifier-url https://chainscan-galileo.0g.ai/api
```

### Aristotle mainnet (Day 4 — checkpoint)

```bash
forge script script/Deploy.s.sol \
  --rpc-url aristotle \
  --broadcast \
  --verify --verifier blockscout \
  --verifier-url https://chainscan.0g.ai/api
```

If `--verify` is flaky, retry per-contract:
```bash
forge verify-contract <ADDR> src/AgentNFT.sol:AgentNFT \
  --chain-id 16661 \
  --verifier blockscout \
  --verifier-url https://chainscan.0g.ai/api
```

## Notes

- Upstream's `AgentNFT` is upgradeable; the script wraps it in a `BeaconProxy` so `initialize()` can run on the proxy (the impl's constructor calls `_disableInitializers`).
- `RoyaltyHook` references an `IAgentNFTRoyalty` interface (`ownerOf`, `getRoyaltyInfo`) that the upstream `AgentNFT` doesn't expose yet. Day-4 work item: extend `AgentNFT` with a per-token `(royaltyReceiver, royaltyBps)` mapping + `getRoyaltyInfo(tokenId)` getter. Until then, `RoyaltyHook` deploys but `payAndRun` will revert against the upstream proxy.
- Cancun EVM is required (`evm_version = "cancun"` in `foundry.toml`). Newer opcodes break on 0G chain.

## License

- Forked code under `src/` retains upstream Apache-2.0 (from `0glabs/0g-agent-nft`).
- `RoyaltyHook.sol` and `Deploy.s.sol`: MIT (ours).

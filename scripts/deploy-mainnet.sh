#!/usr/bin/env bash
set -euo pipefail

# Deploy AgentNFT + Verifier + RoyaltyHook to 0G Aristotle mainnet.
#
# Pre-flight:
#   - DEPLOYER_PRIVATE_KEY funded with ~20 0G on Aristotle (chain 16661)
#   - PLATFORM_TREASURY set
#   - Forge libs installed: pnpm contracts:build

cd "$(dirname "$0")/../packages/contracts"

if [[ -z "${DEPLOYER_PRIVATE_KEY:-}" ]]; then
  echo "DEPLOYER_PRIVATE_KEY not set — source your .env first." >&2
  exit 1
fi
if [[ -z "${PLATFORM_TREASURY:-}" ]]; then
  echo "PLATFORM_TREASURY not set — source your .env first." >&2
  exit 1
fi

echo "→ Deploying to Aristotle mainnet (chain 16661)..."
forge script script/Deploy.s.sol \
  --rpc-url aristotle \
  --broadcast \
  --verify \
  --verifier blockscout \
  --verifier-url https://chainscan.0g.ai/api \
  -vvvv

echo
echo "→ Done. Update .env with the addresses printed above and run scripts/mint-reference-agents.ts."

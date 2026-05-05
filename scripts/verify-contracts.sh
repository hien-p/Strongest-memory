#!/usr/bin/env bash
set -euo pipefail

# Retry forge verify-contract for each deployed address.
# Usage: AGENT_NFT=0x.. VERIFIER=0x.. ROYALTY=0x.. ./verify-contracts.sh [aristotle|galileo]

NETWORK="${1:-aristotle}"
CHAIN_ID=16661
VERIFIER_URL="https://chainscan.0g.ai/api"
if [[ "$NETWORK" == "galileo" ]]; then
  CHAIN_ID=16602
  VERIFIER_URL="https://chainscan-galileo.0g.ai/api"
fi

cd "$(dirname "$0")/../packages/contracts"

verify() {
  local addr="$1" path="$2"
  echo "→ Verifying $path at $addr..."
  for i in 1 2 3 4 5; do
    if forge verify-contract "$addr" "$path" \
        --chain-id "$CHAIN_ID" \
        --verifier blockscout \
        --verifier-url "$VERIFIER_URL"; then
      echo "  ✓ verified"
      return 0
    fi
    echo "  attempt $i failed; retrying in 5s..."
    sleep 5
  done
  echo "  ✗ verify failed after 5 attempts (link source from GitHub in README)"
  return 1
}

[[ -n "${AGENT_NFT:-}" ]]   && verify "$AGENT_NFT"   "src/AgentNFT.sol:AgentNFT"
[[ -n "${VERIFIER:-}" ]]    && verify "$VERIFIER"    "src/verifiers/Verifier.sol:Verifier"
[[ -n "${ROYALTY:-}" ]]     && verify "$ROYALTY"     "src/RoyaltyHook.sol:RoyaltyHook"

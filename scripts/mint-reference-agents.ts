/**
 * Day 4-5: mint the two reference iNFTs on whichever network we deployed to.
 *
 *   1. Bundle each agent's SOUL.md + MEMORY.md + skills/ from /home/claude/agents/
 *   2. Encrypt with K_agent (derived via deriveAgentKey)
 *   3. Upload to 0G Storage Turbo → rootHash
 *   4. Call AgentNFT.mintAgent(rootHash, owner, royaltyReceiver, 500)
 *
 * Run from repo root with: tsx scripts/mint-reference-agents.ts
 */

// Stub — fleshed out on Day 4 when AgentNFT mint signature is finalized.
const REFERENCE_AGENTS = ['dev-orchestrator', 'funding-arb'] as const;

async function main() {
  if (!process.env.AGENT_NFT_ADDRESS) {
    throw new Error('AGENT_NFT_ADDRESS not set — deploy first');
  }
  if (!process.env.DEPLOYER_PRIVATE_KEY) {
    throw new Error('DEPLOYER_PRIVATE_KEY not set');
  }

  for (const name of REFERENCE_AGENTS) {
    // eslint-disable-next-line no-console
    console.log(`→ TODO: bundle, encrypt, upload, mint ${name}`);
  }
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

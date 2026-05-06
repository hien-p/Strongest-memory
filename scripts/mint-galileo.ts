/**
 * Mint reference agent on 0G Galileo Testnet.
 *
 * For the Day-2 demo we skip the 0G Storage upload step and use the
 * keccak256 of the encrypted blob directly as the data hash. The mint
 * still produces a real Transfer(0x0 → owner, tokenId) event on chain
 * 16602; the metrics page will tick from 0 → 1.
 *
 * Honest disclosure: the metadataHash points at a hash we hold locally,
 * not at content stored on the 0G Storage Turbo indexer. Day 3 work item:
 * wire @0gfoundation/0g-ts-sdk and re-mint with a real rootHash.
 *
 * Run from repo root:
 *   DEPLOYER_PRIVATE_KEY=0x... pnpm tsx scripts/mint-galileo.ts dev-orchestrator
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { keccak_256 } from '@noble/hashes/sha3';
import { ethers } from 'ethers';

import {
  deriveAgentKey,
  encryptBundle,
} from '../packages/openclaw-bridge/src/crypto.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '..');

const GALILEO_RPC = 'https://evmrpc-testnet.0g.ai';
const AGENT_NFT = '0x32F18767a2b8773CA76D5D09D2B4339454d46131';

const AGENT_NFT_ABI = [
  'function mint(bytes[] proofs, string[] dataDescriptions, address to) external returns (uint256 tokenId)',
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
];

async function bundleAgent(agentName: string): Promise<Buffer> {
  const dir = path.join(REPO_ROOT, 'samples', agentName);
  const soul = await fs.readFile(path.join(dir, 'SOUL.md')).catch(() => Buffer.alloc(0));
  const memory = await fs.readFile(path.join(dir, 'MEMORY.md')).catch(() => Buffer.alloc(0));
  const skillsDir = path.join(dir, 'skills');
  const skillFiles = await fs.readdir(skillsDir).catch(() => [] as string[]);
  const skills = await Promise.all(
    skillFiles.map((f) => fs.readFile(path.join(skillsDir, f))),
  );
  const sep = Buffer.from('\n---FILE---\n', 'utf8');
  return Buffer.concat([soul, sep, memory, sep, ...skills.flatMap((s) => [s, sep])]);
}

async function main() {
  const agentName = process.argv[2] || 'dev-orchestrator';
  const pk = process.env.DEPLOYER_PRIVATE_KEY;
  if (!pk) throw new Error('DEPLOYER_PRIVATE_KEY env var required');

  console.log(`→ bundling samples/${agentName}/...`);
  const plaintext = await bundleAgent(agentName);
  console.log(`  plaintext: ${plaintext.length} bytes`);

  // Derive a per-agent key. tokenId is unknown until mint; use 1 as a
  // placeholder for the demo since this is the first mint.
  const presumedTokenId = 1n;

  const provider = new ethers.JsonRpcProvider(GALILEO_RPC);
  const wallet = new ethers.Wallet(pk, provider);
  const masterKey = Buffer.from('master-key-demo-only-rotate-in-prod-aaaaaaaaaaaa', 'utf8');
  const padded = Buffer.alloc(32);
  masterKey.copy(padded);

  const kAgent = deriveAgentKey({
    tokenId: presumedTokenId,
    ownerAddress: wallet.address,
    masterKey: padded,
  });
  const { blob: ciphertext } = encryptBundle(plaintext, agentName, kAgent);
  console.log(`  ciphertext: ${ciphertext.length} bytes`);

  const dataHash = '0x' + Buffer.from(keccak_256(ciphertext)).toString('hex');
  console.log(`  dataHash:   ${dataHash}`);

  console.log(`→ minting on Galileo as ${wallet.address}...`);
  const nft = new ethers.Contract(AGENT_NFT, AGENT_NFT_ABI, wallet);

  const tx = await nft.mint(
    [dataHash], // proofs[] — Verifier.verifyPreimage expects raw 32-byte data hashes
    [`${agentName} agent bundle (SOUL + MEMORY + skills)`],
    wallet.address,
    {
      maxFeePerGas: 5_000_000_000n,         // 5 gwei
      maxPriorityFeePerGas: 3_000_000_000n, // 3 gwei tip (Galileo min is 2)
    } as ethers.Overrides,
  );
  console.log(`  tx hash:    ${tx.hash}`);
  console.log(`  explorer:   https://chainscan-galileo.0g.ai/tx/${tx.hash}`);

  const receipt = await tx.wait();
  if (!receipt) throw new Error('no receipt');

  // ERC-7857 emits Minted(_tokenId, _creator, _owner, ...) — not the
  // standard ERC-721 Transfer.
  const mintedTopic = ethers.id('Minted(uint256,address,address,bytes32[],string[])');
  const mintedLog = receipt.logs.find(
    (l) =>
      l.address.toLowerCase() === AGENT_NFT.toLowerCase() &&
      l.topics[0] === mintedTopic,
  );
  if (!mintedLog) throw new Error('no Minted event in receipt');
  const tokenId = BigInt(mintedLog.topics[1]!);
  console.log(`  tokenId:    ${tokenId}`);
  console.log(`  block:      ${receipt.blockNumber}`);
  console.log(`  gas used:   ${receipt.gasUsed}`);
  console.log('');
  console.log('✅ Minted. /metrics will show 1 mint on next 30s poll.');
  console.log('');
  console.log('Add to README:');
  console.log(`  Reference agent: ${agentName} → tokenId=${tokenId}`);
  console.log(`    https://chainscan-galileo.0g.ai/tx/${tx.hash}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

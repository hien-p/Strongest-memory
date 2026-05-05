/**
 * Maps agent names ↔ iNFT tokenIds via either:
 *  - the SPACE ID `.0g` resolver (agentName.0g → tokenId), or
 *  - a local index.json fallback (agents/index.json) for dev.
 *
 * Spec: ../../../openclaw-0g-hackathon/architecture/openclaw-bridge.md (inft-registry.ts)
 */

import { promises as fs } from 'node:fs';
import path from 'node:path';
import { Contract, type JsonRpcProvider } from 'ethers';

const AGENT_NFT_ABI = [
  'function ownerOf(uint256 tokenId) external view returns (address)',
  'function dataHashesOf(uint256 tokenId) external view returns (bytes32[])',
];

export interface INFTRegistryOptions {
  agentNFTAddress: string;
  provider: JsonRpcProvider;
  /** Optional path to a local index.json mapping agentName → tokenId. */
  localIndexPath?: string;
  /** Optional SPACE ID resolver — Day 5 work item. */
  spaceIdResolver?: { resolve(name: string): Promise<bigint | null> };
}

export class INFTRegistry {
  private readonly nft: Contract;
  private localCache: Map<string, bigint> | null = null;

  constructor(private readonly opts: INFTRegistryOptions) {
    this.nft = new Contract(opts.agentNFTAddress, AGENT_NFT_ABI, opts.provider);
  }

  async getTokenIdForAgent(agentName: string): Promise<bigint | null> {
    if (this.opts.spaceIdResolver) {
      const id = await this.opts.spaceIdResolver.resolve(`${agentName}.0g`);
      if (id) return id;
    }
    if (this.opts.localIndexPath) {
      const cache = await this.loadLocal();
      return cache.get(agentName) ?? null;
    }
    return null;
  }

  async getOwnerOf(tokenId: bigint): Promise<string> {
    return (await this.nft.ownerOf(tokenId)) as string;
  }

  private async loadLocal(): Promise<Map<string, bigint>> {
    if (this.localCache) return this.localCache;
    const raw = await fs.readFile(path.resolve(this.opts.localIndexPath!), 'utf8');
    const obj = JSON.parse(raw) as Record<string, string | number>;
    this.localCache = new Map(Object.entries(obj).map(([k, v]) => [k, BigInt(v)]));
    return this.localCache;
  }
}

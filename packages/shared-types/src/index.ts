/** Identifier of an OpenClaw agent within the runtime (e.g. "dev-orchestrator"). */
export type AgentName = string;

/** ERC-7857 token id, as a bigint to match ethers v6. */
export type TokenId = bigint;

/** Sealed Inference RA report shape (subset — broker docs are still settling). */
export interface AttestationReport {
  chatId: string;
  signature: string;
  raw: unknown;
}

/** Per-agent metadata stored on-chain (mirrors AgentNFT.TokenData + our royalty fields). */
export interface AgentMetadata {
  tokenId: TokenId;
  owner: string;
  dataHashes: string[];
  royaltyReceiver: string;
  royaltyBps: number;
}

/** 0G network configuration consumed by both the bridge and the web app. */
export interface ZGNetwork {
  chainId: number;
  rpcUrl: string;
  explorerUrl: string;
  name: 'aristotle' | 'galileo';
}

export const ZG_ARISTOTLE: ZGNetwork = {
  chainId: 16661,
  rpcUrl: 'https://evmrpc.0g.ai',
  explorerUrl: 'https://chainscan.0g.ai',
  name: 'aristotle',
};

export const ZG_GALILEO: ZGNetwork = {
  chainId: 16602,
  rpcUrl: 'https://evmrpc-testnet.0g.ai',
  explorerUrl: 'https://chainscan-galileo.0g.ai',
  name: 'galileo',
};

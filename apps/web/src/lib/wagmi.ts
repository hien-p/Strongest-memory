import { defineChain } from 'viem';
import { getDefaultConfig } from '@rainbow-me/rainbowkit';

export const aristotle = defineChain({
  id: 16661,
  name: '0G Aristotle',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc.0g.ai'] } },
  blockExplorers: { default: { name: 'chainscan', url: 'https://chainscan.0g.ai' } },
});

export const galileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } },
  blockExplorers: { default: { name: 'chainscan-galileo', url: 'https://chainscan-galileo.0g.ai' } },
  testnet: true,
});

export const wagmiConfig = getDefaultConfig({
  appName: 'strongest',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID ?? 'replace-me',
  chains: [aristotle, galileo],
  ssr: true,
});

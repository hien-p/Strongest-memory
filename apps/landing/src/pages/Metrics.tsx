import { useEffect, useState } from 'react';
import { createPublicClient, http, defineChain, formatEther, parseAbiItem } from 'viem';
import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

// Galileo testnet (chain 16602). Will switch to Aristotle (16661) at the
// Day 4 mainnet checkpoint.
const galileo = defineChain({
  id: 16602,
  name: '0G Galileo Testnet',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc-testnet.0g.ai'] } },
  blockExplorers: { default: { name: 'chainscan-galileo', url: 'https://chainscan-galileo.0g.ai' } },
  testnet: true,
});

// Deployed 2026-05-06 on Galileo via forge script Deploy.s.sol.
const AGENT_NFT = '0x32F18767a2b8773CA76D5D09D2B4339454d46131' as const;
const ROYALTY = '0xf7bd5BF8DbF796Ae3c2aBce5616bF181c9456cAa' as const;
const CHAIN = galileo;

// ERC-7857 has its own event names (Minted / Transferred) that don't match
// the standard ERC-721 Transfer signature.
const MINTED = parseAbiItem(
  'event Minted(uint256 indexed _tokenId, address indexed _creator, address indexed _owner, bytes32[] _dataHashes, string[] _dataDescriptions)',
);
const TRANSFERRED = parseAbiItem(
  'event Transferred(uint256 _tokenId, address indexed _from, address indexed _to)',
);
const RUN = parseAbiItem(
  'event InferenceRun(uint256 indexed tokenId, address indexed runner, uint256 fee, uint256 royaltyPaid, address royaltyReceiver)',
);

interface Stats {
  mints: number;
  transfers: number;
  runs: number;
  royalty: bigint;
}

export default function Metrics() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [status, setStatus] = useState('Connecting…');
  const [statusKind, setStatusKind] = useState<'live' | 'warn' | 'bad'>('live');

  useEffect(() => {
    const client = createPublicClient({ chain: CHAIN, transport: http() });

    async function refresh() {
      try {
        const [mintLogs, transferLogs, royaltyLogs] = await Promise.all([
          client.getLogs({ address: AGENT_NFT, event: MINTED, fromBlock: 0n }),
          client.getLogs({ address: AGENT_NFT, event: TRANSFERRED, fromBlock: 0n }),
          client.getLogs({ address: ROYALTY, event: RUN, fromBlock: 0n }),
        ]);
        const royalty = royaltyLogs.reduce((acc, l) => acc + (l.args.royaltyPaid ?? 0n), 0n);
        setStats({
          mints: mintLogs.length,
          transfers: transferLogs.length,
          runs: royaltyLogs.length,
          royalty,
        });
        setStatus(`Live — last fetched ${new Date().toLocaleTimeString()}`);
        setStatusKind('live');
      } catch (err) {
        setStatus('RPC error: ' + (err instanceof Error ? err.message : String(err)));
        setStatusKind('bad');
      }
    }
    refresh();
    const id = setInterval(refresh, 30_000);
    return () => clearInterval(id);
  }, []);

  return (
    <Layout>
      <RouteBackground variant="metrics" />
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Live metrics</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Counters fetched directly from the Galileo testnet <code className="rb-code">AgentNFT</code> +{' '}
            <code className="rb-code">RoyaltyHook</code> contracts via the 0G RPC. No centralized indexer; the page
            reads <code className="rb-code">Transfer</code> and <code className="rb-code">InferenceRun</code> events
            and aggregates client-side. Block explorer:{' '}
            <a
              href={`https://chainscan-galileo.0g.ai/address/${AGENT_NFT}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              AgentNFT
            </a>{' '}·{' '}
            <a
              href={`https://chainscan-galileo.0g.ai/address/${ROYALTY}`}
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              RoyaltyHook
            </a>.
          </p>
        </header>

        <div className="mb-6 flex items-center text-sm text-white/65">
          <span className={`rb-live-dot rb-live-${statusKind}`} />
          <span>{status}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Agents minted" value={stats?.mints} sub="ERC-7857 iNFTs on Galileo" />
          <Stat label="Transfers" value={stats?.transfers} sub="re-encryption flows completed" />
          <Stat label="Inference calls" value={stats?.runs} sub="Sealed Inference w/ RA report" />
          <Stat
            label="Royalties paid"
            value={stats ? Number(formatEther(stats.royalty)).toFixed(4) + ' 0G' : undefined}
            sub="total 0G routed to creators"
          />
        </div>

        <section className="rb-card mt-6 text-sm leading-relaxed text-white/65">
          <strong className="text-white">Where the numbers come from.</strong>{' '}
          <code className="rb-code">AgentNFT.Minted(_tokenId, _creator, _owner, ...)</code> on Galileo (chain 16602)
          counts mints. <code className="rb-code">AgentNFT.Transferred(_tokenId, _from, _to)</code> counts re-encryption
          flows. <code className="rb-code">RoyaltyHook.InferenceRun</code> counts paid inference calls and totals
          creator royalties (5% of each fee). Both queried via <code className="rb-code">viem</code>'s{' '}
          <code className="rb-code">getLogs</code> against <code className="rb-code">https://evmrpc-testnet.0g.ai</code>;
          refresh every 30s.
        </section>
      </main>
    </Layout>
  );
}

function Stat({ label, value, sub }: { label: string; value?: number | string; sub: string }) {
  return (
    <div className="rb-stat">
      <div className="rb-label">{label}</div>
      <div className="rb-stat-value">{value === undefined ? '—' : typeof value === 'number' ? value.toLocaleString() : value}</div>
      <div className="mt-1 text-xs text-white/50">{sub}</div>
    </div>
  );
}

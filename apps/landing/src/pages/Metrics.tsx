import { useEffect, useState } from 'react';
import { createPublicClient, http, defineChain, formatEther, parseAbiItem } from 'viem';
import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

const aristotle = defineChain({
  id: 16661,
  name: '0G Aristotle',
  nativeCurrency: { name: '0G', symbol: '0G', decimals: 18 },
  rpcUrls: { default: { http: ['https://evmrpc.0g.ai'] } },
});

const AGENT_NFT = '0x0000000000000000000000000000000000000000' as const;
const ROYALTY = '0x0000000000000000000000000000000000000000' as const;
const ZERO = '0x0000000000000000000000000000000000000000' as const;

const TRANSFER = parseAbiItem(
  'event Transfer(address indexed from, address indexed to, uint256 indexed tokenId)',
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
    if (AGENT_NFT === ZERO) {
      setStatus('Contracts not yet deployed on Aristotle. Counters go live on Day 4.');
      setStatusKind('warn');
      return;
    }
    const client = createPublicClient({ chain: aristotle, transport: http() });

    async function refresh() {
      try {
        const [mintLogs, allTransfers, royaltyLogs] = await Promise.all([
          client.getLogs({ address: AGENT_NFT, event: TRANSFER, args: { from: ZERO }, fromBlock: 0n }),
          client.getLogs({ address: AGENT_NFT, event: TRANSFER, fromBlock: 0n }),
          client.getLogs({ address: ROYALTY, event: RUN, fromBlock: 0n }),
        ]);
        const royalty = royaltyLogs.reduce((acc, l) => acc + (l.args.royaltyPaid ?? 0n), 0n);
        setStats({
          mints: mintLogs.length,
          transfers: allTransfers.length - mintLogs.length,
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
            Counters fetched directly from the Aristotle <code className="rb-code">AgentNFT</code> +{' '}
            <code className="rb-code">RoyaltyHook</code> contracts via a public 0G RPC endpoint. No centralized indexer;
            the page reads <code className="rb-code">Transfer</code> and <code className="rb-code">InferenceRun</code>{' '}
            events and aggregates client-side.
          </p>
        </header>

        <div className="mb-6 flex items-center text-sm text-white/65">
          <span className={`rb-live-dot rb-live-${statusKind}`} />
          <span>{status}</span>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Stat label="Agents minted" value={stats?.mints} sub="ERC-7857 iNFTs on Aristotle" />
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
          <code className="rb-code">AgentNFT.Transfer(from, to, tokenId)</code> on Aristotle (chain 16661) — counts
          mints (when <code className="rb-code">from = 0x0</code>) and transfers (otherwise).{' '}
          <code className="rb-code">RoyaltyHook.InferenceRun</code> counts paid inference calls and totals creator
          royalties. Both queried via <code className="rb-code">viem</code>'s <code className="rb-code">getLogs</code>{' '}
          against <code className="rb-code">https://evmrpc.0g.ai</code>; refresh every 30s.
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

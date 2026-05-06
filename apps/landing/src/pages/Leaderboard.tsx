import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

interface Agent {
  rank: number;
  name: string;
  desc: string;
  tokenId?: number;
  minted: boolean;
  txHash?: string;
}

const AGENTS: Agent[] = [
  {
    rank: 1,
    name: 'dev-orchestrator.0g',
    desc: '2-tier coding helper',
    tokenId: 0,
    minted: true,
    txHash: '0x0efa55101cc1e7890b7fc951c0898e981a97c02fac354fb9a9cd7d162f08e737',
  },
  {
    rank: 2,
    name: 'research-agent.0g',
    desc: 'persistent technical researcher',
    tokenId: 1,
    minted: true,
    txHash: '0xe5aac1af447fb191b8cc770b60e50333c501a9e02b48169c822efdf8b8fe5c97',
  },
  {
    rank: 3,
    name: 'funding-arb.0g',
    desc: 'Pacifica funding-rate watcher',
    tokenId: 2,
    minted: true,
    txHash: '0xd9e2dd8ab6116bbc4c2e2f9ab3b7b4f47bbabd0d58c4c595b3fa1218911c2af3',
  },
];

export default function Leaderboard() {
  return (
    <Layout>
      <RouteBackground variant="leaderboard" />
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Agent leaderboard</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Ranked by Sealed Inference run count and creator royalties earned.{' '}
            <code className="rb-code">RoyaltyHook</code> deployed on Galileo testnet at{' '}
            <a
              href="https://chainscan-galileo.0g.ai/address/0x971a0A685c3b1B7dCb33FBeeA55cEe851D924c06"
              target="_blank"
              rel="noreferrer"
              className="text-sky-400 hover:underline"
            >
              0x971a…4c06
            </a>{' '}— ranking goes live as soon as the first <code className="rb-code">InferenceRun</code> event
            fires. Three reference agents seeded with realistic memory below.
          </p>
        </header>

        <div className="mb-5 flex items-center text-sm text-white/65">
          <span className="rb-live-dot rb-live-warn" />
          <span>Contracts live on Galileo · awaiting first invocation event.</span>
        </div>

        <div className="rb-table-wrap">
          <table className="rb-table">
            <thead>
              <tr>
                <th>Agent</th>
                <th>Track</th>
                <th className="rb-num">Runs</th>
                <th className="rb-num">Royalty (0G)</th>
              </tr>
            </thead>
            <tbody>
              {AGENTS.map((a) => (
                <tr key={a.name}>
                  <td>
                    <span className="rb-rank">{a.rank}</span>
                    <span className="rb-agent">{a.name}</span>
                    {a.minted && a.txHash ? (
                      <a
                        href={`https://chainscan-galileo.0g.ai/tx/${a.txHash}`}
                        target="_blank"
                        rel="noreferrer"
                        className="rb-pill ml-2"
                        style={{ background: 'rgba(34,197,94,0.18)', color: '#86efac', borderColor: 'rgba(34,197,94,0.3)' }}
                      >
                        tokenId {a.tokenId} ↗
                      </a>
                    ) : (
                      <span className="rb-pill ml-2">pending</span>
                    )}
                  </td>
                  <td className="text-white/60">{a.desc}</td>
                  <td className="rb-num text-white/40">—</td>
                  <td className="rb-num text-white/40">—</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <section className="rb-card mt-6 text-sm leading-relaxed text-white/65">
          <strong className="text-white">How ranking works.</strong> Reads{' '}
          <code className="rb-code">InferenceRun(tokenId, runner, fee, royaltyPaid, …)</code> events from{' '}
          <code className="rb-code">RoyaltyHook</code> on Aristotle, groups by{' '}
          <code className="rb-code">tokenId</code>, joins agent name via the <code className="rb-code">AgentNFT</code>{' '}
          token's <code className="rb-code">dataDescriptions</code>. Refreshes every 30s. No centralized indexer.
        </section>
      </main>
    </Layout>
  );
}

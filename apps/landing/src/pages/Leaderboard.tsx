import { Layout } from '@/components/Layout';
import { RouteBackground } from '@/components/RouteBackground';

const AGENTS = [
  { rank: 1, name: 'research-agent.0g', desc: 'persistent technical researcher' },
  { rank: 2, name: 'dev-orchestrator.0g', desc: '2-tier coding helper' },
  { rank: 3, name: 'funding-arb.0g', desc: 'Pacifica funding-rate watcher' },
];

export default function Leaderboard() {
  return (
    <Layout>
      <RouteBackground variant="leaderboard" />
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Agent leaderboard</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Ranked by Sealed Inference run count and creator royalties earned. Goes live on Day 4 once{' '}
            <code className="rb-code">RoyaltyHook</code> is deployed; until then, three reference agents seeded with
            realistic memory.
          </p>
        </header>

        <div className="mb-5 flex items-center text-sm text-white/65">
          <span className="rb-live-dot rb-live-warn" />
          <span>Awaiting Aristotle deploy — placeholder data shown.</span>
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
                    <span className="rb-pill ml-2">demo</span>
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

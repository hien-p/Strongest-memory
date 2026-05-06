import { Layout } from '@/components/Layout';

type Tag = 'feat' | 'fix' | 'chore' | 'docs' | 'refactor';

interface Entry {
  date: string;
  tag: Tag;
  title: string;
  /** HTML — keep <code> blocks intact. */
  body: string;
}

const ENTRIES: Entry[] = [
  {
    date: '2026-05-06',
    tag: 'refactor',
    title: 'SPA conversion: every route is now React + React Bits Pro',
    body:
      'The static <code>/verify</code>, <code>/metrics</code>, <code>/leaderboard</code>, <code>/logs</code> pages were vanilla HTML — couldn\'t use React Bits Pro shaders, animated cursors, or motion components. Converted everything to a single React Router SPA inside <code>apps/landing</code>: <code>src/pages/{Home,Verify,Metrics,Leaderboard,Logs}.tsx</code>, shared <code>Layout</code> wrapper with the <code>SilkWaves</code> WebGL background fixed behind every page, top-nav with active-route underline, footer pinned. The <code>_redirects</code> file at <code>apps/web/_redirects</code> tells Cloudflare Pages to serve <code>index.html</code> for unknown paths so React Router takes over. Dropped the static sub-pages and the <code>serveStaticSubRoutes</code> Vite middleware.',
  },
  {
    date: '2026-05-06',
    tag: 'feat',
    title: 'React Bits Pro skill + 4 components installed',
    body:
      'Saved skill at <code>~/.claude/skills/react-bits-pro/SKILL.md</code>, configured shadcn registry in <code>apps/landing/components.json</code> with both <code>@reactbits-starter</code> + <code>@reactbits-pro</code> registries authenticated via <code>${REACTBITS_LICENSE_KEY}</code> in <code>.env.local</code>. Installed: <code>silk-waves</code> (WebGL animated background), <code>glitch-text</code> (canvas-based sticky glitch on the hero), <code>glass-cursor</code> (metaball glass cursor with refraction), <code>animated-list</code>. Added <code>react-router-dom</code>, <code>viem</code>, <code>@types/three</code> as deps; <code>three</code> + <code>@react-three/fiber</code> + <code>motion</code> were auto-resolved by the registry.',
  },
  {
    date: '2026-05-06',
    tag: 'refactor',
    title: 'Sub-routes redesigned to match the landing\'s dark/VHS aesthetic',
    body:
      'Before: <code>/verify</code>, <code>/metrics</code>, <code>/leaderboard</code>, <code>/logs</code> looked like generic Tailwind starter pages — light cream background, no top nav, no brand. Disconnected from the landing. Now: shared design system with Inter + Instrument Serif + JetBrains Mono fonts, dark color tokens, subtle scanline overlay, sky-blue radial spotlight, RGB-glitch text-shadow on page titles + brand mark. Every sub-page got the same top nav with active-route underline + footer with the Velorah® mark.',
  },
  {
    date: '2026-05-06',
    tag: 'refactor',
    title: 'Landing reborn as a full-bleed website (no more 600×800 card)',
    body:
      'The original spec described a 3:4 social-card frame — great for an Instagram post, wrong for a hackathon submission URL judges will scroll. Refactored to a real website: video + VHS overlays cover the whole viewport, top nav, hero with new headline (<em>"Own the brain, not the receipt."</em>) and revised body copy ending with <em>"ERC-7857 iNFTs that hold the brain — not just a token."</em>',
  },
  {
    date: '2026-05-06',
    tag: 'feat',
    title: 'Vite dev middleware: sub-routes work locally too',
    body:
      'Clicking <code>/verify</code> / <code>/metrics</code> / <code>/leaderboard</code> / <code>/logs</code> on <code>localhost:5174</code> used to fall back to the SPA index — only production at <code>strongest.pages.dev</code> served those static pages. New <code>serveStaticSubRoutes</code> Vite plugin in <code>vite.config.ts</code> intercepts those URL prefixes during dev and reads from <code>apps/web/&lt;subdir&gt;/index.html</code>. (Now obsolete — superseded by SPA conversion above.)',
  },
  {
    date: '2026-05-05',
    tag: 'fix',
    title: 'Landing: responsive frame + functional Begin Journey + sub-page nav',
    body:
      'Two real bugs and one missing wire-up: the 600×800 frame overflowed any viewport shorter than ~860px, and the <code>-mt-[180px]</code> fixed-pixel content offset broke when the frame shrank. Replaced with responsive width + <code>aspect-[3/4]</code> + container queries. <strong>Begin Journey</strong> now links to <code>/verify</code>.',
  },
  {
    date: '2026-05-05',
    tag: 'docs',
    title: 'Landing subtext: from generic Velorah copy → strongest-aligned',
    body:
      'The placeholder subtext on the VHS card ("deep thinkers, bold creators, quiet rebels…") didn\'t say what the project actually does. Replaced with copy that names the three primitives and ends on a quotable line.',
  },
  {
    date: '2026-05-05',
    tag: 'refactor',
    title: 'Migrated to Cloudflare Pages → strongest.pages.dev',
    body:
      'The <code>*.workers.dev</code> URL bakes the account subdomain into every URL (<code>strongest.phanhoangvinhhien.workers.dev</code> = 46 chars). Dashboard rename is one-shot, API rejected with <code>code 10036</code>. Migrated to Cloudflare Pages — clean <code>strongest.pages.dev</code> namespace, 21 chars.',
  },
  {
    date: '2026-05-05',
    tag: 'fix',
    title: 'CI Deploy: pin wrangler as a root devDep so the action skips its self-install',
    body:
      'First deploy after the React-landing rewire failed: <code>wrangler-action@v3</code> tried <code>pnpm add wrangler@3.90.0</code> and pnpm refused with <code>ERR_PNPM_ADDING_TO_ROOT</code> (workspace roots need <code>-w</code>). Added wrangler as a workspace-root devDependency.',
  },
  {
    date: '2026-05-05',
    tag: 'feat',
    title: 'VHS-aesthetic React landing (Vite + Tailwind v4) replaces static index',
    body:
      'New <code>apps/landing/</code> workspace: Vite + React 19 + TS + Tailwind v4. Looping CloudFront video, animated SVG fractal-noise overlay, repeating scanline gradient, sweeping VHS glitch bar, RGB text-shadow glitch, liquid-glass button with mask-composite border ring. Vite outputs to <code>apps/landing/dist/</code> (gitignored); deploy workflow copies into <code>apps/web/</code>.',
  },
  {
    date: '2026-05-05',
    tag: 'docs',
    title: 'README: Vision + TAM + four-pillar differentiator section',
    body:
      'Added a Vision/Market section ($50.31B AI agents TAM by 2030 per GVR; 45.8% CAGR) and a "How we differentiate" table calling out the four pillars: working royalty hook (16 Foundry tests, 256-run fuzz), transfer with memory persistence, live on-chain metrics + attestation viewer, and Sealed Inference as commitment-binder.',
  },
  {
    date: '2026-05-05',
    tag: 'feat',
    title: 'Test suite: 35 passing tests across TS + Solidity',
    body:
      'Added vitest in <code>packages/openclaw-bridge/</code>: 13 tests for crypto.ts (HKDF determinism, AES round-trip, magic+version invariants, tamper detection, AAD binding) + 6 tests for reencrypt-commitment.ts. Expanded RoyaltyHook.t.sol from 4 → 11 tests including a 256-run fuzz. New Integration.t.sol (5 tests) deploys the full Verifier → AgentNFT impl → BeaconProxy → RoyaltyHook chain.',
  },
  {
    date: '2026-05-05',
    tag: 'feat',
    title: 'Three reference agents under samples/',
    body:
      '<code>dev-orchestrator</code> (coding helper that routes to specialist sub-agents), <code>funding-arb</code> (Pacifica perp funding-rate watcher with calibrated user threshold), and <code>research-agent</code> (persistent technical researcher with citation memory — anchors the transfer-with-memory demo).',
  },
  {
    date: '2026-05-05',
    tag: 'feat',
    title: 'Architecture locked: Sealed Inference as commitment-binder (Hack A)',
    body:
      'Two parallel research agents: option A (custom 0G Service Provider) is infeasible (closed <code>serviceType</code> enum, LLM-only proxy, dstack-only verifier, 3-6 week timeline). Option B naive (LLM does AES) is broken by FP non-associativity. <strong>Hack A wins:</strong> AES math runs in <code>node:crypto</code>; Sealed Inference signs a deterministic 200-byte JSON commitment whose signature binds (req, res, chatID) to the enclave-born key.',
  },
  {
    date: '2026-05-05',
    tag: 'chore',
    title: 'Initial monorepo scaffold',
    body:
      'pnpm workspace with <code>apps/oracle</code> (Rust scaffold for Hack B moonshot), <code>packages/contracts</code> (Foundry workspace, AgentNFT forked from <code>0glabs/0g-agent-nft@eip-7857-draft</code> + new <code>RoyaltyHook</code> contract with passing tests), <code>packages/openclaw-bridge</code> (TS shim — LLM gateway, state sync, royalty client, iNFT registry, AES-256-GCM crypto), <code>packages/shared-types</code> (0G chain configs).',
  },
];

const TAG_BG: Record<Tag, string> = {
  feat: 'rgba(37,99,235,0.85)',
  fix: 'rgba(220,38,38,0.85)',
  chore: 'rgba(107,114,128,0.85)',
  docs: 'rgba(22,163,74,0.85)',
  refactor: 'rgba(147,51,234,0.85)',
};

export default function Logs() {
  return (
    <Layout>
      <main className="relative mx-auto max-w-[880px] px-6 pb-20 pt-8 sm:px-10">
        <header className="mb-8">
          <h1 className="font-serif text-4xl font-normal tracking-tight rgb-text-glitch">Devlog</h1>
          <p className="mt-3 max-w-prose text-sm leading-relaxed text-white/65">
            Every commit that lands on <code className="rb-code">main</code> adds a card here. Newest at the top. The{' '}
            <code className="rb-code">pre-push</code> git hook nudges if the file isn't touched in the pushed range.
          </p>
        </header>

        <div className="flex flex-col gap-3">
          {ENTRIES.map((e, i) => (
            <article
              key={i}
              className="rb-card transition-colors hover:border-white/16"
            >
              <header className="mb-2 flex items-center gap-3 text-sm">
                <time className="text-white/55 font-mono tabular-nums">{e.date}</time>
                <span
                  className="rb-pill"
                  style={{ background: TAG_BG[e.tag], color: 'white' }}
                >
                  {e.tag}
                </span>
              </header>
              <h3 className="mb-1.5 text-lg font-semibold text-white">{e.title}</h3>
              <p
                className="text-[0.94rem] leading-[1.65] text-white/65"
                dangerouslySetInnerHTML={{ __html: e.body }}
              />
            </article>
          ))}
        </div>
      </main>
    </Layout>
  );
}

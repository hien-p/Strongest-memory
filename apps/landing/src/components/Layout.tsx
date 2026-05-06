import { type ReactNode, lazy, Suspense } from 'react';
import { NavLink, Link } from 'react-router-dom';

// Heavy WebGL components — lazy-loaded so the initial paint isn't blocked
// by the three.js bundle.
const SilkWaves = lazy(() => import('@/components/react-bits/silk-waves'));
const GlassCursor = lazy(() => import('@/components/react-bits/glass-cursor'));

const NAV = [
  { to: '/verify', label: 'verify' },
  { to: '/metrics', label: 'metrics' },
  { to: '/leaderboard', label: 'leaderboard' },
  { to: '/logs', label: 'devlog' },
] as const;

export interface LayoutProps {
  children: ReactNode;
  /** Hide the WebGL background on pages that supply their own. */
  hideBackground?: boolean;
  /** Optional content rendered above the top nav (full-width edge-to-edge). */
  topBanner?: ReactNode;
}

export function Layout({ children, hideBackground = false, topBanner }: LayoutProps) {
  return (
    <div className="relative min-h-screen w-full overflow-x-hidden text-white">
      {/* SilkWaves — fixed full-viewport background. The body owns the
          dark base color (set in index.css) so this canvas isn't obscured
          by an opaque ancestor's background. */}
      {!hideBackground && (
        <div className="fixed inset-0 z-0" aria-hidden="true">
          <Suspense fallback={null}>
            <SilkWaves
              speed={0.45}
              scale={2.2}
              colors={[
                '#06060f', '#0d1024', '#131c3e', '#1a2655',
                '#23316f', '#2d3e8a', '#3d57b5', '#0ea5e9',
              ]}
              opacity={0.85}
              brightness={0.95}
              className="h-full w-full"
            />
          </Suspense>
          {/* Vignette so headline text remains legible. */}
          <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_30%,transparent,rgba(0,0,0,0.55)_70%)]" />
        </div>
      )}

      {/* Subtle scanlines for VHS feel — pure CSS, sits above bg, below content. */}
      <div
        className="pointer-events-none fixed inset-0 z-10 opacity-25 mix-blend-overlay"
        aria-hidden="true"
        style={{
          backgroundImage:
            'repeating-linear-gradient(to bottom, transparent 0, transparent 2px, rgba(255,255,255,0.06) 2px, rgba(255,255,255,0.06) 4px)',
        }}
      />

      {/* Glass cursor — metaball trail with refraction. Lazy-loaded; client-only. */}
      <Suspense fallback={null}>
        <GlassCursor />
      </Suspense>

      {/* ── Optional full-bleed top banner (e.g. hackathon) ── */}
      {topBanner && <div className="relative z-30 w-full">{topBanner}</div>}

      {/* ── Top nav ── */}
      <header className="relative z-30 mx-auto flex max-w-[1280px] items-center justify-between px-6 py-5 sm:px-10">
        <Link
          to="/"
          className="font-serif text-xl tracking-tight"
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            textShadow: '-1px 0 0 rgba(255,0,0,0.45), 1px 0 0 rgba(0,255,255,0.45)',
          }}
        >
          strongest<span className="text-sky-400">.</span>
        </Link>
        <nav className="hidden items-center gap-6 text-sm text-white/70 sm:flex">
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                isActive
                  ? 'text-white border-b border-sky-400 pb-0.5 transition-colors'
                  : 'hover:text-white transition-colors'
              }
            >
              {item.label}
            </NavLink>
          ))}
          <a
            href="https://github.com/hien-p/Strongest-memory"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            github
          </a>
        </nav>
        <nav className="flex items-center gap-3 text-xs text-white/60 sm:hidden">
          {NAV.slice(0, 3).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => (isActive ? 'text-white' : 'hover:text-white')}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      {/* ── Page content ── */}
      <div className="relative z-20">{children}</div>

      {/* ── Footer ── */}
      <footer className="relative z-20 mx-auto mt-16 flex max-w-[1280px] flex-col items-start justify-between gap-3 border-t border-white/8 px-6 py-7 text-xs text-white/50 sm:flex-row sm:items-center sm:px-10">
        <span
          style={{
            fontFamily: "'Instrument Serif', Georgia, serif",
            fontSize: '1.05rem',
            color: 'rgba(255,255,255,0.7)',
            textShadow: '-1px 0 0 rgba(255,0,0,0.35), 1px 0 0 rgba(0,255,255,0.35)',
          }}
        >
          Velorah<sup className="text-[0.55em] ml-0.5 align-super opacity-70">®</sup>
        </span>
        <span>
          0G APAC Hackathon · deadline 2026-05-16 ·{' '}
          <a href="https://strongest.pages.dev" className="text-sky-400 hover:underline">
            strongest.pages.dev
          </a>
        </span>
      </footer>
    </div>
  );
}

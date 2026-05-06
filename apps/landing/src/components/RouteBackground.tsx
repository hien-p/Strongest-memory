import { lazy, Suspense } from 'react';

// Heavy components — only load when the route mounts.
const AuroraBlur = lazy(() => import('@/components/react-bits/aurora-blur'));
const HalftoneWave = lazy(() => import('@/components/react-bits/halftone-wave'));
const ColorLoops = lazy(() => import('@/components/react-bits/color-loops'));
const AgenticBall = lazy(() => import('@/components/react-bits/agentic-ball'));

type Variant = 'verify' | 'metrics' | 'leaderboard' | 'logs';

/**
 * Per-route decorative background. Sits behind the page content,
 * fixed-position and FULL viewport so there are no hard edges in the
 * middle of the screen. Each effect is composited via mix-blend-screen
 * + a radial mask that fades the accent toward the viewport corners,
 * so it reads as a glow rather than a clipped panel.
 *
 * The Layout's SilkWaves still renders behind everything — these accents
 * compose on top of that for a richer, route-specific feel.
 */
export function RouteBackground({ variant }: { variant: Variant }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Suspense fallback={null}>
        {variant === 'verify' && (
          // Sky-blue agentic orb in the upper-right; soft mask fades it
          // out toward the bottom-left where forms live.
          <div
            className="absolute inset-0 opacity-65 mix-blend-screen"
            style={{
              maskImage: 'radial-gradient(60% 60% at 75% 25%, black 0%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(60% 60% at 75% 25%, black 0%, transparent 75%)',
            }}
          >
            <div className="absolute right-[-15%] top-[-5%] h-[720px] w-[720px]">
              <AgenticBall />
            </div>
          </div>
        )}

        {variant === 'metrics' && (
          // Halftone dot grid full-screen, dimmed to keep stat numbers crisp.
          <div className="absolute inset-0 opacity-20 mix-blend-screen">
            <HalftoneWave className="h-full w-full" />
          </div>
        )}

        {variant === 'leaderboard' && (
          // Color loops behind the table — gentler opacity so rows stay legible.
          <div className="absolute inset-0 opacity-35 mix-blend-screen">
            <ColorLoops className="h-full w-full" />
          </div>
        )}

        {variant === 'logs' && (
          // Aurora glow concentrated at the top-right with a soft radial fade,
          // so there's no visible 'box edge' running down the middle of the page.
          <div
            className="absolute inset-0 opacity-65"
            style={{
              maskImage: 'radial-gradient(70% 70% at 80% 15%, black 0%, transparent 75%)',
              WebkitMaskImage: 'radial-gradient(70% 70% at 80% 15%, black 0%, transparent 75%)',
            }}
          >
            <AuroraBlur className="h-full w-full" />
          </div>
        )}
      </Suspense>

      {/* Soft veil so content text stays readable on top. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_30%,transparent,rgba(0,0,0,0.55)_75%)]" />
    </div>
  );
}

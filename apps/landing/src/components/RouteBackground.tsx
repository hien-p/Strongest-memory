import { lazy, Suspense } from 'react';

// Heavy components — only load when the route mounts.
const AuroraBlur = lazy(() => import('@/components/react-bits/aurora-blur'));
const HalftoneWave = lazy(() => import('@/components/react-bits/halftone-wave'));
const ColorLoops = lazy(() => import('@/components/react-bits/color-loops'));
const AgenticBall = lazy(() => import('@/components/react-bits/agentic-ball'));

type Variant = 'verify' | 'metrics' | 'leaderboard' | 'logs';

/**
 * Per-route decorative background. Sits behind the page's content card,
 * fixed-position so it doesn't scroll with the page. Each route gets its
 * own React Bits effect tinted to fit the strongest palette.
 *
 * The Layout's SilkWaves still renders behind everything — these accents
 * compose on top of that for a richer, route-specific feel.
 */
export function RouteBackground({ variant }: { variant: Variant }) {
  return (
    <div className="pointer-events-none fixed inset-0 z-0" aria-hidden="true">
      <Suspense fallback={null}>
        {variant === 'verify' && (
          <div className="absolute right-[-15%] top-[8%] h-[640px] w-[640px] opacity-70 mix-blend-screen">
            <AgenticBall />
          </div>
        )}

        {variant === 'metrics' && (
          <div className="absolute inset-0 opacity-25 mix-blend-screen">
            <HalftoneWave className="h-full w-full" />
          </div>
        )}

        {variant === 'leaderboard' && (
          <div className="absolute inset-0 opacity-50 mix-blend-screen">
            <ColorLoops className="h-full w-full" />
          </div>
        )}

        {variant === 'logs' && (
          <div className="absolute right-[-10%] top-[-5%] h-[820px] w-[820px] opacity-65">
            <AuroraBlur className="h-full w-full" />
          </div>
        )}
      </Suspense>

      {/* Soft veil so content text stays readable on top. */}
      <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_50%_30%,transparent,rgba(0,0,0,0.55)_75%)]" />
    </div>
  );
}

import { lazy, Suspense, type ReactNode } from 'react';

// Lazy-load each WebGL/canvas effect — bundle weight only kicks in when the
// section scrolls into view (via Suspense).
const ShaderWaves = lazy(() => import('@/components/react-bits/shader-waves'));
const ChromaCard = lazy(() => import('@/components/react-bits/chroma-card'));
const AuroraBlur = lazy(() => import('@/components/react-bits/aurora-blur'));
const AIBlob = lazy(() => import('@/components/react-bits/ai-blob'));
const HalftoneWave = lazy(() => import('@/components/react-bits/halftone-wave'));
const ColorLoops = lazy(() => import('@/components/react-bits/color-loops'));
const AgenticBall = lazy(() => import('@/components/react-bits/agentic-ball'));

interface CardShellProps {
  className?: string;
  bg: ReactNode;
  eyebrow: string;
  title: string;
  body: string;
  href?: string;
}

function CardShell({ className = '', bg, eyebrow, title, body, href }: CardShellProps) {
  const Inner = (
    <>
      <div className="absolute inset-0 -z-10 overflow-hidden">{bg}</div>
      {/* Soft dark veil so text stays readable across whatever effect renders. */}
      <div className="pointer-events-none absolute inset-0 -z-10 bg-gradient-to-br from-black/30 via-black/45 to-black/65" />
      <div className="relative flex h-full flex-col justify-end p-6 sm:p-7">
        <span className="font-mono text-[0.65rem] uppercase tracking-[0.25em] text-white/60">{eyebrow}</span>
        <h3 className="mt-2 font-serif text-2xl leading-tight text-white sm:text-[1.7rem]">{title}</h3>
        <p className="mt-2 max-w-md text-sm leading-relaxed text-white/70">{body}</p>
      </div>
    </>
  );

  const base =
    'group relative isolate flex min-h-[220px] overflow-hidden rounded-2xl border border-white/10 bg-[#0a0a14]/60 backdrop-blur-sm transition-all duration-300 hover:-translate-y-1 hover:border-sky-400/40 hover:shadow-[0_20px_60px_-20px_rgba(14,165,233,0.4)]';

  return href ? (
    <a href={href} className={`${base} ${className}`}>
      {Inner}
    </a>
  ) : (
    <article className={`${base} ${className}`}>{Inner}</article>
  );
}

export function Bento() {
  return (
    <section className="relative mx-auto max-w-[1280px] px-6 pb-24 pt-12 sm:px-10">
      <header className="mb-10 max-w-3xl">
        <p className="font-mono text-[0.7rem] uppercase tracking-[0.3em] text-white/55">02 · the four primitives</p>
        <h2 className="mt-3 font-serif text-4xl leading-[1.05] tracking-[-0.02em] text-white sm:text-5xl">
          What an agent <em className="text-sky-400 not-italic">that you own</em> looks like.
        </h2>
        <p className="mt-4 text-base leading-relaxed text-white/65">
          Memory, inference, identity, and royalties — wired together end-to-end on 0G. Each tile is one of the
          on-chain primitives that make agents a tradeable asset, not a rented service.
        </p>
      </header>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-6 lg:auto-rows-[180px]">
        {/* 1 — Big card: Encrypted memory, ShaderCard bg */}
        <CardShell
          className="lg:col-span-4 lg:row-span-2"
          eyebrow="0G Storage · AES-256-GCM"
          title="Encrypted memory the operator can't read."
          body="Agent state — SOUL, memory, skills — is encrypted client-side with HKDF-derived keys before upload to 0G Storage. The Merkle root becomes the iNFT's metadataHash. Storage providers store ciphertext and never see plaintext."
          bg={
            <Suspense fallback={null}>
              <ShaderWaves className="h-full w-full" />
            </Suspense>
          }
        />

        {/* 2 — Sealed Inference, AuroraBlur */}
        <CardShell
          className="lg:col-span-2"
          eyebrow="0G Compute · Intel TDX + H100"
          title="Sealed Inference."
          body="Every LLM call routes through a TEE. RA report downloadable per response."
          bg={
            <Suspense fallback={null}>
              <AuroraBlur className="h-full w-full" />
            </Suspense>
          }
        />

        {/* 3 — ERC-7857 iNFT, ChromaCard */}
        <CardShell
          className="lg:col-span-2"
          eyebrow="0G Chain · ERC-7857"
          title="Tradeable brain."
          body="Every agent is a token on Aristotle. Transfer the iNFT — transfer the brain."
          bg={
            <Suspense fallback={null}>
              <ChromaCard className="h-full w-full" />
            </Suspense>
          }
        />

        {/* 4 — Royalty, HalftoneWave */}
        <CardShell
          className="lg:col-span-3 lg:row-span-2"
          eyebrow="On-chain · 5% creator royalty"
          title="Get paid every time someone runs your agent."
          body="The RoyaltyHook splits each inference fee 5% / 95% creator / platform on the same tx. Settled trustlessly via the InferenceRun event. 16 Foundry tests pass, including a 256-run fuzz on the value-conserving invariant."
          bg={
            <Suspense fallback={null}>
              <HalftoneWave className="h-full w-full" />
            </Suspense>
          }
        />

        {/* 5 — Re-encryption transfer, AIBlob centered */}
        <CardShell
          className="lg:col-span-3"
          eyebrow="Hack A · commitment-binder"
          title="The brain transfers, not just the receipt."
          body="On transfer: bridge re-encrypts AES locally, Sealed Inference signs the JSON commitment, the on-chain Verifier recovers the signing address. New owner inherits full memory."
          bg={
            <Suspense fallback={null}>
              <div className="absolute inset-0 flex items-center justify-center">
                <AIBlob size={300} />
              </div>
            </Suspense>
          }
        />

        {/* 6 — Live metrics, ColorLoops */}
        <CardShell
          className="lg:col-span-3"
          href="/metrics"
          eyebrow="apps/web · /metrics"
          title="Live on-chain metrics."
          body="Mints, transfers, inference calls, royalties paid — fetched via getLogs every 30s. No centralized indexer."
          bg={
            <Suspense fallback={null}>
              <ColorLoops className="h-full w-full" />
            </Suspense>
          }
        />

        {/* 7 — Attestation Viewer, simple background */}
        <CardShell
          className="lg:col-span-3"
          href="/verify"
          eyebrow="apps/web · /verify"
          title="Attestation Viewer →"
          body="Paste a signature + (req_hash, res_hash, chatID); we ecrecover the signer and check it matches the registered TEE oracle."
          bg={
            <div className="absolute inset-0 bg-[radial-gradient(120%_70%_at_30%_30%,rgba(14,165,233,0.25),transparent_60%),radial-gradient(120%_70%_at_70%_80%,rgba(168,85,247,0.18),transparent_60%)]" />
          }
        />
      </div>
    </section>
  );
}

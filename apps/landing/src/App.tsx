const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_110052_2e127257-5236-40b1-ba48-4690260f1185.mp4';

export default function App() {
  return (
    <main className="relative min-h-screen w-full overflow-hidden bg-black text-white">
      {/* Full-bleed video — fixed so it covers the viewport on any scroll. */}
      <video
        className="fixed inset-0 w-full h-full object-cover"
        src={VIDEO_URL}
        autoPlay
        loop
        muted
        playsInline
        preload="auto"
        aria-hidden="true"
      />

      {/* Dim layer so text stays legible over the bright clouds. */}
      <div className="fixed inset-0 bg-black/45 pointer-events-none" aria-hidden="true" />

      {/* VHS overlays — full viewport. */}
      <div className="vhs-noise fixed inset-0 pointer-events-none" aria-hidden="true" />
      <div className="vhs-scanlines fixed inset-0 pointer-events-none" aria-hidden="true" />
      <div className="vhs-glitch-bar pointer-events-none" aria-hidden="true" />

      {/* ── Top nav ── */}
      <header className="relative z-20 flex items-center justify-between px-6 sm:px-10 py-6">
        <a href="/" className="font-serif text-xl sm:text-2xl tracking-tight rgb-text-glitch">
          strongest<span className="text-white/50">.</span>
        </a>
        <nav className="hidden sm:flex items-center gap-6 text-sm font-sans text-white/70">
          <a href="/verify" className="hover:text-white transition-colors">verify</a>
          <a href="/metrics" className="hover:text-white transition-colors">metrics</a>
          <a href="/leaderboard" className="hover:text-white transition-colors">leaderboard</a>
          <a href="/logs" className="hover:text-white transition-colors">devlog</a>
          <a
            href="https://github.com/hien-p/Strongest-memory"
            target="_blank"
            rel="noreferrer"
            className="hover:text-white transition-colors"
          >
            github
          </a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 flex flex-col items-center justify-center text-center px-6 sm:px-10 min-h-[calc(100vh-160px)]">
        <p className="fade-rise font-sans text-xs sm:text-sm uppercase tracking-[0.4em] text-white/60 mb-8">
          OpenClaw × 0G · Track 1
        </p>

        <h1
          className="fade-rise font-serif rgb-text-glitch leading-[0.95] tracking-[-0.04em] max-w-5xl"
          style={{ fontSize: 'clamp(48px, 9vw, 128px)', animationDelay: '0s' }}
        >
          Own the brain,
          <br />
          not the receipt.
        </h1>

        <p
          className="fade-rise font-sans text-white/85 rgb-text-glitch mt-8 leading-relaxed max-w-2xl"
          style={{ fontSize: 'clamp(15px, 1.4vw, 20px)', animationDelay: '0.2s' }}
        >
          For builders whose agents shouldn't die with the platform. Encrypted memory on 0G Storage, sealed inference in
          TEE, royalties on every call. ERC-7857 iNFTs that hold the brain — not just a token.
        </p>

        <div
          className="fade-rise mt-10 flex flex-col sm:flex-row items-center gap-4"
          style={{ animationDelay: '0.4s' }}
        >
          <a
            href="/verify"
            className="liquid-glass px-8 py-3.5 text-white font-sans font-medium transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: 'clamp(14px, 1.05vw, 16px)' }}
          >
            Begin Journey
          </a>
          <a
            href="/metrics"
            className="px-6 py-3 text-white/70 hover:text-white font-sans transition-colors"
            style={{ fontSize: 'clamp(13px, 0.95vw, 15px)' }}
          >
            See live metrics →
          </a>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 px-6 sm:px-10 pb-8 pt-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-white/55 text-xs font-sans">
        <span className="font-serif text-base sm:text-lg rgb-text-glitch">
          Velorah
          <sup className="text-[0.5em] ml-0.5 align-super opacity-70">®</sup>
        </span>
        <div className="flex items-center gap-3">
          <span>0G APAC Hackathon · deadline 2026-05-16</span>
          <span aria-hidden="true">·</span>
          <a
            href="https://strongest.pages.dev"
            className="hover:text-white transition-colors"
          >
            strongest.pages.dev
          </a>
        </div>
      </footer>
    </main>
  );
}

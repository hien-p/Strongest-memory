const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_110052_2e127257-5236-40b1-ba48-4690260f1185.mp4';

export default function App() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-4 sm:p-6">
      {/*
        Frame: 3:4 aspect ratio. Caps at 600x800 on big screens; shrinks to fit
        the viewport on smaller ones (height-constrained or width-constrained).
        container-type: inline-size lets children scale fonts via cqi units.
      */}
      <div
        className="relative aspect-[3/4] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80"
        style={{
          width: 'min(600px, 92vw, calc(92vh * 0.75))',
          containerType: 'inline-size',
        }}
        aria-label="Velorah · strongest social card"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          src={VIDEO_URL}
          autoPlay
          loop
          muted
          playsInline
          preload="auto"
          aria-hidden="true"
        />

        <div className="vhs-noise" aria-hidden="true" />
        <div className="vhs-scanlines" aria-hidden="true" />
        <div className="vhs-glitch-bar" aria-hidden="true" />

        {/*
          Content positioned in the upper portion of the frame at 18% from the
          top. Replaces the original fixed -mt-[180px] which broke responsively.
        */}
        <div className="absolute inset-x-0 top-[18%] z-10 flex flex-col items-center text-center px-[8cqi]">
          <h1
            className="font-serif text-white rgb-text-glitch fade-rise leading-[0.95] tracking-[-2.46px]"
            style={{ fontSize: 'clamp(36px, 10.6cqi, 64px)', animationDelay: '0s' }}
          >
            Focus in a
            <br />
            Distracted World
          </h1>

          <p
            className="font-sans text-white/80 rgb-text-glitch fade-rise mt-6 leading-relaxed"
            style={{
              fontSize: 'clamp(13px, 2.83cqi, 17px)',
              maxWidth: 'min(480px, 80cqi)',
              animationDelay: '0.2s',
            }}
          >
            For builders whose agents shouldn't die with the platform. Encrypted memory on 0G Storage, sealed inference
            in TEE, royalties on every call. Own the brain, not the receipt.
          </p>

          <a
            href="/verify"
            className="liquid-glass fade-rise mt-10 px-8 py-3 text-white font-sans transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: 'clamp(13px, 2.5cqi, 15px)', animationDelay: '0.4s' }}
          >
            Begin Journey
          </a>
        </div>

        {/* Subtle nav strip — explore the functional sub-pages without
            cluttering the hero typography. */}
        <nav
          className="absolute inset-x-0 bottom-[14%] z-10 flex justify-center gap-4 text-white/60 font-sans"
          style={{ fontSize: 'clamp(11px, 2cqi, 13px)' }}
        >
          <a href="/verify" className="hover:text-white transition-colors">verify</a>
          <span aria-hidden="true">·</span>
          <a href="/metrics" className="hover:text-white transition-colors">metrics</a>
          <span aria-hidden="true">·</span>
          <a href="/leaderboard" className="hover:text-white transition-colors">leaderboard</a>
          <span aria-hidden="true">·</span>
          <a href="/logs" className="hover:text-white transition-colors">devlog</a>
        </nav>

        {/* Footer logo, pinned 5% from the bottom so it scales with the frame. */}
        <div className="absolute inset-x-0 bottom-[5%] flex justify-center pointer-events-none">
          <span
            className="font-serif text-white rgb-text-glitch tracking-tight"
            style={{ fontSize: 'clamp(20px, 5cqi, 30px)' }}
          >
            Velorah
            <sup className="text-[0.35em] ml-0.5 align-super opacity-70">®</sup>
          </span>
        </div>
      </div>
    </main>
  );
}

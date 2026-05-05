const VIDEO_URL =
  'https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260505_110052_2e127257-5236-40b1-ba48-4690260f1185.mp4';

export default function App() {
  return (
    <main className="min-h-screen bg-black flex items-center justify-center p-6">
      <div
        className="relative w-[600px] h-[800px] rounded-2xl overflow-hidden border border-white/10 shadow-2xl shadow-black/80"
        aria-label="Velorah · strongest social card"
      >
        {/* Background video, full-cover */}
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

        {/* VHS noise — animated SVG fractal-noise overlay */}
        <div className="vhs-noise" aria-hidden="true" />

        {/* VHS scanlines — repeating gradient */}
        <div className="vhs-scanlines" aria-hidden="true" />

        {/* VHS glitch bar — sweeps top → bottom every 4s */}
        <div className="vhs-glitch-bar" aria-hidden="true" />

        {/* Content, centered, shifted up */}
        <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-10 -mt-[180px]">
          <h1
            className="font-serif text-white rgb-text-glitch fade-rise leading-[0.95] tracking-[-2.46px]"
            style={{ fontSize: '64px', animationDelay: '0s' }}
          >
            Focus in a
            <br />
            Distracted World
          </h1>

          <p
            className="font-sans text-white/80 rgb-text-glitch fade-rise mt-6 leading-relaxed"
            style={{ fontSize: '17px', maxWidth: '480px', animationDelay: '0.2s' }}
          >
            For builders whose agents shouldn't die with the platform. Encrypted memory on 0G Storage, sealed inference
            in TEE, royalties on every call. Own the brain, not the receipt.
          </p>

          <button
            type="button"
            className="liquid-glass fade-rise mt-10 px-8 py-3 text-white font-sans transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: '15px', animationDelay: '0.4s' }}
          >
            Begin Journey
          </button>
        </div>

        {/* Footer logo */}
        <div className="absolute inset-x-0 bottom-8 flex justify-center pointer-events-none">
          <span className="font-serif text-white text-3xl rgb-text-glitch tracking-tight">
            Velorah
            <sup className="text-[10px] ml-0.5 align-super opacity-70">®</sup>
          </span>
        </div>
      </div>
    </main>
  );
}

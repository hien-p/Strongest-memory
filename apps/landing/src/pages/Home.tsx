import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import GlitchText from '@/components/react-bits/glitch-text';

export default function Home() {
  return (
    <Layout>
      <section className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-[1280px] flex-col items-center justify-center px-6 text-center sm:px-10">
        <p className="fade-rise mb-7 font-sans text-[0.7rem] uppercase tracking-[0.45em] text-white/55 sm:text-xs">
          OpenClaw × 0G · Track 1 · 0G APAC Hackathon
        </p>

        <div className="fade-rise w-full max-w-5xl" style={{ animationDelay: '0s' }}>
          {/* GlitchText auto-fits to its container; we control size via the
              wrapping div's height (clamps from 54 → 144 px). Two lines. */}
          <div className="h-[clamp(54px,11vw,144px)] w-full">
            <GlitchText
              text="Own the brain,"
              colors={['#0ea5e9', '#a855f7', '#ffffff']}
              textColor="#ffffff"
              autoFit
              fontWeight="400"
              className="font-serif"
            />
          </div>
          <div className="h-[clamp(54px,11vw,144px)] w-full">
            <GlitchText
              text="not the receipt."
              colors={['#0ea5e9', '#a855f7', '#ffffff']}
              textColor="#ffffff"
              autoFit
              fontWeight="400"
              className="font-serif"
            />
          </div>
        </div>

        <p
          className="fade-rise mt-8 max-w-2xl font-sans leading-relaxed text-white/85 rgb-text-glitch"
          style={{ fontSize: 'clamp(15px, 1.4vw, 20px)', animationDelay: '0.2s' }}
        >
          For builders whose agents shouldn't die with the platform. Encrypted memory on 0G Storage, sealed inference in
          TEE, royalties on every call. ERC-7857 iNFTs that hold the brain — not just a token.
        </p>

        <div
          className="fade-rise mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.4s' }}
        >
          <Link
            to="/verify"
            className="liquid-glass px-8 py-3.5 font-sans font-medium text-white transition-transform duration-200 hover:scale-[1.03]"
            style={{ fontSize: 'clamp(14px, 1.05vw, 16px)' }}
          >
            Begin Journey
          </Link>
          <Link
            to="/metrics"
            className="px-6 py-3 font-sans text-white/70 transition-colors hover:text-white"
            style={{ fontSize: 'clamp(13px, 0.95vw, 15px)' }}
          >
            See live metrics →
          </Link>
        </div>
      </section>
    </Layout>
  );
}

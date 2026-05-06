import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import StaggeredText from '@/components/react-bits/staggered-text';

export default function Home() {
  return (
    <Layout>
      <section className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-[1280px] flex-col items-center justify-center px-6 py-10 text-center sm:px-10">
        {/* Official hackathon banner — links back to HackQuest. */}
        <a
          href="https://www.hackquest.io/hackathons/0G-APAC-Hackathon"
          target="_blank"
          rel="noreferrer"
          className="fade-rise group relative mb-10 block w-full max-w-3xl overflow-hidden rounded-2xl border border-white/10 shadow-[0_10px_60px_-15px_rgba(14,165,233,0.4)] transition-transform duration-300 hover:scale-[1.02] hover:border-sky-400/40"
          style={{ animationDelay: '0s' }}
          aria-label="0G APAC Hackathon — official banner"
        >
          <img
            src="https://assets.hackquest.io/hackathons/Ks0ghXz8wLc-a0DMsIesx.png"
            alt="0G APAC Hackathon"
            loading="eager"
            decoding="async"
            className="block h-auto w-full"
          />
          {/* Subtle gradient overlay so the image blends with the dark theme. */}
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/20" />
          {/* Click hint badge — only on hover. */}
          <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-black/60 px-3 py-1 text-[0.7rem] font-medium uppercase tracking-[0.15em] text-white/80 opacity-0 backdrop-blur-sm transition-opacity duration-200 group-hover:opacity-100">
            visit hackquest →
          </span>
        </a>

        <p className="fade-rise mb-7 font-sans text-[0.7rem] uppercase tracking-[0.45em] text-white/55 sm:text-xs" style={{ animationDelay: '0.05s' }}>
          OpenClaw × 0G · Track 1 · 0G APAC Hackathon
        </p>

        {/* StaggeredText doesn't accept a style prop — set fontSize via the
            Tailwind arbitrary value syntax in className. */}
        <StaggeredText
          text={'Own the brain,\nnot the receipt.'}
          as="h1"
          segmentBy="chars"
          delay={28}
          duration={0.8}
          blur
          className="font-serif font-normal leading-[0.95] tracking-[-0.04em] text-white text-[clamp(48px,9vw,124px)]"
        />

        <p
          className="fade-rise mt-8 max-w-2xl font-sans leading-relaxed text-white/85 rgb-text-glitch"
          style={{ fontSize: 'clamp(15px, 1.4vw, 20px)', animationDelay: '0.6s' }}
        >
          For builders whose agents shouldn't die with the platform. Encrypted memory on 0G Storage, sealed inference in
          TEE, royalties on every call. ERC-7857 iNFTs that hold the brain — not just a token.
        </p>

        <div
          className="fade-rise mt-10 flex flex-col items-center gap-4 sm:flex-row"
          style={{ animationDelay: '0.9s' }}
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

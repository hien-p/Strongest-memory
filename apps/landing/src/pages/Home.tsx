import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import StaggeredText from '@/components/react-bits/staggered-text';

const HackathonBanner = () => (
  <a
    href="https://www.hackquest.io/hackathons/0G-APAC-Hackathon"
    target="_blank"
    rel="noreferrer"
    aria-label="0G APAC Hackathon — official banner"
    className="group relative block w-full overflow-hidden"
  >
    <img
      src="https://assets.hackquest.io/hackathons/Ks0ghXz8wLc-a0DMsIesx.png"
      alt="0G APAC Hackathon · $150K prize pool · March 19 → May 16 2026"
      loading="eager"
      decoding="async"
      className="block h-auto w-full"
    />
    {/* Subtle bottom fade so the banner blends into the dark page below. */}
    <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-b from-transparent to-[#0a0a14]" />
    {/* Click hint pill on hover. */}
    <span className="pointer-events-none absolute bottom-6 right-6 rounded-full bg-black/70 px-4 py-2 text-[0.72rem] font-medium uppercase tracking-[0.18em] text-white/90 opacity-0 backdrop-blur-md transition-opacity duration-200 group-hover:opacity-100">
      visit hackquest →
    </span>
  </a>
);

export default function Home() {
  return (
    <Layout topBanner={<HackathonBanner />}>
      <section className="relative mx-auto flex min-h-[calc(100vh-260px)] max-w-[1280px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
        <p
          className="fade-rise mb-7 font-sans text-[0.7rem] uppercase tracking-[0.45em] text-white/55 sm:text-xs"
          style={{ animationDelay: '0.05s' }}
        >
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

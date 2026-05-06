import { Link } from 'react-router-dom';
import { Layout } from '@/components/Layout';
import StaggeredText from '@/components/react-bits/staggered-text';

export default function Home() {
  return (
    <Layout>
      <section className="relative mx-auto flex min-h-[calc(100vh-160px)] max-w-[1280px] flex-col items-center justify-center px-6 py-12 text-center sm:px-10">
        {/* Small hackathon badge — replaces the heavy banner image. */}
        <a
          href="https://www.hackquest.io/hackathons/0G-APAC-Hackathon"
          target="_blank"
          rel="noreferrer"
          className="fade-rise mb-7 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-2 font-sans text-xs uppercase tracking-[0.25em] text-white/75 backdrop-blur-md transition-colors hover:border-sky-400/40 hover:text-white"
          style={{ animationDelay: '0s' }}
        >
          <span className="h-1.5 w-1.5 rounded-full bg-sky-400 shadow-[0_0_8px_rgba(14,165,233,0.7)]" />
          0G APAC Hackathon · Track 1 · $150K Prize Pool
          <span className="opacity-50">↗</span>
        </a>

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

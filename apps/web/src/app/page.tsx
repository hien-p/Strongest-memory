import Link from 'next/link';
import { ConnectButton } from '@rainbow-me/rainbowkit';

export default function Home() {
  return (
    <main className="min-h-screen px-6 py-12 max-w-5xl mx-auto">
      <header className="flex items-center justify-between mb-16">
        <Link href="/" className="text-xl font-mono tracking-tight">
          strongest<span className="text-zg-accent">.</span>
        </Link>
        <ConnectButton />
      </header>

      <section className="space-y-6 mb-20">
        <h1 className="text-5xl md:text-6xl font-bold tracking-tight">
          Every agent ownable.
          <br />
          Every memory encrypted.
          <br />
          Every inference verified.
        </h1>
        <p className="text-lg text-zg-fg/70 max-w-2xl">
          OpenClaw × 0G. Mint your agent as an ERC-7857 iNFT. Run it in a TEE. Earn royalties on every inference.
        </p>
      </section>

      <section className="grid md:grid-cols-3 gap-6">
        <Tile
          href="/mint"
          title="Mint"
          desc="Upload an OpenClaw bundle, encrypt it, push to 0G Storage, mint as an iNFT on Aristotle mainnet."
        />
        <Tile
          href="/run"
          title="Run"
          desc="Invoke a minted agent. Each call routes 5% royalty to the creator and returns a downloadable RA report."
        />
        <Tile
          href="/transfer"
          title="Transfer"
          desc="Sell or hand off an iNFT. The TEE oracle re-encrypts the agent's memory for the new owner."
        />
      </section>
    </main>
  );
}

function Tile({ href, title, desc }: { href: '/mint' | '/run' | '/transfer'; title: string; desc: string }) {
  return (
    <Link
      href={href}
      className="block rounded-2xl border border-white/10 p-6 hover:border-zg-accent transition-colors"
    >
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-sm text-zg-fg/60 leading-relaxed">{desc}</p>
    </Link>
  );
}

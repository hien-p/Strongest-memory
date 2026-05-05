import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { Providers } from './providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'strongest — every agent is an iNFT',
  description:
    'OpenClaw × 0G — sealed-inference brains, encrypted memory on 0G Storage, royalty-bearing ERC-7857 iNFTs.',
};

// Wagmi/RainbowKit reach for `localStorage` during render, so opt out of
// static generation. Re-enable per-page once we have content that benefits.
export const dynamic = 'force-dynamic';

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}

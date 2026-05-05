import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@strongest/shared-types'],
  experimental: {
    typedRoutes: true,
  },
};

export default nextConfig;

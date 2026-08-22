import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'proxyview.net' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
    ],
  },
};

export default nextConfig;

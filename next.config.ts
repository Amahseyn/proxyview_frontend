import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'proxyview.net' },
      { protocol: 'https', hostname: 'secure.gravatar.com' },
      { protocol: 'https', hostname: 'flagcdn.com' },
    ],
  },
  async redirects() {
    return [
      {
        source: '/glossaryp',
        destination: '/glossary',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;

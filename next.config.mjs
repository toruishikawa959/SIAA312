/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
    unoptimized: true,
  },
  experimental: {
    allowedDevOrigins: [
      'localhost:3001',
      '127.0.0.1:3001',
      '100.67.98.128:3001',
    ],
  },
};

export default nextConfig;

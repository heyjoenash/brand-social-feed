import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: [
      'picsum.photos',       // For our mock data
      'instagram.com',       // For Instagram images
      'cdninstagram.com',    // For Instagram CDN
      'scontent.cdninstagram.com', // Common Instagram CDN domain
      'scontent-iad3-1.cdninstagram.com', // Common Instagram CDN domain
      'scontent-iad3-2.cdninstagram.com', // Common Instagram CDN domain
      'instagram.fdnk1-3.fna.fbcdn.net', // Additional Instagram CDN domain from error
    ],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.fna.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
    ],
  },
};

export default nextConfig;

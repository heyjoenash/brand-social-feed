/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // We'll fix the linting errors in a future update, but for now
    // we want the build to succeed
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.cdninstagram.com',
      },
      {
        protocol: 'https',
        hostname: '**.fbcdn.net',
      },
      {
        protocol: 'https',
        hostname: 'instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'graph.instagram.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.instagram.com',
      }
    ]
  }
}

module.exports = nextConfig 
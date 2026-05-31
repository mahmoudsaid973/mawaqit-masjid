import type { NextConfig } from 'next';

/**
 * Next.js configuration for the Auth-Worker application.
 * 
 * Configures:
 * - Strict mode for production builds
 * - TypeScript validation during build (fail on error)
 * - ESLint validation during build (fail on error)
 * - Allowed remote image domains for next/image
 * - Experimental features required for Next.js 15
 */
const nextConfig: NextConfig = {
  // Enable strict mode in development to highlight potential issues
  reactStrictMode: true,

  // Fail the build if TypeScript errors are present
  typescript: {
    ignoreBuildErrors: false,
  },

  // Fail the build if ESLint errors are present
  eslint: {
    ignoreDuringBuilds: false,
  },

  // Configure allowed domains for next/image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
    ],
    // Prevent unoptimized images from being served without optimization
    unoptimized: false,
  },

  // Headers for security and caching
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
        ],
      },
    ];
  },

  // Redirects configuration (if needed for legacy routes)
  async redirects() {
    return [];
  },

  // Rewrites configuration (if needed for proxying)
  async rewrites() {
    return [];
  },
};

export default nextConfig;

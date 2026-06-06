/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        // Allow images served from your Supabase storage bucket
        protocol: 'https',
        hostname: 'fsnrnrowvtukaxdfrehq.supabase.co',
        pathname: '/storage/v1/object/public/**',
      },
      {
        // Allow YouthVerse Union logo hosted on PostImg
        protocol: 'https',
        hostname: 'i.postimg.cc',
      },
    ],
  },

  async headers() {
    return [
      {
        // Apply security headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
        ],
      },
    ]
  },
}

module.exports = nextConfig
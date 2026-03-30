import type { NextConfig } from 'next'

const SECURITY_HEADERS = [
  // Prevent this app from being embedded in an iframe (clickjacking protection).
  { key: 'X-Frame-Options',        value: 'DENY' },
  // Stop browsers from MIME-sniffing a response away from the declared Content-Type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send origin+path on same-origin requests; send only origin on cross-origin; nothing on downgrade.
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
]

const nextConfig: NextConfig = {
  reactStrictMode: true,

  async headers() {
    return [
      {
        source: '/(.*)',
        headers: SECURITY_HEADERS,
      },
    ]
  },
}

export default nextConfig

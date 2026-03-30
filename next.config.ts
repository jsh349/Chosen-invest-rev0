import type { NextConfig } from 'next'

// Report-Only CSP: violations are logged to DevTools but never block requests.
// Purpose: surface what a real enforcement policy would catch before enabling enforcement.
// To promote to enforcement: change key to 'Content-Security-Policy'.
//
// Known external origins for this app:
//   style-src  : fonts.googleapis.com (Inter font CSS)
//   font-src   : fonts.gstatic.com   (Inter font files)
//   connect-src: accounts.google.com (OAuth redirect)
//
// Next.js injects inline scripts (__NEXT_DATA__ etc.) — 'unsafe-inline' is required
// for script-src until a nonce-based approach is adopted (Phase 3+).
const CSP_REPORT_ONLY = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com",
  "img-src 'self' data:",
  "connect-src 'self' https://accounts.google.com",
  "frame-ancestors 'none'",
].join('; ')

const SECURITY_HEADERS = [
  // Prevent this app from being embedded in an iframe (clickjacking protection).
  { key: 'X-Frame-Options',        value: 'DENY' },
  // Stop browsers from MIME-sniffing a response away from the declared Content-Type.
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  // Send origin+path on same-origin requests; send only origin on cross-origin; nothing on downgrade.
  { key: 'Referrer-Policy',        value: 'strict-origin-when-cross-origin' },
  // CSP in report-only mode — logs violations to DevTools, never blocks.
  { key: 'Content-Security-Policy-Report-Only', value: CSP_REPORT_ONLY },
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

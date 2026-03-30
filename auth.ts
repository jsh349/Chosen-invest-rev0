import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'
import { PUBLIC_PATHS } from '@/lib/constants/routes'

// Validate required OAuth credentials at module load time.
// Avoids opaque NextAuth errors when credentials are missing.
const AUTH_GOOGLE_ID     = process.env.AUTH_GOOGLE_ID
const AUTH_GOOGLE_SECRET = process.env.AUTH_GOOGLE_SECRET
if (!AUTH_GOOGLE_ID || !AUTH_GOOGLE_SECRET) {
  throw new Error(
    '[auth] Missing required environment variables: AUTH_GOOGLE_ID and/or AUTH_GOOGLE_SECRET\n' +
    'Check .env.local (development) or your deployment environment variables.',
  )
}

// AUTH_TRUST_HOST=true disables OAuth callback host validation.
// Safe in local development; dangerous in production (Host header spoofing risk).
if (process.env.NODE_ENV === 'production' && process.env.AUTH_TRUST_HOST === 'true') {
  throw new Error(
    '[auth] AUTH_TRUST_HOST=true must not be set in production.\n' +
    'Remove AUTH_TRUST_HOST and set AUTH_URL to your production base URL instead.\n' +
    'Example: AUTH_URL=https://yourdomain.com',
  )
}

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     AUTH_GOOGLE_ID,
      clientSecret: AUTH_GOOGLE_SECRET,
    }),
  ],
  pages: {
    signIn: '/login',
  },
  callbacks: {
    async session({ session, token }) {
      if (session.user) {
        if (!token.sub) {
          // token.sub must always be present for Google OAuth sessions.
          // A missing sub means identity is unresolvable — fail loudly rather
          // than silently producing an undefined user ID in DB queries.
          throw new Error('[auth] session callback: token.sub is missing — cannot assign session.user.id')
        }
        session.user.id = token.sub
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn   = !!auth?.user
      const isPublicPath = PUBLIC_PATHS.some(p => nextUrl.pathname.startsWith(p))
      if (!isPublicPath && !isLoggedIn) {
        // API callers expect machine-readable errors, not browser redirects.
        if (nextUrl.pathname.startsWith('/api/')) {
          return Response.json({ error: 'Unauthorized' }, { status: 401 })
        }
        return false
      }
      return true
    },
  },
})

import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

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

// Paths that are publicly accessible without authentication.
// The middleware protects everything else — add new public routes here, not to a protected list.
// Note: '/' is excluded from the middleware matcher entirely (see middleware.ts).
const PUBLIC_PREFIXES = ['/login', '/signup', '/api/']

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
      if (session.user && token.sub) {
        session.user.id = token.sub
      }
      return session
    },
    authorized({ auth, request: { nextUrl } }) {
      const isLoggedIn  = !!auth?.user
      const isPublicPath = PUBLIC_PREFIXES.some(p => nextUrl.pathname.startsWith(p))
      if (!isPublicPath && !isLoggedIn) return false
      return true
    },
  },
})

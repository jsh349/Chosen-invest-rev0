import NextAuth from 'next-auth'
import Google from 'next-auth/providers/google'

export const { handlers, auth, signIn, signOut } = NextAuth({
  providers: [
    Google({
      clientId:     process.env.AUTH_GOOGLE_ID,
      clientSecret: process.env.AUTH_GOOGLE_SECRET,
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
      const isLoggedIn = !!auth?.user
      const isAppRoute = nextUrl.pathname.startsWith('/dashboard') ||
                         nextUrl.pathname.startsWith('/portfolio') ||
                         nextUrl.pathname.startsWith('/market') ||
                         nextUrl.pathname.startsWith('/analysis') ||
                         nextUrl.pathname.startsWith('/ai') ||
                         nextUrl.pathname.startsWith('/settings') ||
                         nextUrl.pathname.startsWith('/goals') ||
                         nextUrl.pathname.startsWith('/transactions') ||
                         nextUrl.pathname.startsWith('/household') ||
                         nextUrl.pathname.startsWith('/tax-opportunity')
      if (isAppRoute && !isLoggedIn) return false
      return true
    },
  },
})

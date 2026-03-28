'use client'

import { SessionProvider as NextAuthSessionProvider } from 'next-auth/react'
import { AssetsProvider } from '@/lib/store/assets-store'

export function SessionProvider({ children }: { children: React.ReactNode }) {
  return (
    <NextAuthSessionProvider>
      <AssetsProvider>{children}</AssetsProvider>
    </NextAuthSessionProvider>
  )
}

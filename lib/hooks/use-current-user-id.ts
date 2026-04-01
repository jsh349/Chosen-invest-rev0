import { useSession } from 'next-auth/react'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

/**
 * Returns the authenticated user's ID from the session.
 * Falls back to LOCAL_USER_ID during SSR hydration or when the session is loading.
 *
 * Use this hook everywhere LOCAL_USER_ID was previously hardcoded in client
 * components. When Phase 2 persistence is wired, real user IDs will already
 * flow through all data paths automatically.
 */
export function useCurrentUserId(): string {
  const { data: session } = useSession()
  const id = session?.user?.id ?? LOCAL_USER_ID
  if (process.env.NODE_ENV === 'development' && id === LOCAL_USER_ID && session !== undefined) {
    console.warn('[useCurrentUserId] Falling back to LOCAL_USER_ID — no authenticated session.')
  }
  return id
}

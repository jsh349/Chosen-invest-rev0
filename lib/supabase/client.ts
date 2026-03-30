// Role: browser-side Supabase access (auth session, realtime). Active from Phase 5+.
// Do NOT add app-data queries here before Phase 5. See doc/decisions.md.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

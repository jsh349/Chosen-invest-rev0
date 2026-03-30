// Role: browser-side Supabase access (auth session, realtime). Active from Phase 5+.
// Do NOT add app-data queries here before Phase 5. See doc/decisions.md.
//
// SECURITY NOTE — anon key is intentionally public (NEXT_PUBLIC_):
//   The Supabase anon key is safe to expose in the browser by design.
//   It grants only the permissions defined by Supabase Row Level Security (RLS) policies.
//   User data safety depends entirely on RLS being correctly enabled on every table.
//   Before adding any table query through this client, confirm RLS is enforced on that table.
import { createBrowserClient } from '@supabase/ssr'

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

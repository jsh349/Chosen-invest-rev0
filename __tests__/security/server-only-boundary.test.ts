/**
 * Server-only import boundary regression tests.
 *
 * These tests confirm that server-only modules actively reject import attempts
 * outside a React Server Component context.
 *
 * Mechanism: Jest runs in Node.js with no `react-server` export condition set.
 * The `server-only` package resolves to its default (throwing) entry in this
 * environment — the same condition that applies to client component bundles.
 *
 * If `import 'server-only'` is accidentally removed from one of these files,
 * the dynamic import will succeed instead of rejecting, and the test will fail.
 *
 * Files covered:
 *   lib/env/server.ts       — holds AUTH_SECRET, SUPABASE_SERVICE_ROLE_KEY, FINNHUB_API_KEY
 *   lib/supabase/server.ts  — exposes createServiceClient (bypasses RLS)
 *   lib/market/finnhub.ts   — uses FINNHUB_API_KEY
 */

const SERVER_ONLY_ERROR = 'This module cannot be imported from a Client Component module'

describe('server-only import boundary', () => {
  it('lib/env/server rejects import outside a server component', async () => {
    await expect(import('@/lib/env/server')).rejects.toThrow(SERVER_ONLY_ERROR)
  })

  it('lib/supabase/server rejects import outside a server component', async () => {
    await expect(import('@/lib/supabase/server')).rejects.toThrow(SERVER_ONLY_ERROR)
  })

  it('lib/market/finnhub rejects import outside a server component', async () => {
    await expect(import('@/lib/market/finnhub')).rejects.toThrow(SERVER_ONLY_ERROR)
  })
})

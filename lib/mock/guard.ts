/**
 * Mock-data guard.
 *
 * Import this module alongside every direct `@/lib/mock/*` import at the
 * page or hook level. It serves three purposes:
 *
 *   1. Searchable marker — `grep '@/lib/mock/guard'` lists every site that
 *      still depends on mock data. One grep shows the full removal checklist.
 *
 *   2. Removal signal — when you wire a real data source for a feature, remove
 *      this import together with the mock import so the replacement is atomic.
 *
 *   3. Production warning — emits a console.warn in production builds so that
 *      accidental mock data in a production deployment is visible in logs.
 *
 * Adapters that use mock data as their current backing store do NOT need this
 * guard — the adapter layer is the intended abstraction boundary. This guard is
 * only for pages and hooks that import mock data directly.
 *
 * Usage:
 *   import '@/lib/mock/guard'
 *   import { buildMockTrend } from '@/lib/mock/trend'
 */

if (process.env.NODE_ENV === 'production') {
  // eslint-disable-next-line no-console
  console.warn(
    '[mock-guard] A page or hook is importing mock data in a production build. ' +
    "Search for \"@/lib/mock/guard\" to find all import sites that need a real data source.",
  )
}

export {}

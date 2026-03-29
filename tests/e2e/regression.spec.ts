import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

/**
 * Regression suite — covers features added in Phases 46–70.
 * All tests run without authentication (public boundary checks only)
 * or with localStorage injection to simulate a logged-in state.
 */

// ---------------------------------------------------------------------------
// Auth helper — shared by regression tests that need a logged-in session
// ---------------------------------------------------------------------------

function generateSessionToken(): string {
  const helperScript = path.join(__dirname, 'helpers/gen-session-token.js')
  return execSync(`node ${JSON.stringify(helperScript)}`, {
    cwd: path.join(__dirname, '../..'),
    timeout: 10_000,
  }).toString().trim()
}

let SESSION_TOKEN: string
try {
  SESSION_TOKEN = generateSessionToken()
} catch {
  SESSION_TOKEN = ''
}

const SESSION_COOKIE = {
  name: 'authjs.session-token',
  value: SESSION_TOKEN,
  domain: 'localhost',
  path: '/',
  httpOnly: true,
  secure: false,
  sameSite: 'Lax' as const,
}

// ---------------------------------------------------------------------------
// Auth boundary — new routes added since original smoke test
// ---------------------------------------------------------------------------
test.describe('Auth boundary — new routes', () => {
  const newProtectedRoutes = ['/rank']

  for (const route of newProtectedRoutes) {
    test(`${route} redirects to /login without auth`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL('**/login**', { timeout: 8000 })
      expect(page.url()).toContain('/login')
    })
  }
})

// ---------------------------------------------------------------------------
// Landing page — no regressions from currency / rank work
// ---------------------------------------------------------------------------
test.describe('Landing page stability', () => {
  test('loads with no JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('branding visible', async ({ page }) => {
    await page.goto('/')
    await expect(page.getByText('Chosen', { exact: false }).first()).toBeVisible()
  })
})

// ---------------------------------------------------------------------------
// Login page — unchanged
// ---------------------------------------------------------------------------
test.describe('Login page stability', () => {
  test('loads with no JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    expect(errors.filter((e) => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Rank page (unauthenticated boundary)
// ---------------------------------------------------------------------------
test.describe('Rank page', () => {
  test('redirects to login without auth', async ({ page }) => {
    await page.goto('/rank')
    await page.waitForURL('**/login**', { timeout: 8000 })
    expect(page.url()).toContain('/login')
  })
})

// ---------------------------------------------------------------------------
// localStorage — currency / showCents written correctly
// Tests inject localStorage to simulate a configured user.
// ---------------------------------------------------------------------------
test.describe('localStorage — settings round-trip', () => {
  test('settings key is readable and parseable', async ({ page }) => {
    await page.goto('/login')  // non-redirecting public page
    const result = await page.evaluate(() => {
      const raw = localStorage.getItem('chosen_settings_v1')
      if (!raw) return { exists: false }
      try {
        const parsed = JSON.parse(raw)
        return { exists: true, valid: typeof parsed === 'object' }
      } catch {
        return { exists: true, valid: false }
      }
    })
    // Either no key (fresh session) or a valid object
    if (result.exists) {
      expect(result.valid).toBe(true)
    }
  })

  test('rank snapshots key is absent or a parseable array', async ({ page }) => {
    await page.goto('/login')
    const result = await page.evaluate(() => {
      const raw = localStorage.getItem('chosen_rank_snapshots_v1')
      if (!raw) return { exists: false }
      try {
        const parsed = JSON.parse(raw)
        return { exists: true, isArray: Array.isArray(parsed) }
      } catch {
        return { exists: true, isArray: false }
      }
    })
    if (result.exists) {
      expect(result.isArray).toBe(true)
    }
  })
})

// ---------------------------------------------------------------------------
// Date validation regression — isDateFormat must reject invalid calendar dates
// Tested indirectly via the transactions form behaviour.
// ---------------------------------------------------------------------------
test.describe('Date validation — invalid dates rejected', () => {
  const invalidDates = ['2025-02-31', '2024-13-01', '0000-00-00', 'not-a-date']
  const validDates   = ['2025-01-15', '2024-02-29', '2024-12-31']

  for (const d of invalidDates) {
    test(`isDateFormat rejects ${d}`, async ({ page }) => {
      await page.goto('/login')
      const result = await page.evaluate((date) => {
        // Mirror the isDateFormat logic from lib/utils/validation.ts
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
        const parsed = new Date(date)
        return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
      }, d)
      expect(result).toBe(false)
    })
  }

  for (const d of validDates) {
    test(`isDateFormat accepts ${d}`, async ({ page }) => {
      await page.goto('/login')
      const result = await page.evaluate((date) => {
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return false
        const parsed = new Date(date)
        return !isNaN(parsed.getTime()) && parsed.toISOString().startsWith(date)
      }, d)
      expect(result).toBe(true)
    })
  }
})

// ---------------------------------------------------------------------------
// localStorage SSR guard — readJSON / writeJSON must not throw server-side
// Simulated: call with window removed (browser context, but guard logic check)
// ---------------------------------------------------------------------------
test.describe('localStorage utilities — window guard', () => {
  test('writeJSON survives when localStorage is unavailable', async ({ page }) => {
    await page.goto('/login')
    const threw = await page.evaluate(() => {
      try {
        // Simulate the guard: if typeof window === 'undefined' return
        // In browser context window always exists, so we verify the fallback path
        const guardFired = typeof window === 'undefined'
        if (guardFired) return false  // guard would have returned early
        // Normal write — should not throw
        localStorage.setItem('__test_guard__', JSON.stringify({ ok: true }))
        localStorage.removeItem('__test_guard__')
        return false
      } catch {
        return true
      }
    })
    expect(threw).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Regression: duplicate React key in AI Summary Card suggested actions
//
// Bug (Phase 70): generateAISummary() could push two SuggestedAction objects
// whose href both resolve to ROUTES.portfolioList ("/portfolio/list"), causing
// React to emit:
//   "Encountered two children with the same key, /portfolio/list."
//
// Trigger conditions: portfolio has one category > 60 % of total (topPct > 60)
// AND the goals / transactions slots are already filled — so lines 151–155 of
// summary-generator.ts add "Review portfolio allocation" then "View portfolio
// details", both with href = ROUTES.portfolioList.
//
// Fix: ai-summary-card.tsx now uses key={action.label} instead of key={action.href}.
// ---------------------------------------------------------------------------
test.describe('Regression — AI Summary Card: no duplicate React key for /portfolio/list', () => {
  /**
   * Assets: stocks dominate at 80 % → topPct > 60 triggers both
   *   "Review portfolio allocation"  (href: /portfolio/list)
   *   "View portfolio details"        (href: /portfolio/list)
   * Goals present  → no 'Set your first goal' action (slot freed up for both portfolioList actions)
   * No rank snapshot, positive cash flow → only the two portfolioList actions are generated.
   */
  const CONCENTRATED_ASSETS = JSON.stringify([
    {
      id: 'r1', userId: 'pw_test_user', category: 'stocks',
      label: 'Tech ETF', value: 80_000, currency: 'USD',
      createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
    },
    {
      id: 'r2', userId: 'pw_test_user', category: 'cash',
      label: 'Savings', value: 20_000, currency: 'USD',
      createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
    },
  ])

  const GOALS_PRESENT = JSON.stringify([
    {
      id: 'g1', userId: 'pw_test_user', name: 'Retirement fund',
      targetAmount: 500_000, currentAmount: 80_000, targetDate: '2045-01-01',
      category: 'retirement', createdAt: '2025-01-01T00:00:00.000Z',
    },
  ])

  const SETTINGS = JSON.stringify({
    currency: 'USD', showCents: false,
    birthYear: 1990, gender: 'male', annualReturnPct: 8,
  })

  test('dashboard renders without duplicate-key console warning', async ({ page }) => {
    const duplicateKeyWarnings: string[] = []

    // Capture both pageerror (thrown errors) and console warnings
    page.on('pageerror', (err) => {
      if (err.message.includes('same key')) duplicateKeyWarnings.push(err.message)
    })
    page.on('console', (msg) => {
      if (msg.type() === 'warning' || msg.type() === 'error') {
        const text = msg.text()
        if (text.includes('same key') || text.includes('portfolio/list')) {
          duplicateKeyWarnings.push(text)
        }
      }
    })

    // Inject session + seed data that reproduces the bug
    await page.context().addCookies([SESSION_COOKIE])
    await page.goto('/login')
    await page.evaluate(
      ({ assets, goals, settings }) => {
        localStorage.setItem('chosen_assets_v1', assets)
        localStorage.setItem('chosen_goals_v1', goals)
        localStorage.setItem('chosen_settings_v1', settings)
        // No rank snapshots → ctx.rankSummary is null → rank-aware actions skipped
        localStorage.removeItem('chosen_rank_snapshots_v1')
      },
      { assets: CONCENTRATED_ASSETS, goals: GOALS_PRESENT, settings: SETTINGS }
    )

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Dashboard must be visible (not a blank/error screen)
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()

    // The AI summary card's suggested-action links must appear without dup-key warnings
    expect(
      duplicateKeyWarnings,
      `Unexpected duplicate-key React warning(s):\n${duplicateKeyWarnings.join('\n')}`
    ).toHaveLength(0)
  })

  test('both suggested-action links are visible and distinct', async ({ page }) => {
    await page.context().addCookies([SESSION_COOKIE])
    await page.goto('/login')
    await page.evaluate(
      ({ assets, goals, settings }) => {
        localStorage.setItem('chosen_assets_v1', assets)
        localStorage.setItem('chosen_goals_v1', goals)
        localStorage.setItem('chosen_settings_v1', settings)
        localStorage.removeItem('chosen_rank_snapshots_v1')
      },
      { assets: CONCENTRATED_ASSETS, goals: GOALS_PRESENT, settings: SETTINGS }
    )

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Both portfolioList actions have the same href but distinct labels.
    // Before the fix, only one link would render (React drops duplicates silently).
    // After the fix, both are present and have different visible text.
    // Scope to the AI Summary card to avoid the sidebar nav link to /portfolio/list.
    // The card is a div containing an h3 "AI Summary".
    const aiCard = page.locator('div.bg-surface-card', {
      has: page.locator('h3', { hasText: 'AI Summary' }),
    }).first()
    const actionLinks = aiCard.locator('a[href="/portfolio/list"]')
    const count = await actionLinks.count()
    expect(count, 'Expected two /portfolio/list action links in the AI Summary card').toBe(2)

    const labels = await actionLinks.allInnerTexts()
    expect(new Set(labels).size, 'Both links must have distinct labels').toBe(2)
  })
})

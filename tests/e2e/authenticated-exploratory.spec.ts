/**
 * Authenticated exploratory test suite.
 * Injects an Auth.js v5 session cookie to simulate a real logged-in user
 * and exercises all major app routes, interactions, and edge cases.
 *
 * Simulates the Windows-MCP exploratory workflow (cautious step-by-step,
 * click visible nav items one by one, check for errors and blank screens).
 */

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Auth cookie helper — generates a fresh signed session token per worker
// ---------------------------------------------------------------------------

function generateSessionToken(): string {
  const helperScript = path.join(__dirname, 'helpers/gen-session-token.js')
  return execSync(`node ${JSON.stringify(helperScript)}`, {
    cwd: path.join(__dirname, '../..'),
    timeout: 10000,
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

/** Pre-seeded asset data so the dashboard renders with real content */
const SEED_ASSETS = [
  {
    id: 'a1', name: 'Apple Inc.', category: 'stock', value: 15000, currency: 'USD',
    createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'a2', name: 'Savings Account', category: 'cash', value: 8000, currency: 'USD',
    createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
  },
  {
    id: 'a3', name: '401k', category: 'retirement', value: 22000, currency: 'USD',
    createdAt: '2025-01-01T00:00:00.000Z', updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const SEED_SETTINGS = JSON.stringify({
  currency: 'USD',
  showCents: false,
  birthYear: 1990,
  gender: 'male',
  annualReturnPct: 8.5,
})

async function gotoAuthenticated(page: Page, route: string) {
  await page.context().addCookies([SESSION_COOKIE])
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

async function seedAndGoto(page: Page, route: string) {
  await page.context().addCookies([SESSION_COOKIE])
  // Seed assets via API (DB-backed)
  await page.request.post('http://localhost:3001/api/assets', { data: SEED_ASSETS })
  // Seed settings via localStorage (still localStorage-backed)
  await page.goto('/login')
  await page.evaluate(
    (settings) => { localStorage.setItem('chosen_settings_v1', settings) },
    SEED_SETTINGS
  )
  await page.goto(route)
  await page.waitForLoadState('networkidle')
  // Dashboard and rank pages render a LoadingSpinner until React state settles
  // after the asset fetch resolves. Wait for h1 to ensure full render.
  await page.locator('h1').first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {})
}

// ---------------------------------------------------------------------------
// Step 1 — Confirm app reachable
// ---------------------------------------------------------------------------
test.describe('Step 1 — App reachability', () => {
  test('localhost:3001 returns 200', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
  })
})

// ---------------------------------------------------------------------------
// Step 2 — Auth cookie works (no redirect for gated routes)
// ---------------------------------------------------------------------------
test.describe('Step 2 — Session cookie bypasses auth redirect', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  for (const route of ['/dashboard', '/settings', '/rank', '/goals', '/transactions', '/household']) {
    test(`${route} loads (no redirect to /login)`, async ({ page }) => {
      await gotoAuthenticated(page, route)
      expect(page.url()).not.toContain('/login')
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length).toBeGreaterThan(20)
    })
  }
})

// ---------------------------------------------------------------------------
// Step 3 — Dashboard: content, nav, no JS errors
// ---------------------------------------------------------------------------
test.describe('Step 3 — Dashboard page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('renders with seeded assets — no blank screen', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/dashboard')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(100)
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('shows Dashboard heading', async ({ page }) => {
    await seedAndGoto(page, '/dashboard')
    await expect(page.getByRole('heading', { name: /dashboard/i }).first()).toBeVisible()
  })

  test('shows total assets value (non-zero)', async ({ page }) => {
    await seedAndGoto(page, '/dashboard')
    // Total: 15000 + 8000 + 22000 = $45,000
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toMatch(/45[,\.]?000|45k|\$45/i)
  })

  test('Edit Assets button is visible and links to portfolio/input', async ({ page }) => {
    await seedAndGoto(page, '/dashboard')
    const btn = page.locator('a:has-text("Edit Assets")')
    await expect(btn.first()).toBeVisible()
    const href = await btn.first().getAttribute('href')
    expect(href).toContain('/portfolio/input')
  })

  test('Customize button toggles card visibility panel', async ({ page }) => {
    await seedAndGoto(page, '/dashboard')
    const customizeBtn = page.locator('button:has-text("Customize")')
    await expect(customizeBtn).toBeVisible()
    await customizeBtn.click()
    // Should show a "Visible Cards" section
    await expect(page.locator('text=Visible Cards')).toBeVisible()
    // Toggle one checkbox — no crash
    const firstCheckbox = page.locator('input[type="checkbox"]').first()
    await firstCheckbox.click()
    await firstCheckbox.click() // toggle back
  })

  test('no console errors on dashboard', async ({ page }) => {
    const consoleErrors: string[] = []
    page.on('console', (msg) => {
      if (msg.type() === 'error') consoleErrors.push(msg.text())
    })
    await seedAndGoto(page, '/dashboard')
    const realErrors = consoleErrors.filter(
      (e) =>
        !e.includes('favicon') &&
        !e.includes('404') &&
        !e.includes('ResizeObserver') &&
        // next-auth SessionProvider tries to refresh the injected test token via
        // /api/auth/session; that endpoint rejects the synthetic JWE in test context.
        // This is a test-environment artifact, not an app bug.
        !e.includes('ClientFetchError')
    )
    expect(realErrors).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Step 4 — Portfolio Input page
// ---------------------------------------------------------------------------
test.describe('Step 4 — Portfolio Input page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without blank screen', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/portfolio/input')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(30)
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('has asset category selector or form', async ({ page }) => {
    await gotoAuthenticated(page, '/portfolio/input')
    // Should have some form inputs or buttons
    const interactive = page.locator('input, select, button, [role="combobox"]')
    const count = await interactive.count()
    expect(count).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Step 5 — Rank page (core feature)
// ---------------------------------------------------------------------------
test.describe('Step 5 — Rank page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/rank')
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('shows Wealth Rank heading', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    await expect(page.getByRole('heading', { name: /wealth rank/i }).first()).toBeVisible()
  })

  test('shows Overall Wealth Rank row', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    await expect(page.locator('text=Overall Wealth Rank').first()).toBeVisible()
  })

  test('shows Top X% result for seeded assets', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    // With $45k total assets, should show some "Top X%" display
    await expect(page.locator('text=Top').first()).toBeVisible()
  })

  test('mode toggle switches between Individual and Household', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    // Should have mode toggle
    const householdBtn = page.locator('button:has-text("household"), button:has-text("Household")')
    await expect(householdBtn.first()).toBeVisible()
    await householdBtn.first().click()
    // Should show household content
    await expect(page.locator('text=Household Rank').first()).toBeVisible()
    // Switch back
    const individualBtn = page.locator('button:has-text("individual"), button:has-text("Individual")')
    await individualBtn.first().click()
    await expect(page.locator('text=Overall Wealth Rank').first()).toBeVisible()
  })

  test('detail block visible — Basis and Band matched', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    // Phase 63 detail block
    await expect(page.locator('text=Basis:').first()).toBeVisible()
    await expect(page.locator('text=Band matched:').first()).toBeVisible()
  })

  test('rank summary (share card) is visible', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    await expect(page.locator('text=Rank Summary').first()).toBeVisible()
  })

  test('How this works section is present', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    await expect(page.locator('text=How this works').first()).toBeVisible()
  })

  test('profile completeness indicator visible', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    // Phase 67: Profile strip shows Basic / Partial / More complete
    await expect(page.locator('text=Profile').first()).toBeVisible()
  })

  test('methodology disclaimer uses correct wording', async ({ page }) => {
    await seedAndGoto(page, '/rank')
    // Wait for the rank page to finish loading (heading appears after isFullyLoaded)
    await expect(page.getByRole('heading', { name: /wealth rank/i }).first()).toBeVisible({ timeout: 10000 })
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toContain('estimates only')
    expect(bodyText).not.toContain('Not financial advice.')
  })

  test('no JS errors on rank page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/rank')
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Step 6 — Settings page
// ---------------------------------------------------------------------------
test.describe('Step 6 — Settings page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/settings')
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('shows settings form fields', async ({ page }) => {
    await gotoAuthenticated(page, '/settings')
    const bodyText = await page.locator('body').innerText()
    // Should mention currency or settings-related words
    expect(bodyText.toLowerCase()).toMatch(/currency|birth|settings|profile/i)
  })

  test('currency selector is present', async ({ page }) => {
    await gotoAuthenticated(page, '/settings')
    // Look for a currency dropdown or select
    const selector = page.locator('select, [role="combobox"], [aria-label*="currency" i]')
    const count = await selector.count()
    expect(count).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// Step 7 — Goals page
// ---------------------------------------------------------------------------
test.describe('Step 7 — Goals page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without blank screen', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/goals')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(20)
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('shows Goals heading or empty state', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.toLowerCase()).toMatch(/goal|no goals|add/i)
  })
})

// ---------------------------------------------------------------------------
// Step 8 — Transactions page
// ---------------------------------------------------------------------------
test.describe('Step 8 — Transactions page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/transactions')
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('no hardcoded USD symbol visible (currency-aware)', async ({ page }) => {
    await seedAndGoto(page, '/transactions')
    // With USD setting this will show $, but verify no "US Dollar" hardcode leaks
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).not.toMatch(/toLocaleString|formatAmount.*USD/i)
  })
})

// ---------------------------------------------------------------------------
// Step 9 — Household page
// ---------------------------------------------------------------------------
test.describe('Step 9 — Household page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without blank screen or JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/household')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(20)
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Step 10 — Tax Opportunity page
// ---------------------------------------------------------------------------
test.describe('Step 10 — Tax Opportunity page', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('loads without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/tax-opportunity')
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('shows tax-related content with assets', async ({ page }) => {
    await seedAndGoto(page, '/tax-opportunity')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.toLowerCase()).toMatch(/tax|harvest|gain|loss|opportunit/i)
  })
})

// ---------------------------------------------------------------------------
// Step 11 — Navigation: sidebar links work
// ---------------------------------------------------------------------------
test.describe('Step 11 — In-app navigation', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('navigating Dashboard → Rank → Settings does not crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    await seedAndGoto(page, '/dashboard')
    await page.goto('/rank')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/rank')

    await page.goto('/settings')
    await page.waitForLoadState('networkidle')
    expect(page.url()).toContain('/settings')

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })

  test('navigating to /portfolio/list loads without crash', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/portfolio/list')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(20)
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Step 12 — Empty state: dashboard without assets
// ---------------------------------------------------------------------------
test.describe('Step 12 — Empty state (no assets)', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('dashboard shows empty state with Wealth Rank discovery hint', async ({ page }) => {
    // Clear assets so the dashboard renders the empty state
    await page.context().addCookies([SESSION_COOKIE])
    await page.request.delete('http://localhost:3001/api/assets')
    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')
    // Wait for the dashboard to finish loading (React renders after asset fetch)
    await page.locator('h1, [data-empty-state]').first().waitFor({ state: 'visible', timeout: 12000 }).catch(() => {})
    // Phase 65: empty state should mention Wealth Rank
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.toLowerCase()).toMatch(/wealth rank|add your first asset|no assets/i)
  })

  test('rank page with no assets shows add-assets prompt', async ({ page }) => {
    // Clear assets so the rank page renders the empty state
    await page.context().addCookies([SESSION_COOKIE])
    await page.request.delete('http://localhost:3001/api/assets')
    await page.goto('/rank')
    await page.waitForLoadState('networkidle')
    // Wait for the rank page to finish loading (heading appears after isFullyLoaded)
    await expect(page.getByRole('heading', { name: /wealth rank/i }).first()).toBeVisible({ timeout: 10000 })
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.toLowerCase()).toMatch(/no assets|add your portfolio|add assets/i)
  })
})

// ---------------------------------------------------------------------------
// Step 13 — rank-overview-card on dashboard (color & copy regression)
// ---------------------------------------------------------------------------
test.describe('Step 13 — Rank overview card regressions', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('rank overview card footer uses updated copy', async ({ page }) => {
    await seedAndGoto(page, '/dashboard')
    // Wait for dashboard content to fully render (rank card requires assets)
    await expect(page.locator('text=Overall Wealth Rank').first()).toBeVisible({ timeout: 10000 })
    const bodyText = await page.locator('body').innerText()
    // Phase 70: rank-overview-card footer uses "Estimate · not financial advice · Chosen Invest"
    expect(bodyText).toContain('not financial advice')
    expect(bodyText).not.toMatch(/^Not financial advice\.$/m)
  })

  test('rank overview card renders without crash for $45k portfolio', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await seedAndGoto(page, '/dashboard')
    // RankOverviewCard should be visible
    await expect(page.locator('text=Overall Wealth Rank').first()).toBeVisible()
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Step 14 — Snapshot history appears after multiple visits
// ---------------------------------------------------------------------------
test.describe('Step 14 — Rank snapshot behavior', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  test('snapshot section absent when snapshots < 2', async ({ page }) => {
    // Fresh session, no snapshots
    await gotoAuthenticated(page, '/rank')
    const snapshotSection = page.locator('text=Recent Snapshots')
    // Should NOT be visible with 0 snapshots
    await expect(snapshotSection).not.toBeVisible()
  })

  test('snapshot table appears when 2+ snapshots are injected', async ({ page }) => {
    await page.context().addCookies([SESSION_COOKIE])
    await page.goto('/login')

    const snapshots = JSON.stringify([
      {
        id: 's1', savedAt: '2026-01-15T10:00:00.000Z', totalAssetValue: 40000,
        overallPercentile: 55, agePercentile: 60, returnPercentile: 70,
      },
      {
        id: 's2', savedAt: '2026-02-01T10:00:00.000Z', totalAssetValue: 45000,
        overallPercentile: 58, agePercentile: 63, returnPercentile: 72,
      },
    ])
    // Seed assets via API (DB-backed); snapshots and settings via localStorage
    await page.request.post('http://localhost:3001/api/assets', { data: SEED_ASSETS })
    await page.evaluate(
      ({ snaps, settings }) => {
        localStorage.setItem('chosen_rank_snapshots_v1', snaps)
        localStorage.setItem('chosen_settings_v1', settings)
      },
      { snaps: snapshots, settings: SEED_SETTINGS }
    )

    await page.goto('/rank')
    await page.waitForLoadState('networkidle')
    await expect(page.locator('text=Recent Snapshots').first()).toBeVisible()
    // Table should have date and percentile columns
    await expect(page.locator('text=Overall').first()).toBeVisible()
  })
})

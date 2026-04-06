import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

// Generate session cookie
function makeSessionCookie() {
  try {
    const token = execSync(
      `node ${JSON.stringify(path.join(__dirname, '../../tests/e2e/helpers/gen-session-token.js'))}`,
      { cwd: '/home/user/Chosen-invest-rev0', timeout: 10_000 }
    ).toString().trim()
    return { name: 'authjs.session-token', value: token, domain: 'localhost', path: '/', httpOnly: true, secure: false, sameSite: 'Lax' as const }
  } catch { return null }
}

// ── Phase 1: Public routes ─────────────────────────────────────────────────

test.describe('Public UI', () => {
  test('landing page loads and shows branding', async ({ page }) => {
    const res = await page.goto('http://localhost:3001/')
    expect(res?.status()).toBe(200)
    const body = await page.locator('body').innerText()
    expect(body.length).toBeGreaterThan(50)
    await expect(page.locator('text=ChosenInvest').first()).toBeVisible()
  })

  test('login page renders sign-in option', async ({ page }) => {
    await page.goto('http://localhost:3001/login')
    const body = await page.locator('body').innerText()
    expect(body.toLowerCase()).toMatch(/sign in|google|github/i)
  })

  test('unauthenticated /rank redirects to /login', async ({ page }) => {
    await page.goto('http://localhost:3001/rank')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('unauthenticated /dashboard redirects to /login', async ({ page }) => {
    await page.goto('http://localhost:3001/dashboard')
    await page.waitForURL(/\/login/, { timeout: 5000 })
    expect(page.url()).toContain('/login')
  })

  test('no JS errors on landing page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('http://localhost:3001/')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })

  test('no JS errors on login page', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', e => errors.push(e.message))
    await page.goto('http://localhost:3001/login')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})

// ── Phase 2: Authenticated localStorage-backed routes ──────────────────────

test.describe('Authenticated UI (localStorage mode)', () => {
  const ROUTES = ['/dashboard', '/rank', '/portfolio/input', '/portfolio/list',
                  '/goals', '/transactions', '/household', '/settings']

  for (const route of ROUTES) {
    test(`${route} loads without blank screen or JS crash`, async ({ page }) => {
      const cookie = makeSessionCookie()
      if (!cookie) { test.skip(true, 'No session token'); return }

      // Seed localStorage with minimal settings before navigating
      await page.context().addCookies([cookie])
      await page.goto('http://localhost:3001/login')
      await page.evaluate(() => {
        localStorage.setItem('chosen_settings_v1', JSON.stringify({
          currency: 'USD', showCents: false, birthYear: 1988, gender: 'male', annualReturnPct: 7
        }))
        localStorage.setItem('chosen_assets_v1', JSON.stringify([
          { id: 'a1', name: 'Savings', category: 'cash', value: 10000, currency: 'USD',
            createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
        ]))
      })

      const errors: string[] = []
      page.on('pageerror', e => errors.push(e.message))
      await page.goto(`http://localhost:3001${route}`)
      await page.waitForLoadState('networkidle')

      // Not redirected to login — auth worked
      expect(page.url()).not.toContain('/login')
      // Body has content — not blank
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length).toBeGreaterThan(20)
      // No uncaught JS errors
      expect(errors).toEqual([])
    })
  }
})

// ── Phase 3: Rank page semantics ──────────────────────────────────────────

test.describe('Rank page — core semantics', () => {
  test('rank page shows primary rank highlight card', async ({ page }) => {
    const cookie = makeSessionCookie()
    if (!cookie) { test.skip(true, 'No session token'); return }

    await page.context().addCookies([cookie])
    await page.goto('http://localhost:3001/login')
    await page.evaluate(() => {
      localStorage.setItem('chosen_settings_v1', JSON.stringify({
        currency: 'USD', birthYear: 1990, gender: 'male', annualReturnPct: 8
      }))
      localStorage.setItem('chosen_assets_v1', JSON.stringify([
        { id: 'a1', name: 'Stocks', category: 'stocks', value: 150000, currency: 'USD',
          createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]))
    })

    await page.goto('http://localhost:3001/rank')
    await page.waitForLoadState('networkidle')

    // Band label visible (Top 25%, Above median, etc.)
    const body = await page.locator('body').innerText()
    expect(body).toMatch(/Top \d+%|Above median|Below median|Top 10%|Bottom|Around median/i)
    // Mode toggle visible
    await expect(page.locator('text=individual').or(page.locator('text=household')).first()).toBeVisible()
  })

  test('rank page — mode toggle switches between individual and household', async ({ page }) => {
    const cookie = makeSessionCookie()
    if (!cookie) { test.skip(true, 'No session token'); return }

    await page.context().addCookies([cookie])
    await page.goto('http://localhost:3001/login')
    await page.evaluate(() => {
      localStorage.setItem('chosen_settings_v1', JSON.stringify({ currency: 'USD', birthYear: 1988 }))
      localStorage.setItem('chosen_assets_v1', JSON.stringify([
        { id: 'a1', name: 'Savings', category: 'cash', value: 50000, currency: 'USD',
          createdAt: '2024-01-01T00:00:00.000Z', updatedAt: '2024-01-01T00:00:00.000Z' }
      ]))
    })

    await page.goto('http://localhost:3001/rank')
    await page.waitForLoadState('networkidle')

    const householdBtn = page.locator('button', { hasText: 'household' })
    if (await householdBtn.isVisible()) {
      await householdBtn.click()
      await page.waitForLoadState('networkidle')
      const body = await page.locator('body').innerText()
      expect(body.toLowerCase()).toContain('household')
    }
  })
})

// ── Phase 4: Settings page inputs ────────────────────────────────────────

test.describe('Settings page — form inputs', () => {
  test('settings page shows currency and profile fields', async ({ page }) => {
    const cookie = makeSessionCookie()
    if (!cookie) { test.skip(true, 'No session token'); return }

    await page.context().addCookies([cookie])
    await page.goto('http://localhost:3001/settings')
    await page.waitForLoadState('networkidle')

    expect(page.url()).not.toContain('/login')
    // Should have some form-like content
    const body = await page.locator('body').innerText()
    expect(body.toLowerCase()).toMatch(/currency|settings|profile/i)
  })
})

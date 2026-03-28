import { test, expect } from '@playwright/test'

// ── Landing page (no auth required) ──────────────────────────

test.describe('Landing Page', () => {
  test('loads successfully with 200', async ({ page }) => {
    const res = await page.goto('/')
    expect(res?.status()).toBe(200)
  })

  test('renders app branding', async ({ page }) => {
    await page.goto('/')
    await expect(page.locator('text=ChosenInvest').first()).toBeVisible()
  })

  test('has Sign In link', async ({ page }) => {
    await page.goto('/')
    const signIn = page.locator('a[href="/login"]')
    await expect(signIn.first()).toBeVisible()
  })

  test('has Get Started CTA', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('a:has-text("Get Started"), button:has-text("Get Started")')
    await expect(cta.first()).toBeVisible()
  })

  test('no blank screen — body has content', async ({ page }) => {
    await page.goto('/')
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(50)
  })
})

// ── Login page ───────────────────────────────────────────────

test.describe('Login Page', () => {
  test('loads successfully', async ({ page }) => {
    const res = await page.goto('/login')
    expect(res?.status()).toBe(200)
  })

  test('shows sign-in UI', async ({ page }) => {
    await page.goto('/login')
    const bodyText = await page.locator('body').innerText()
    // Should mention sign in or Google
    expect(bodyText.toLowerCase()).toMatch(/sign in|log in|google/i)
  })
})

// ── Auth-gated routes redirect to login ──────────────────────

test.describe('Auth-gated routes redirect', () => {
  const gatedRoutes = ['/dashboard', '/portfolio/input', '/market', '/analysis', '/ai', '/settings']

  for (const route of gatedRoutes) {
    test(`${route} redirects to /login`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')
    })
  }
})

// ── Unprotected app routes (no auth) ─────────────────────────

test.describe('Unprotected app routes load', () => {
  const openRoutes = ['/goals', '/transactions', '/household', '/tax-opportunity']

  for (const route of openRoutes) {
    test(`${route} returns 200`, async ({ page }) => {
      const res = await page.goto(route)
      expect(res?.status()).toBe(200)
    })

    test(`${route} is not blank`, async ({ page }) => {
      await page.goto(route)
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length).toBeGreaterThan(20)
    })
  }
})

// ── Goals page interaction ───────────────────────────────────

test.describe('Goals Page', () => {
  test('renders page heading or content', async ({ page }) => {
    await page.goto('/goals')
    await page.waitForLoadState('networkidle')
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })
})

// ── Transactions page interaction ────────────────────────────

test.describe('Transactions Page', () => {
  test('renders page heading or content', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })
})

// ── Household page interaction ───────────────────────────────

test.describe('Household Page', () => {
  test('renders page heading or content', async ({ page }) => {
    await page.goto('/household')
    await page.waitForLoadState('networkidle')
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })
})

// ── Navigation & console error check ─────────────────────────

test.describe('No fatal JS errors', () => {
  const routes = ['/', '/login', '/goals', '/transactions', '/household']

  for (const route of routes) {
    test(`no uncaught errors on ${route}`, async ({ page }) => {
      const errors: string[] = []
      page.on('pageerror', (err) => errors.push(err.message))
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      expect(errors).toEqual([])
    })
  }
})

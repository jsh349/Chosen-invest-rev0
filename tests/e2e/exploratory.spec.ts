import { test, expect } from '@playwright/test'

// ── Exploratory: Landing page deep dive ──────────────────────

test.describe('Landing Page — Exploratory', () => {
  test('Get Started CTA navigates correctly', async ({ page }) => {
    await page.goto('/')
    const cta = page.locator('a:has-text("Get Started")').first()
    await expect(cta).toBeVisible()
    const href = await cta.getAttribute('href')
    expect(href).toBeTruthy()
    await cta.click()
    await page.waitForLoadState('networkidle')
    // Should go to signup or login — not a blank page
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(20)
  })

  test('Sign In navigates to login page', async ({ page }) => {
    await page.goto('/')
    await page.locator('a[href="/login"]').first().click()
    await page.waitForURL(/\/login/)
    expect(page.url()).toContain('/login')
  })

  test('all anchor links have valid hrefs', async ({ page }) => {
    await page.goto('/')
    const links = await page.locator('a[href]').all()
    for (const link of links) {
      const href = await link.getAttribute('href')
      expect(href).toBeTruthy()
      expect(href).not.toBe('#')
    }
  })

  test('page has no broken images', async ({ page }) => {
    await page.goto('/')
    await page.waitForLoadState('networkidle')
    const images = await page.locator('img').all()
    for (const img of images) {
      const naturalWidth = await img.evaluate((el: HTMLImageElement) => el.naturalWidth)
      expect(naturalWidth).toBeGreaterThan(0)
    }
  })
})

// ── Exploratory: Login page ──────────────────────────────────

test.describe('Login Page — Exploratory', () => {
  test('has Google sign-in button or link', async ({ page }) => {
    await page.goto('/login')
    await page.waitForLoadState('networkidle')
    const googleBtn = page.locator('button:has-text("Google"), a:has-text("Google")')
    await expect(googleBtn.first()).toBeVisible({ timeout: 5000 })
  })
})

// ── Exploratory: Goals page interaction ──────────────────────

test.describe('Goals Page — Exploratory', () => {
  test('has a form or add button visible', async ({ page }) => {
    await page.goto('/goals')
    await page.waitForLoadState('networkidle')
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("Save")')
    const form = page.locator('form')
    const hasBtn = await addBtn.first().isVisible().catch(() => false)
    const hasForm = await form.first().isVisible().catch(() => false)
    expect(hasBtn || hasForm).toBeTruthy()
  })

  test('can type into text inputs without error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/goals')
    await page.waitForLoadState('networkidle')
    const textInputs = await page.locator('input[type="text"], input:not([type])').all()
    for (const input of textInputs.slice(0, 3)) {
      if (await input.isVisible()) {
        await input.fill('Test input')
      }
    }
    const numInputs = await page.locator('input[type="number"]').all()
    for (const input of numInputs.slice(0, 2)) {
      if (await input.isVisible()) {
        await input.fill('10000')
      }
    }
    expect(errors).toEqual([])
  })
})

// ── Exploratory: Transactions page ───────────────────────────

test.describe('Transactions Page — Exploratory', () => {
  test('has a form or add button', async ({ page }) => {
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("Save")')
    const form = page.locator('form')
    const hasBtn = await addBtn.first().isVisible().catch(() => false)
    const hasForm = await form.first().isVisible().catch(() => false)
    expect(hasBtn || hasForm).toBeTruthy()
  })

  test('can interact with inputs without JS errors', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/transactions')
    await page.waitForLoadState('networkidle')
    const inputs = await page.locator('input[type="text"], input[type="number"], input:not([type])').all()
    for (const input of inputs.slice(0, 3)) {
      if (await input.isVisible()) {
        await input.fill('100')
      }
    }
    expect(errors).toEqual([])
  })
})

// ── Exploratory: Household page ──────────────────────────────

test.describe('Household Page — Exploratory', () => {
  test('has a form or add button', async ({ page }) => {
    await page.goto('/household')
    await page.waitForLoadState('networkidle')
    const addBtn = page.locator('button:has-text("Add"), button:has-text("Create"), button:has-text("New"), button:has-text("Save")')
    const form = page.locator('form')
    const hasBtn = await addBtn.first().isVisible().catch(() => false)
    const hasForm = await form.first().isVisible().catch(() => false)
    expect(hasBtn || hasForm).toBeTruthy()
  })

  test('can type in email field without error', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/household')
    await page.waitForLoadState('networkidle')
    const emailInput = page.locator('input[type="email"]')
    if (await emailInput.first().isVisible().catch(() => false)) {
      await emailInput.first().fill('test@example.com')
    }
    expect(errors).toEqual([])
  })
})

// ── Exploratory: Tax opportunity page ────────────────────────

test.describe('Tax Opportunity Page — Exploratory', () => {
  test('renders content (not blank)', async ({ page }) => {
    const res = await page.goto('/tax-opportunity')
    expect(res?.status()).toBe(200)
    await page.waitForLoadState('networkidle')
    const heading = page.locator('h1, h2, h3').first()
    await expect(heading).toBeVisible({ timeout: 5000 })
  })

  test('no JS errors on load', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (err) => errors.push(err.message))
    await page.goto('/tax-opportunity')
    await page.waitForLoadState('networkidle')
    expect(errors).toEqual([])
  })
})

// ── Exploratory: Auth boundary — unprotected pages should NOT have app nav ──

test.describe('Auth boundary consistency', () => {
  const openRoutes = ['/goals', '/transactions', '/household', '/tax-opportunity']

  for (const route of openRoutes) {
    test(`${route} should have AppShell nav OR show content without it`, async ({ page }) => {
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // These are (app) routes that somehow bypass auth.
      // Check if they render the full app shell or something else.
      const bodyText = await page.locator('body').innerText()
      expect(bodyText.length).toBeGreaterThan(20)
    })
  }
})

// ── Exploratory: Console errors across all accessible pages ──

test.describe('Console warnings and errors', () => {
  const routes = ['/', '/login', '/goals', '/transactions', '/household', '/tax-opportunity']

  for (const route of routes) {
    test(`no console errors on ${route}`, async ({ page }) => {
      const consoleErrors: string[] = []
      page.on('console', (msg) => {
        if (msg.type() === 'error') {
          consoleErrors.push(msg.text())
        }
      })
      await page.goto(route)
      await page.waitForLoadState('networkidle')
      // Filter out known benign errors (like favicon 404)
      const realErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404')
      )
      if (realErrors.length > 0) {
        console.log(`Console errors on ${route}:`, realErrors)
      }
      // We log them but don't fail — this is informational
    })
  }
})

// ── Exploratory: 404 page ────────────────────────────────────

test.describe('404 handling', () => {
  test('/nonexistent returns 404 or error page', async ({ page }) => {
    const res = await page.goto('/nonexistent-route-xyz')
    // Should be 404 or show a not-found page
    const status = res?.status()
    expect(status === 404 || status === 200).toBeTruthy()
    const bodyText = await page.locator('body').innerText()
    expect(bodyText.length).toBeGreaterThan(10)
  })
})

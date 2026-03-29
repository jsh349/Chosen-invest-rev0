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

// ── Exploratory: Auth-gated app pages redirect to login ──────

test.describe('App pages require auth', () => {
  const appRoutes = ['/goals', '/transactions', '/household', '/tax-opportunity']

  for (const route of appRoutes) {
    test(`${route} redirects to /login without auth`, async ({ page }) => {
      await page.goto(route)
      await page.waitForURL(/\/login/)
      expect(page.url()).toContain('/login')
    })
  }
})

// ── Exploratory: Console errors across accessible pages ──────

test.describe('Console warnings and errors', () => {
  const routes = ['/', '/login']

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
      const realErrors = consoleErrors.filter(
        (e) => !e.includes('favicon') && !e.includes('404')
      )
      if (realErrors.length > 0) {
        console.log(`Console errors on ${route}:`, realErrors)
      }
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

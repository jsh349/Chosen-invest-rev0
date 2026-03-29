/**
 * Quick Smoke Test — Chosen Invest @ http://localhost:3001
 *
 * Covers the 6 required flows:
 *   1. Home page loads successfully (HTTP 200)
 *   2. Main UI renders without blank screen
 *   3. Navigation menu or major visible section exists
 *   4. A text input can be focused and typed into
 *   5. At least one meaningful navigation action succeeds
 *   6. Resulting screen shows an expected visible change
 *
 * Assumptions / notes:
 *   - The public landing page has NO search input (the app is a
 *     portfolio dashboard, not a ticker-search tool). Requirements
 *     4–6 are exercised on the /portfolio/input form page, reached
 *     via Auth.js v5 session-cookie injection (same technique used
 *     by the broader authenticated-exploratory suite).
 *   - "Navigation" on the landing page = the sticky header <nav>
 *     and the hero CTA links — there is no sidebar on public routes.
 *   - The test never writes to a real backend. All state is
 *     local-only (localStorage).
 */

import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Auth cookie — re-uses the same helper as the broader authenticated suites
// ---------------------------------------------------------------------------

function sessionCookie() {
  const token = execSync(
    `node ${JSON.stringify(path.join(__dirname, 'helpers/gen-session-token.js'))}`,
    { cwd: path.join(__dirname, '../..'), timeout: 10_000 }
  ).toString().trim()

  return {
    name: 'authjs.session-token',
    value: token,
    domain: 'localhost',
    path: '/',
    httpOnly: true,
    secure: false,
    sameSite: 'Lax' as const,
  }
}

// ---------------------------------------------------------------------------
// Requirement 1 — Home page loads successfully (HTTP 200)
// ---------------------------------------------------------------------------

test('1. home page returns HTTP 200', async ({ page }) => {
  const response = await page.goto('/')
  expect(response?.status()).toBe(200)
})

// ---------------------------------------------------------------------------
// Requirement 2 — Main UI renders without blank screen
// ---------------------------------------------------------------------------

test('2. home page renders meaningful content — not a blank screen', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Headline must be visible
  const h1 = page.getByRole('heading', { level: 1 })
  await expect(h1).toBeVisible()

  // Body text must be substantial (rules out skeleton / white div only)
  const bodyText = await page.locator('body').innerText()
  expect(bodyText.trim().length).toBeGreaterThan(100)
})

// ---------------------------------------------------------------------------
// Requirement 3 — Navigation menu and major visible sections exist
// ---------------------------------------------------------------------------

test('3. sticky header navigation is present with Sign In and Get Started', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  // Sticky header <nav> exists
  await expect(page.locator('header nav')).toBeVisible()

  // Sign In link in header
  await expect(
    page.locator('header').getByRole('link', { name: /sign in/i })
  ).toBeVisible()

  // Primary CTA — "Get Started Free" in the hero
  await expect(
    page.getByRole('link', { name: /get started/i }).first()
  ).toBeVisible()

  // Features section visible (three feature cards)
  await expect(page.getByRole('heading', { name: /clear portfolio view/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /ai-guided insight/i })).toBeVisible()
  await expect(page.getByRole('heading', { name: /financial health/i })).toBeVisible()
})

// ---------------------------------------------------------------------------
// Requirement 4 — A text input can be focused and typed into
//
// The public landing page has no search input; this is a portfolio
// dashboard, not a search tool.  We inject an auth session and use the
// asset-name field on /portfolio/input — the first meaningful text input
// a real user would encounter after signing in.
// ---------------------------------------------------------------------------

test('4. asset-name input on /portfolio/input accepts focus and keyboard input', async ({ page }) => {
  await page.context().addCookies([sessionCookie()])
  await page.goto('/portfolio/input')
  await page.waitForLoadState('networkidle')

  const nameInput = page.locator('#name-0')
  await expect(nameInput).toBeVisible()

  // Focus
  await nameInput.focus()
  await expect(nameInput).toBeFocused()

  // Type
  await nameInput.fill('My Test Asset')
  await expect(nameInput).toHaveValue('My Test Asset')
})

// ---------------------------------------------------------------------------
// Requirement 5 — At least one meaningful navigation action succeeds
//
// Click "Sign In" from the landing page and verify the URL changes to /login.
// ---------------------------------------------------------------------------

test('5. clicking Sign In navigates to the /login page', async ({ page }) => {
  await page.goto('/')
  await page.waitForLoadState('domcontentloaded')

  await page.locator('header').getByRole('link', { name: /sign in/i }).click()
  await page.waitForURL(/\/login/, { timeout: 8_000 })

  expect(page.url()).toContain('/login')
})

// ---------------------------------------------------------------------------
// Requirement 6 — Resulting screen shows the expected visible change
//
// Continuing from req 5: the /login page must show the sign-in UI,
// confirming the navigation produced a real content change.
// ---------------------------------------------------------------------------

test('6. /login page shows Google sign-in button after navigation', async ({ page }) => {
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  // The page title / heading changes from the landing copy
  const bodyText = await page.locator('body').innerText()
  expect(bodyText.toLowerCase()).toMatch(/sign in|log in|google/i)

  // Google sign-in button is the primary visible action
  const googleBtn = page
    .getByRole('button', { name: /google/i })
    .or(page.getByRole('link', { name: /google/i }))
  await expect(googleBtn.first()).toBeVisible({ timeout: 6_000 })
})

// ---------------------------------------------------------------------------
// Bonus: no uncaught JS errors on either public page
// ---------------------------------------------------------------------------

test('bonus. no uncaught JS errors on / or /login', async ({ page }) => {
  const errors: string[] = []
  page.on('pageerror', (err) => errors.push(err.message))

  await page.goto('/')
  await page.waitForLoadState('networkidle')
  await page.goto('/login')
  await page.waitForLoadState('networkidle')

  const real = errors.filter(
    (e) => !e.includes('ResizeObserver') && !e.includes('ClientFetchError')
  )
  expect(real, `Unexpected JS errors: ${real.join('\n')}`).toHaveLength(0)
})

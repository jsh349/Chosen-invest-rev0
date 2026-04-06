/**
 * Regression: auth middleware redirect target
 *
 * Bug: AUTH_URL=https://www.choseninvest.com in .env.local causes unauthenticated
 * requests to protected routes to redirect to the production domain instead of
 * http://localhost:3001/login. Playwright receives ERR_INVALID_AUTH_CREDENTIALS
 * when following the production redirect.
 *
 * Expected: /rank  → redirects to http://localhost:3001/login
 * Actual:   /rank  → redirects to https://www.choseninvest.com/login  ← BROKEN
 *
 * Fix required: set AUTH_URL=http://localhost:3001 in local dev / CI environments.
 * Note: also requires removing the __Secure- cookie prefix for HTTP localhost
 * (Next.js Auth.js uses __Secure- when AUTH_URL is https://...).
 *
 * These tests document the expected behavior once the env is corrected.
 * They will FAIL until AUTH_URL is changed to http://localhost:3001.
 */

import { test, expect } from '@playwright/test'

const PROTECTED_ROUTES = ['/dashboard', '/rank', '/portfolio/list', '/portfolio/input']

test.describe('Auth redirect — should redirect to LOCAL login', () => {
  for (const route of PROTECTED_ROUTES) {
    test(`unauthenticated ${route} redirects to localhost /login`, async ({ page }) => {
      // This test will fail if AUTH_URL points to the production domain.
      // Expected behavior: redirect stays on localhost, URL contains /login.
      await page.goto(route)

      // Allow up to 5 s for the redirect to settle
      await page.waitForURL((url) => url.href.includes('/login'), { timeout: 5_000 })
        .catch(() => {/* swallow — assertion below will fail with clear message */})

      const finalUrl = page.url()
      expect(
        finalUrl,
        `Expected localhost /login redirect, but got: ${finalUrl}\n` +
        `Fix: set AUTH_URL=http://localhost:3001 in .env.local`,
      ).toMatch(/localhost.*\/login/)
    })
  }
})

test.describe('Auth redirect — /login itself is reachable', () => {
  test('/login loads without following external redirects', async ({ page }) => {
    const response = await page.goto('/login')
    expect(response?.status()).toBe(200)
    expect(page.url()).toContain('localhost')
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })
})

test.describe('Auth error state — /login?error= renders user-visible message', () => {
  // OAuthSignin is the most common error code returned by NextAuth on OAuth failure.
  // The login page maps it to "Sign-in failed. Please try again." via oauthErrorMessage().
  test('/login?error=OAuthSignin shows error message and keeps sign-in button', async ({ page }) => {
    await page.goto('/login?error=OAuthSignin')
    await page.waitForLoadState('networkidle')

    // Error banner must be visible with the mapped human-readable message
    await expect(page.getByText('Sign-in failed. Please try again.')).toBeVisible()

    // Google sign-in button must still be present so the user can retry
    await expect(page.getByRole('button', { name: /continue with google/i })).toBeVisible()
  })
})

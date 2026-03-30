/**
 * MVP smoke test — core user journey
 *
 * Single check: a logged-in user can reach /dashboard and see the main UI.
 * Scope is deliberately narrow — "route loads, main screen appears."
 * Deep dashboard assertions live in authenticated-exploratory.spec.ts.
 */

import { test, expect } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

function generateSessionToken(): string {
  return execSync(
    `node ${JSON.stringify(path.join(__dirname, 'helpers/gen-session-token.js'))}`,
    { cwd: path.join(__dirname, '../..'), timeout: 10_000 },
  ).toString().trim()
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

test(
  'MVP smoke — authenticated user reaches /dashboard without redirect',
  async ({ page }) => {
    test.skip(!SESSION_TOKEN, 'Session token generation failed — is AUTH_SECRET set in .env.local?')

    // Inject session to simulate a completed login
    await page.context().addCookies([SESSION_COOKIE])

    // Seed one asset so the dashboard shows the portfolio view, not the empty state
    await page.goto('/login') // public page — safe for localStorage writes
    await page.evaluate(() => {
      localStorage.setItem(
        'chosen_assets_v1',
        JSON.stringify([{
          id: 'mvp1', userId: 'pw_test_user', category: 'cash',
          label: 'Savings', value: 5_000, currency: 'USD',
          createdAt: '2025-01-01T00:00:00.000Z',
          updatedAt: '2025-01-01T00:00:00.000Z',
        }]),
      )
    })

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Must not have been redirected to /login
    expect(page.url()).not.toContain('/login')

    // Main heading must be visible — dashboard rendered, not a blank/error screen
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  },
)

/**
 * MVP smoke test — core user journey
 *
 * Single check: a logged-in user can reach /dashboard and see the main UI.
 * Scope is deliberately narrow — "route loads, main screen appears."
 * Deep dashboard assertions live in authenticated-exploratory.spec.ts.
 *
 * Assets are seeded via POST /api/assets (DB-backed) so the dashboard
 * renders the portfolio view (h1 "Dashboard") rather than the empty state.
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

const SEED_ASSETS = [
  {
    id:        'mvp-smoke-asset-1',
    name:      'Savings',
    category:  'cash',
    value:     5_000,
    currency:  'USD',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

test(
  'MVP smoke — authenticated user reaches /dashboard without redirect',
  async ({ page }) => {
    test.skip(!SESSION_TOKEN, 'Session token generation failed — is AUTH_SECRET set in .env.local?')

    // Inject session to simulate a completed login
    await page.context().addCookies([SESSION_COOKIE])

    // Seed one asset via the API so the dashboard shows the portfolio view,
    // not the empty state. The app is DB-backed; localStorage writes are ignored.
    const seedResp = await page.request.post('http://localhost:3001/api/assets', {
      data: SEED_ASSETS,
    })
    expect(seedResp.ok(), `Asset seed failed: ${seedResp.status()}`).toBe(true)

    await page.goto('/dashboard')
    await page.waitForLoadState('networkidle')

    // Must not have been redirected to /login
    expect(page.url()).not.toContain('/login')

    // Main heading must be visible — dashboard rendered, not a blank/error screen
    await expect(page.getByRole('heading', { level: 1 }).first()).toBeVisible()
  },
)

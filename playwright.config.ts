import { defineConfig, devices } from '@playwright/test'
import { execSync } from 'child_process'

// Resolve the headless shell binary — prefer the version that matches the
// installed Playwright package; fall back to any available version.
function resolveChromiumExecutable(): string | undefined {
  const candidates = [
    '/root/.cache/ms-playwright/chromium_headless_shell-1208/chrome-headless-shell-linux64/chrome-headless-shell',
    '/root/.cache/ms-playwright/chromium_headless_shell-1194/chrome-linux/headless_shell',
    '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
  ]
  for (const p of candidates) {
    try {
      execSync(`test -f ${JSON.stringify(p)}`)
      return p
    } catch { /* not found */ }
  }
  return undefined
}

const executablePath = resolveChromiumExecutable()

export default defineConfig({
  testDir: './tests/e2e',
  timeout: 20000,
  retries: 0,
  // Single worker: all tests share the same pw_test_user DB row, so parallel
  // execution causes cross-test contamination. Sequential order keeps state clean.
  workers: 1,
  use: {
    baseURL: 'http://localhost:3001',
    headless: true,
    ...(executablePath ? { launchOptions: { executablePath } } : {}),
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        ...(executablePath ? { launchOptions: { executablePath } } : {}),
      },
    },
  ],
})

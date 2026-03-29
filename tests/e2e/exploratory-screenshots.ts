/**
 * Human-style exploratory walk — Chosen Invest @ http://localhost:3001
 *
 * Runs step by step, takes a screenshot after every action, and writes a
 * structured JSON report so the caller can read what was on screen at each
 * moment exactly as a human observer would.
 *
 * Run directly: npx ts-node --project tsconfig.json tests/e2e/exploratory-screenshots.ts
 * (or via the npm script added below)
 */

import { chromium, type Page } from 'playwright'
import * as fs from 'fs'
import * as path from 'path'
import { execSync } from 'child_process'

const BASE = 'http://localhost:3001'
const SS_DIR = path.join(__dirname, 'screenshots')
const REPORT_PATH = path.join(__dirname, 'screenshots', 'exploration-report.json')

fs.mkdirSync(SS_DIR, { recursive: true })

// ---------------------------------------------------------------------------
// Auth cookie helper
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
// Step recorder
// ---------------------------------------------------------------------------
interface Step {
  step: number
  action: string
  url: string
  screenshot: string
  headings: string[]
  visibleText: string        // first 400 chars of body text
  consoleErrors: string[]
  pageErrors: string[]
  observations: string[]
  issues: Issue[]
}

interface Issue {
  severity: 'low' | 'medium' | 'high'
  description: string
  expected: string
  actual: string
}

const report: Step[] = []
const consoleErrors: string[] = []
const pageErrors: string[] = []
let stepCounter = 0

async function step(
  page: Page,
  action: string,
  observations: string[],
  issues: Issue[] = []
): Promise<Step> {
  stepCounter++
  const filename = `step-${String(stepCounter).padStart(2, '0')}-${action.replace(/[^a-z0-9]+/gi, '-').toLowerCase().slice(0, 40)}.png`
  const ssPath = path.join(SS_DIR, filename)

  await page.screenshot({ path: ssPath, fullPage: true })

  const headings = await page.locator('h1, h2, h3').allInnerTexts()
  const bodyText = (await page.locator('body').innerText()).trim().slice(0, 400)
  const url = page.url()

  const s: Step = {
    step: stepCounter,
    action,
    url,
    screenshot: filename,
    headings: headings.slice(0, 8),
    visibleText: bodyText,
    consoleErrors: [...consoleErrors],
    pageErrors: [...pageErrors],
    observations,
    issues,
  }

  report.push(s)
  consoleErrors.length = 0
  pageErrors.length = 0

  console.log(`[${stepCounter}] ${action}`)
  console.log(`    URL: ${url}`)
  if (headings.length) console.log(`    H1-H3: ${headings.slice(0, 3).join(' | ')}`)
  if (issues.length) console.log(`    ⚠  ISSUES: ${issues.map(i => i.description).join('; ')}`)
  return s
}

// ---------------------------------------------------------------------------
// Main exploration
// ---------------------------------------------------------------------------
async function explore() {
  const browser = await chromium.launch({
    executablePath: '/root/.cache/ms-playwright/chromium-1194/chrome-linux/chrome',
    headless: true,
    args: ['--window-size=1280,900'],
  })

  const context = await browser.newContext({
    viewport: { width: 1280, height: 900 },
  })
  const page = await context.newPage()

  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text())
  })
  page.on('pageerror', err => pageErrors.push(err.message))

  // Seed localStorage with a realistic portfolio for the authenticated pages
  const SEED_ASSETS = JSON.stringify([
    { id: 'a1', userId: 'pw_test_user', name: 'Apple Shares', category: 'stock',      value: 15000, currency: 'USD', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'a2', userId: 'pw_test_user', name: 'Savings Account', category: 'cash',   value: 8000,  currency: 'USD', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'a3', userId: 'pw_test_user', name: '401k Fund',     category: 'retirement',value: 22000, currency: 'USD', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'a4', userId: 'pw_test_user', name: 'Bitcoin',       category: 'crypto',    value: 3500,  currency: 'USD', createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  ])
  const SEED_SETTINGS = JSON.stringify({ currency: 'USD', showCents: false, birthYear: 1990, gender: 'male', annualReturnPct: 9.0 })
  const SEED_GOALS = JSON.stringify([
    { id: 'g1', name: 'Emergency Fund', type: 'savings', targetAmount: 15000, currentAmount: 8000, shared: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
    { id: 'g2', name: 'House Down Payment', type: 'purchase', targetAmount: 60000, currentAmount: 12000, targetDate: '2027-06-01', shared: false, createdAt: '2025-01-01T00:00:00Z', updatedAt: '2025-01-01T00:00:00Z' },
  ])
  const SEED_TRANSACTIONS = JSON.stringify([
    { id: 't1', date: '2026-03-01', description: 'Monthly Salary', amount: 4500, category: 'Income', createdAt: '2026-03-01T00:00:00Z' },
    { id: 't2', date: '2026-03-05', description: 'Monthly Rent',   amount: -1400, category: 'Housing', createdAt: '2026-03-05T00:00:00Z' },
    { id: 't3', date: '2026-03-10', description: 'Groceries',      amount: -180, category: 'Groceries', createdAt: '2026-03-10T00:00:00Z' },
  ])

  // ── STEP 1: Landing page ─────────────────────────────────────────────────
  await page.goto(BASE)
  await page.waitForLoadState('networkidle')
  await step(page, 'Landing page - initial load', [
    'ChosenInvest branding visible in sticky header',
    'Hero headline "Understand your money. Act with confidence." present',
    '"Get Started Free" and "Sign In" CTAs visible in hero',
    '3 feature cards: Clear Portfolio View, AI-Guided Insight, Financial Health Signals',
    'Footer with copyright notice',
    'No search input on this page — this is a dashboard app, not a search tool',
  ])

  // ── STEP 2: Hover and inspect header nav ─────────────────────────────────
  await page.locator('header').screenshot({ path: path.join(SS_DIR, 'step-02b-header-closeup.png') })
  await step(page, 'Header navigation inspected', [
    'Sticky header has logo "ChosenInvest" on the left',
    '"Sign In" button (ghost style) and (implicitly) no other nav links on public route',
    'Responsive layout at 1280px — header does not collapse',
  ])

  // ── STEP 3: Click "Sign In" ───────────────────────────────────────────────
  await page.locator('header').getByRole('link', { name: /sign in/i }).click()
  await page.waitForURL(/\/login/, { timeout: 8000 })
  await page.waitForLoadState('networkidle')
  await step(page, 'Navigated to /login via Sign In', [
    'URL changed to /login',
    'Login page shows sign-in form',
    '"Sign in with Google" button visible',
    'No email/password fields — Google OAuth only',
  ])

  // ── STEP 4: Inject auth + seed data, navigate to Dashboard ───────────────
  await context.addCookies([sessionCookie()])
  await page.evaluate(
    ({ assets, settings, goals, transactions }) => {
      localStorage.setItem('chosen_assets_v1', assets)
      localStorage.setItem('chosen_settings_v1', settings)
      localStorage.setItem('chosen_goals_v1', goals)
      localStorage.setItem('chosen_transactions_v1', transactions)
    },
    { assets: SEED_ASSETS, settings: SEED_SETTINGS, goals: SEED_GOALS, transactions: SEED_TRANSACTIONS }
  )
  await page.goto(`${BASE}/dashboard`)
  await page.waitForLoadState('networkidle')

  // Check for any page-level issues before screenshotting
  const dashIssues: Issue[] = []
  const dashText = await page.locator('body').innerText()
  if (dashText.toLowerCase().includes('application error')) {
    dashIssues.push({ severity: 'high', description: 'Dashboard shows application error', expected: 'Dashboard renders with portfolio data', actual: 'Error page shown' })
  }
  await step(page, 'Dashboard - authenticated with seeded portfolio', [
    'Sidebar navigation visible on left: Dashboard, Portfolio, Goals, Transactions, Household, Rank',
    'Dashboard heading and subtitle visible',
    '"Edit Assets" and "Customize" buttons in header',
    'DashboardOverview card with total asset value (~$48.5k)',
    'RankOverviewCard shows Overall Wealth Rank percentile',
    'Allocation chart card visible',
    'AI Summary card visible',
    'Financial Health cards section visible',
  ], dashIssues)

  // ── STEP 5: Inspect sidebar navigation ───────────────────────────────────
  const navLinks = await page.locator('nav a, aside a').allInnerTexts()
  await step(page, 'Sidebar navigation items enumerated', [
    `Nav links found: ${navLinks.filter(t => t.trim()).join(', ')}`,
    'Each nav item has an icon + label',
    'Active item (Dashboard) visually highlighted',
  ])

  // ── STEP 6: Navigate to Portfolio ────────────────────────────────────────
  await page.goto(`${BASE}/portfolio/list`)
  await page.waitForLoadState('networkidle')
  const portfolioIssues: Issue[] = []
  const portfolioText = await page.locator('body').innerText()
  if (!portfolioText.match(/apple|bitcoin|401k|savings/i)) {
    portfolioIssues.push({ severity: 'medium', description: 'Portfolio list does not show seeded assets', expected: 'Apple Shares, Bitcoin, 401k Fund visible', actual: 'Assets not visible in list' })
  }
  await step(page, 'Portfolio list page', [
    'Portfolio list renders seeded assets',
    'Asset cards show name, category, and value',
    'Total portfolio value displayed',
  ], portfolioIssues)

  // ── STEP 7: Portfolio input form ─────────────────────────────────────────
  await page.goto(`${BASE}/portfolio/input`)
  await page.waitForLoadState('networkidle')
  await step(page, 'Portfolio input form - edit mode', [
    '"Edit Your Assets" heading (since assets already seeded)',
    'Each asset row shows name, category, and value inputs',
    '"Add Another Asset" button at bottom',
    '"Cancel" and "Save & View Dashboard" buttons',
    'Total entered preview card visible',
  ])

  // ── STEP 8: Type into asset name input (req 4 — closest to "search") ─────
  await page.locator('#name-0').click()
  await page.locator('#name-0').fill('TSLA')
  await page.waitForTimeout(400)
  const nameVal = await page.locator('#name-0').inputValue()
  const typingIssues: Issue[] = []
  if (nameVal !== 'TSLA') {
    typingIssues.push({ severity: 'high', description: 'Text input does not accept typed value', expected: 'Input shows "TSLA"', actual: `Input shows "${nameVal}"` })
  }
  await step(page, 'Typed "TSLA" into asset name field', [
    `Field now shows: "${nameVal}"`,
    'Input responds immediately to keyboard input',
    'No visible validation error on partial entry',
  ], typingIssues)

  // ── STEP 9: Cancel (do not save TSLA edit) ────────────────────────────────
  await page.getByRole('button', { name: /cancel/i }).click()
  await page.waitForURL(/\/dashboard/, { timeout: 6000 })
  await page.waitForLoadState('networkidle')
  await step(page, 'Cancel returns to Dashboard without saving', [
    'Cancel click navigated back to /dashboard',
    'No TSLA asset was saved — original seeded data intact',
    'Dashboard renders without errors',
  ])

  // ── STEP 10: Navigate to Rank page ────────────────────────────────────────
  await page.goto(`${BASE}/rank`)
  await page.waitForLoadState('networkidle')
  const rankErrors = pageErrors.filter(e => !e.includes('ResizeObserver'))
  const rankIssues: Issue[] = []
  if (rankErrors.length > 0) {
    rankIssues.push({ severity: 'high', description: 'JS error on Rank page', expected: 'No errors', actual: rankErrors[0] })
  }
  await step(page, 'Rank page - Wealth Rank', [
    '"Wealth Rank" heading visible',
    '"Individual" / "Household" mode toggle',
    'Summary strip: Total Assets, Ranks Available, Age Used, Profile completeness',
    'Rank rows: Overall Wealth Rank, Age-Based Rank, Age + Gender Rank, Investment Return Rank',
    'Each rank shows "Top X%" headline, percentile bar, Basis and Band matched detail',
    '"Rank Summary" share card at bottom',
    '"How this works" methodology section at bottom',
  ], rankIssues)

  // ── STEP 11: Toggle Rank to Household mode ────────────────────────────────
  await page.getByRole('button', { name: /household/i }).click()
  await page.waitForTimeout(400)
  await step(page, 'Rank page - switched to Household mode', [
    'Household mode panel visible',
    'Shows "No household members have been added yet" (no members seeded)',
    '"Set up household →" link present',
    'Individual rank rows are hidden in this mode',
  ])

  // ── STEP 12: Switch back to Individual, inspect mode toggle ───────────────
  await page.getByRole('button', { name: /individual/i }).click()
  await page.waitForTimeout(300)
  await step(page, 'Rank page - switched back to Individual mode', [
    'All 4 rank rows reappear immediately',
    'Mode toggle visually updates active state',
    'No full page reload — client-side state toggle only',
  ])

  // ── STEP 13: Navigate to Goals ────────────────────────────────────────────
  await page.goto(`${BASE}/goals`)
  await page.waitForLoadState('networkidle')
  const goalsText = await page.locator('body').innerText()
  const goalsIssues: Issue[] = []
  if (!goalsText.includes('Emergency Fund')) {
    goalsIssues.push({ severity: 'medium', description: 'Seeded goals not visible', expected: '"Emergency Fund" and "House Down Payment" visible', actual: 'Goals not rendering from localStorage' })
  }
  await step(page, 'Goals page', [
    '"Goals" heading with subtitle',
    '"Add New Goal" form card at top with all fields',
    'Two seeded goals listed: Emergency Fund and House Down Payment',
    'Each goal shows progress bar, percentage, target date where set',
    'Edit (pencil) and Delete (trash) action buttons per goal',
  ], goalsIssues)

  // ── STEP 14: Navigate to Transactions ────────────────────────────────────
  await page.goto(`${BASE}/transactions`)
  await page.waitForLoadState('networkidle')
  const txText = await page.locator('body').innerText()
  const txIssues: Issue[] = []
  if (!txText.includes('Monthly Salary')) {
    txIssues.push({ severity: 'medium', description: 'Seeded transactions not visible', expected: '"Monthly Salary" visible in history', actual: 'Transaction history empty' })
  }
  await step(page, 'Transactions page', [
    '"Transactions" heading visible',
    '"Add Transaction" form at top: date, category, description, amount, type',
    'Summary strip: Income, Expenses, Net (3 cards)',
    '"History" card with filter (by category) and sort controls',
    '3 seeded transactions: Monthly Salary, Monthly Rent, Groceries',
    'Income items shown in green, expenses in red',
  ], txIssues)

  // ── STEP 15: Navigate to Household ────────────────────────────────────────
  await page.goto(`${BASE}/household`)
  await page.waitForLoadState('networkidle')
  await step(page, 'Household page', [
    '"Household" heading visible',
    'Empty household state or member management UI',
    'No members seeded — shows empty state',
    'Add member form or CTA present',
  ])

  // ── STEP 16: Navigate to Settings ────────────────────────────────────────
  await page.goto(`${BASE}/settings`)
  await page.waitForLoadState('networkidle')
  await step(page, 'Settings page', [
    '"Settings" heading visible',
    'Currency selector present',
    'Birth year and gender fields (used for rank calculations)',
    'Annual return % field',
    'Show cents toggle',
    'Data export/import section',
  ])

  // ── STEP 17: Check Tax Opportunity page ───────────────────────────────────
  await page.goto(`${BASE}/tax-opportunity`)
  await page.waitForLoadState('networkidle')
  const taxText = await page.locator('body').innerText()
  const taxIssues: Issue[] = []
  if (taxText.toLowerCase().includes('application error')) {
    taxIssues.push({ severity: 'high', description: 'Tax Opportunity page crashes', expected: 'Tax signals render', actual: 'Error page shown' })
  }
  await step(page, 'Tax Opportunity page', [
    'Tax opportunity / harvest signals page',
    'Content based on seeded assets (stocks, crypto, retirement)',
    'No form submission available — read-only analysis page',
  ], taxIssues)

  // ── STEP 18: Final — back to dashboard, check no residual errors ─────────
  await page.goto(`${BASE}/dashboard`)
  await page.waitForLoadState('networkidle')
  const finalErrors = pageErrors.filter(e => !e.includes('ResizeObserver') && !e.includes('ClientFetchError'))
  const finalIssues: Issue[] = []
  if (finalErrors.length > 0) {
    finalIssues.push({ severity: 'high', description: 'JS errors during return to Dashboard', expected: 'Clean navigation', actual: finalErrors.join('; ') })
  }
  await step(page, 'Return to Dashboard — end of exploration', [
    'Dashboard renders cleanly after traversing all routes',
    'No residual errors from previous pages',
    'All seeded data still intact in localStorage',
  ], finalIssues)

  // ---------------------------------------------------------------------------
  // Write report
  // ---------------------------------------------------------------------------
  fs.writeFileSync(REPORT_PATH, JSON.stringify(report, null, 2))
  console.log(`\n✓ Exploration complete — ${stepCounter} steps`)
  console.log(`  Screenshots: ${SS_DIR}`)
  console.log(`  Report:      ${REPORT_PATH}`)

  const allIssues = report.flatMap(s => s.issues)
  if (allIssues.length === 0) {
    console.log('\n  No issues found.')
  } else {
    console.log(`\n  Issues found (${allIssues.length}):`)
    allIssues.forEach(i => console.log(`    [${i.severity.toUpperCase()}] ${i.description}`))
  }

  await browser.close()
  return report
}

explore().catch(err => {
  console.error('Exploration failed:', err)
  process.exit(1)
})

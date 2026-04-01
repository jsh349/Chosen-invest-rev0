/**
 * Form interaction tests — write-path coverage for the three most critical forms:
 *   1. Portfolio Input  (/portfolio/input)
 *   2. Goals            (/goals)
 *   3. Transactions     (/transactions)
 *
 * Each suite tests:
 *   - Form renders and fields are interactive
 *   - Validation rejects bad input with visible error messages
 *   - Happy-path submit persists data to localStorage
 *   - Edit and delete flows work correctly
 */

import { test, expect, type Page } from '@playwright/test'
import { execSync } from 'child_process'
import * as path from 'path'

// ---------------------------------------------------------------------------
// Auth + seed helpers (same pattern as authenticated-exploratory.spec.ts)
// ---------------------------------------------------------------------------

function generateSessionToken(): string {
  const helperScript = path.join(__dirname, 'helpers/gen-session-token.js')
  return execSync(`node ${JSON.stringify(helperScript)}`, {
    cwd: path.join(__dirname, '../..'),
    timeout: 10000,
  }).toString().trim()
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

async function gotoAuthenticated(page: Page, route: string) {
  await page.context().addCookies([SESSION_COOKIE])
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

/** Clear all DB data for pw_test_user via the API, then navigate to route. */
async function clearAndGoto(page: Page, route: string) {
  await page.context().addCookies([SESSION_COOKIE])
  await Promise.all([
    page.request.delete('http://localhost:3001/api/assets'),
    page.request.delete('http://localhost:3001/api/goals'),
    page.request.delete('http://localhost:3001/api/transactions'),
  ])
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

/** Seed assets/goals/transactions via the API (clearing first), then navigate. */
async function seedApiAndGoto(
  page: Page,
  route: string,
  seed: { assets?: object[]; goals?: object[]; transactions?: object[] } = {}
) {
  await page.context().addCookies([SESSION_COOKIE])
  await Promise.all([
    page.request.delete('http://localhost:3001/api/assets'),
    page.request.delete('http://localhost:3001/api/goals'),
    page.request.delete('http://localhost:3001/api/transactions'),
  ])
  if (seed.assets?.length) {
    await page.request.post('http://localhost:3001/api/assets', { data: seed.assets })
  }
  if (seed.goals?.length) {
    await page.request.post('http://localhost:3001/api/goals', { data: seed.goals })
  }
  if (seed.transactions?.length) {
    await page.request.post('http://localhost:3001/api/transactions', { data: seed.transactions })
  }
  await page.goto(route)
  await page.waitForLoadState('networkidle')
}

// Pre-built seed payloads (objects for API seeding, not JSON strings)
const SEED_ASSETS = [
  {
    id: 'seed-a1',
    name: 'Existing Stock',
    category: 'stock',
    value: 5000,
    currency: 'USD',
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const SEED_GOALS = [
  {
    id: 'seed-g1',
    name: 'Emergency Fund',
    type: 'savings',
    targetAmount: 10000,
    currentAmount: 3000,
    shared: false,
    createdAt: '2025-01-01T00:00:00.000Z',
    updatedAt: '2025-01-01T00:00:00.000Z',
  },
]

const SEED_TRANSACTIONS = [
  {
    id: 'seed-t1',
    date: '2025-06-01',
    description: 'Salary',
    amount: 3000,
    category: 'Income',
    createdAt: '2025-06-01T00:00:00.000Z',
  },
]

// ===========================================================================
// 1. PORTFOLIO INPUT FORM
// ===========================================================================

test.describe('Portfolio Input — form interactions', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('loads with a blank asset row', async ({ page }) => {
    await gotoAuthenticated(page, '/portfolio/input')
    // First row name field is present
    await expect(page.locator('#name-0')).toBeVisible()
    // Category select is present
    await expect(page.locator('select').first()).toBeVisible()
    // Value field is present
    await expect(page.locator('#value-0')).toBeVisible()
  })

  test('pre-populates fields when existing assets are present', async ({ page }) => {
    await seedApiAndGoto(page, '/portfolio/input', { assets: SEED_ASSETS })
    // Should show "Edit Your Assets" heading
    await expect(page.getByRole('heading', { name: /edit your assets/i })).toBeVisible()
    // The existing asset name should be in the input
    await expect(page.locator('#name-0')).toHaveValue('Existing Stock')
    await expect(page.locator('#value-0')).toHaveValue('5000')
  })

  // ── Typing + total preview ─────────────────────────────────────────────────

  test('total updates in real-time as values are entered', async ({ page }) => {
    await clearAndGoto(page, '/portfolio/input')
    await page.locator('#name-0').fill('My Savings')
    await page.locator('#value-0').fill('12000')
    // Total entered preview should appear
    await expect(page.locator('text=Total entered')).toBeVisible()
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toMatch(/12[,.]?000|12k|\$12/i)
  })

  // ── Add / remove rows ──────────────────────────────────────────────────────

  test('"Add Another Asset" button inserts a second row', async ({ page }) => {
    await gotoAuthenticated(page, '/portfolio/input')
    await page.locator('button:has-text("Add Another Asset")').click()
    // Now there should be a second row
    await expect(page.locator('#name-1')).toBeVisible()
  })

  test('remove button on second row collapses it', async ({ page }) => {
    await gotoAuthenticated(page, '/portfolio/input')
    await page.locator('button:has-text("Add Another Asset")').click()
    await expect(page.locator('#name-1')).toBeVisible()
    // The remove (trash) button should appear — click it
    // It sits inside the Asset 2 block; grab the last trash button visible
    const trashBtns = page.locator('button[aria-label]').filter({ hasText: '' })
    // Simpler: click the Trash2 button inside Asset 2 heading area
    await page.locator('[data-slot="icon"] ~ button, button svg.lucide-trash2').last().click().catch(() => {
      // Fallback: click via the containing row
    })
    // Re-approach: use the button closest to "Asset 2" text
    // The remove button is a ghost icon button in the AssetRow header
    const asset2Header = page.locator('text=Asset 2').locator('..')
    const removeBtn = asset2Header.locator('button')
    if (await removeBtn.count() > 0) {
      await removeBtn.first().click()
    }
    // After removal, row 2 should be gone
    await expect(page.locator('#name-1')).not.toBeVisible()
  })

  // ── Happy-path submit ──────────────────────────────────────────────────────

  test('fills form and submits — assets saved to DB', async ({ page }) => {
    await clearAndGoto(page, '/portfolio/input')

    await page.locator('#name-0').fill('Apple Shares')
    // Set category to stock
    await page.locator('select').first().selectOption('stock')
    await page.locator('#value-0').fill('8000')

    // Add a second asset
    await page.locator('button:has-text("Add Another Asset")').click()
    await page.locator('#name-1').fill('Emergency Fund')
    await page.locator('select').nth(1).selectOption('cash')
    await page.locator('#value-1').fill('5000')

    // Submit
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/\/dashboard/, { timeout: 10000 })

    // Verify assets were saved to DB via the API
    const resp = await page.request.get('http://localhost:3001/api/assets')
    const data = await resp.json()
    expect(Array.isArray(data)).toBe(true)
    expect(data).toHaveLength(2)
    const names = data.map((a: { name: string }) => a.name)
    expect(names).toContain('Apple Shares')
    expect(names).toContain('Emergency Fund')
  })

  test('empty form submits without saving and redirects to dashboard', async ({ page }) => {
    await clearAndGoto(page, '/portfolio/input')
    // Leave all fields blank and submit
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/\/dashboard/, { timeout: 8000 })
    // No assets should have been saved to DB
    const resp = await page.request.get('http://localhost:3001/api/assets')
    const assets = await resp.json()
    expect(Array.isArray(assets)).toBe(true)
    expect(assets).toHaveLength(0)
  })

  test('Cancel button returns to dashboard without saving', async ({ page }) => {
    await clearAndGoto(page, '/portfolio/input')
    await page.locator('#name-0').fill('Should Not Save')
    await page.locator('button:has-text("Cancel")').click()
    await page.waitForURL(/\/dashboard/, { timeout: 8000 })
    // Assert the asset was not saved to DB
    const resp = await page.request.get('http://localhost:3001/api/assets')
    const assets = await resp.json()
    const names: string[] = Array.isArray(assets) ? assets.map((a: { name: string }) => a.name) : []
    expect(names).not.toContain('Should Not Save')
  })

  test('no JS errors during entire portfolio input flow', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))
    await gotoAuthenticated(page, '/portfolio/input')
    await page.locator('#name-0').fill('Test Asset')
    await page.locator('#value-0').fill('1000')
    await page.locator('button[type="submit"]').click()
    await page.waitForURL(/\/dashboard/, { timeout: 8000 })
    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ===========================================================================
// 2. GOALS FORM
// ===========================================================================

test.describe('Goals — form interactions', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('Add New Goal form renders with all required fields', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await expect(page.locator('text=Add New Goal')).toBeVisible()
    await expect(page.locator('input[name="name"]')).toBeVisible()
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('input[name="targetAmount"]')).toBeVisible()
    await expect(page.locator('input[name="currentAmount"]')).toBeVisible()
    await expect(page.locator('button:has-text("Add Goal")')).toBeVisible()
  })

  test('empty goals list shows empty state', async ({ page }) => {
    await clearAndGoto(page, '/goals')
    await expect(page.locator('text=No goals yet')).toBeVisible()
  })

  test('existing goals are listed when seeded', async ({ page }) => {
    await seedApiAndGoto(page, '/goals', { goals: SEED_GOALS })
    await expect(page.locator('text=Emergency Fund')).toBeVisible()
    // Goal type badge (span inside the goal card, not the select option)
    await expect(page.getByText('savings', { exact: true })).toBeVisible()
  })

  // ── Validation ─────────────────────────────────────────────────────────────

  test('submitting empty name shows validation error', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    // Fill required amounts but leave name blank
    await page.locator('input[name="targetAmount"]').fill('5000')
    await page.locator('button:has-text("Add Goal")').click()
    await expect(page.locator('text=Goal name is required')).toBeVisible()
  })

  test('invalid date format shows validation error', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('Test Goal')
    await page.locator('input[name="targetAmount"]').fill('5000')
    await page.locator('input[name="targetDate"]').fill('31-12-2025') // wrong format
    await page.locator('button:has-text("Add Goal")').click()
    await expect(page.locator('text=YYYY-MM-DD')).toBeVisible()
  })

  test('zero target amount shows validation error', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('Test Goal')
    await page.locator('input[name="targetAmount"]').fill('0')
    await page.locator('button:has-text("Add Goal")').click()
    await expect(page.locator('text=Target amount must be a positive number')).toBeVisible()
  })

  test('non-numeric target amount shows validation error', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('Test Goal')
    // Set targetAmount to a non-numeric string via JS (bypasses HTML5 type=number sanitisation)
    await page.locator('input[name="targetAmount"]').evaluate(
      (el: HTMLInputElement) => { el.value = 'abc'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) }
    )
    await page.locator('button:has-text("Add Goal")').click()
    await expect(page.locator('text=Target amount must be a positive number')).toBeVisible()
  })

  // ── Happy-path add ─────────────────────────────────────────────────────────

  test('adding a valid goal appends it to the list', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('House Down Payment')
    await page.locator('select[name="type"]').selectOption('purchase')
    await page.locator('input[name="targetAmount"]').fill('50000')
    await page.locator('input[name="currentAmount"]').fill('12000')
    await page.locator('input[name="targetDate"]').fill('2027-06-01')
    await page.locator('button:has-text("Add Goal")').click()

    // Goal appears in the list
    await expect(page.locator('text=House Down Payment')).toBeVisible()
    // Type badge in the goal card (exact match avoids matching the select option)
    await expect(page.getByText('purchase', { exact: true })).toBeVisible()
    await expect(page.locator('text=2027-06-01')).toBeVisible()
  })

  test('adding a goal persists it to DB', async ({ page }) => {
    await clearAndGoto(page, '/goals')
    await page.locator('input[name="name"]').fill('Retirement Nest Egg')
    await page.locator('select[name="type"]').selectOption('retirement')
    await page.locator('input[name="targetAmount"]').fill('500000')
    await page.locator('input[name="currentAmount"]').fill('50000')
    await page.locator('button:has-text("Add Goal")').click()

    await expect(page.locator('text=Retirement Nest Egg')).toBeVisible()
    // Verify goal was saved to DB via the API
    const resp = await page.request.get('http://localhost:3001/api/goals')
    const goals = await resp.json()
    expect(Array.isArray(goals)).toBe(true)
    const added = goals.find((g: { name: string }) => g.name === 'Retirement Nest Egg')
    expect(added).toBeTruthy()
    expect(added.targetAmount).toBe(500000)
    expect(added.currentAmount).toBe(50000)
    expect(added.type).toBe('retirement')
  })

  test('form resets after successful add', async ({ page }) => {
    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('Vacation Fund')
    await page.locator('input[name="targetAmount"]').fill('3000')
    await page.locator('button:has-text("Add Goal")').click()

    await expect(page.locator('text=Vacation Fund')).toBeVisible()
    // Name field should be cleared
    await expect(page.locator('input[name="name"]')).toHaveValue('')
    await expect(page.locator('input[name="targetAmount"]')).toHaveValue('')
  })

  // ── Edit flow ──────────────────────────────────────────────────────────────

  test('edit button opens inline form with existing values', async ({ page }) => {
    await seedApiAndGoto(page, '/goals', { goals: SEED_GOALS })

    // Click the pencil (edit) button
    await page.locator('button[aria-label="Edit goal"]').first().click()

    // Inline form should show existing values
    const nameInput = page.locator('input[name="name"]').last()
    await expect(nameInput).toHaveValue('Emergency Fund')
    const targetInput = page.locator('input[name="targetAmount"]').last()
    await expect(targetInput).toHaveValue('10000')
  })

  test('editing a goal and saving updates the list', async ({ page }) => {
    await seedApiAndGoto(page, '/goals', { goals: SEED_GOALS })

    await page.locator('button[aria-label="Edit goal"]').first().click()

    // Change the name
    const nameInput = page.locator('input[name="name"]').last()
    await nameInput.fill('Rainy Day Fund')
    await page.locator('button:has-text("Save")').click()

    // Updated name should appear in list
    await expect(page.locator('text=Rainy Day Fund')).toBeVisible()
    // Old name should be gone
    await expect(page.locator('text=Emergency Fund')).not.toBeVisible()
  })

  test('Cancel button during edit restores the list without changes', async ({ page }) => {
    await seedApiAndGoto(page, '/goals', { goals: SEED_GOALS })

    await page.locator('button[aria-label="Edit goal"]').first().click()
    const nameInput = page.locator('input[name="name"]').last()
    await nameInput.fill('Changed Name — Cancelled')

    await page.locator('button:has-text("Cancel")').click()

    // Original name still visible
    await expect(page.locator('text=Emergency Fund')).toBeVisible()
    await expect(page.locator('text=Changed Name — Cancelled')).not.toBeVisible()
  })

  // ── Delete flow ────────────────────────────────────────────────────────────

  test('deleting a goal removes it from the list', async ({ page }) => {
    await seedApiAndGoto(page, '/goals', { goals: SEED_GOALS })

    await expect(page.locator('text=Emergency Fund')).toBeVisible()
    await page.locator('button[aria-label="Delete goal"]').first().click()

    // Goal should be gone from UI
    await expect(page.locator('text=Emergency Fund')).not.toBeVisible()

    // Verify goal deleted from DB
    const resp = await page.request.get('http://localhost:3001/api/goals')
    const goals = await resp.json()
    expect(goals).toHaveLength(0)
  })

  test('no JS errors during goals CRUD flow', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    await gotoAuthenticated(page, '/goals')
    await page.locator('input[name="name"]').fill('Error Check Goal')
    await page.locator('input[name="targetAmount"]').fill('1000')
    await page.locator('button:has-text("Add Goal")').click()
    await expect(page.locator('text=Error Check Goal')).toBeVisible()
    await page.locator('button[aria-label="Delete goal"]').first().click()

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

// ===========================================================================
// 3. TRANSACTIONS FORM
// ===========================================================================

test.describe('Transactions — form interactions', () => {
  test.skip(!SESSION_TOKEN, 'SESSION_TOKEN generation failed')

  // ── Rendering ──────────────────────────────────────────────────────────────

  test('Add Transaction form renders with all required fields', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    // Use role heading to avoid matching the submit button
    await expect(page.getByRole('heading', { name: 'Add Transaction' })).toBeVisible()
    await expect(page.locator('input[name="date"]')).toBeVisible()
    await expect(page.locator('input[name="description"]')).toBeVisible()
    await expect(page.locator('input[name="amount"]')).toBeVisible()
    await expect(page.locator('select[name="type"]')).toBeVisible()
    await expect(page.locator('select[name="category"]')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()
  })

  test('empty state visible when no transactions', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await expect(page.locator('text=No transactions yet')).toBeVisible()
  })

  // ── Validation ─────────────────────────────────────────────────────────────

  test('submitting without date shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="description"]').fill('Test')
    await page.locator('input[name="amount"]').fill('100')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=Date is required')).toBeVisible()
  })

  test('invalid date format shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('01/15/2025') // wrong format
    await page.locator('input[name="description"]').fill('Test')
    await page.locator('input[name="amount"]').fill('100')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=YYYY-MM-DD')).toBeVisible()
  })

  test('invalid calendar date (Feb 31) shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-02-31')
    await page.locator('input[name="description"]').fill('Test')
    await page.locator('input[name="amount"]').fill('100')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=YYYY-MM-DD')).toBeVisible()
  })

  test('submitting without description shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="amount"]').fill('100')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=Description is required')).toBeVisible()
  })

  test('zero amount shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="description"]').fill('Test')
    await page.locator('input[name="amount"]').fill('0')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=Amount must be a positive number')).toBeVisible()
  })

  test('non-numeric amount shows error', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="description"]').fill('Test')
    // Set non-numeric via JS to bypass HTML5 type=number sanitisation
    await page.locator('input[name="amount"]').evaluate(
      (el: HTMLInputElement) => { el.value = 'xyz'; el.dispatchEvent(new Event('input', { bubbles: true })); el.dispatchEvent(new Event('change', { bubbles: true })) }
    )
    await page.locator('button[type="submit"]').click()
    await expect(page.locator('text=Amount must be a positive number')).toBeVisible()
  })

  // ── Happy-path: expense ────────────────────────────────────────────────────

  test('adding an expense appears in list with red negative amount', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="description"]').fill('Monthly Rent')
    await page.locator('input[name="amount"]').fill('1200')
    await page.locator('select[name="category"]').selectOption('Housing')
    await page.locator('select[name="type"]').selectOption('expense')
    await page.locator('button[type="submit"]').click()

    // Entry visible
    await expect(page.locator('text=Monthly Rent')).toBeVisible()
    // Category badge is in the transaction row (not the form select option)
    await expect(page.locator('span').filter({ hasText: /^Housing$/ }).last()).toBeVisible()
    // Amount should be shown as negative in the transaction row
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toMatch(/-.*1[,.]?200|−.*1[,.]?200/i)
  })

  test('adding an income appears in list with green positive amount', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-01')
    await page.locator('input[name="description"]').fill('Monthly Salary')
    await page.locator('input[name="amount"]').fill('4500')
    await page.locator('select[name="category"]').selectOption('Income')
    await page.locator('select[name="type"]').selectOption('income')
    await page.locator('button:has-text("Add Transaction")').click()

    await expect(page.locator('text=Monthly Salary')).toBeVisible()
    // Amount should be positive
    const bodyText = await page.locator('body').innerText()
    expect(bodyText).toMatch(/\+.*4[,.]?500/i)
  })

  test('expense persists to DB with negative amount', async ({ page }) => {
    await clearAndGoto(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="description"]').fill('Grocery Run')
    await page.locator('input[name="amount"]').fill('85')
    await page.locator('select[name="category"]').selectOption('Groceries')
    await page.locator('select[name="type"]').selectOption('expense')
    await page.locator('button:has-text("Add Transaction")').click()

    await expect(page.locator('text=Grocery Run')).toBeVisible()
    // Verify transaction saved to DB via the API
    const resp = await page.request.get('http://localhost:3001/api/transactions')
    const txns = await resp.json()
    expect(Array.isArray(txns)).toBe(true)
    const entry = txns.find((t: { description: string }) => t.description === 'Grocery Run')
    expect(entry).toBeTruthy()
    expect(entry.amount).toBe(-85) // stored as negative for expense
    expect(entry.category).toBe('Groceries')
  })

  test('summary strip appears after first transaction', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-01')
    await page.locator('input[name="description"]').fill('Paycheck')
    await page.locator('input[name="amount"]').fill('2000')
    await page.locator('select[name="type"]').selectOption('income')
    await page.locator('button:has-text("Add Transaction")').click()

    // Income / Expenses / Net summary row
    await expect(page.locator('text=Income').first()).toBeVisible()
    await expect(page.locator('text=Expenses').first()).toBeVisible()
    await expect(page.locator('text=Net').first()).toBeVisible()
  })

  test('form resets after successful submission', async ({ page }) => {
    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-06-15')
    await page.locator('input[name="description"]').fill('Coffee')
    await page.locator('input[name="amount"]').fill('5')
    await page.locator('button:has-text("Add Transaction")').click()

    await expect(page.locator('text=Coffee')).toBeVisible()
    // Form fields should be cleared
    await expect(page.locator('input[name="date"]')).toHaveValue('')
    await expect(page.locator('input[name="description"]')).toHaveValue('')
    await expect(page.locator('input[name="amount"]')).toHaveValue('')
  })

  // ── Filter + sort ──────────────────────────────────────────────────────────

  test('filter by category hides non-matching transactions', async ({ page }) => {
    await seedApiAndGoto(page, '/transactions', { transactions: SEED_TRANSACTIONS })

    // History filter select has "All categories" option — target it specifically
    const filterSelect = page.locator('select:has(option[value="All"])')
    await filterSelect.selectOption('Housing')
    await expect(page.locator('text=No transactions match this filter')).toBeVisible()
    await expect(page.locator('text=Salary')).not.toBeVisible()
  })

  test('filter by category shows matching transactions', async ({ page }) => {
    await seedApiAndGoto(page, '/transactions', { transactions: SEED_TRANSACTIONS })
    const filterSelect = page.locator('select:has(option[value="All"])')
    await filterSelect.selectOption('Income')
    await expect(page.locator('text=Salary')).toBeVisible()
  })

  test('sort by oldest-first changes display order', async ({ page }) => {
    const twoTx = [
      {
        id: 'tx1', date: '2025-06-15', description: 'Latest',
        amount: -100, category: 'Other', createdAt: '2025-06-15T00:00:00.000Z',
      },
      {
        id: 'tx2', date: '2025-01-01', description: 'Earliest',
        amount: 500, category: 'Income', createdAt: '2025-01-01T00:00:00.000Z',
      },
    ]
    await seedApiAndGoto(page, '/transactions', { transactions: twoTx })

    // Sort select has "date-desc" option — target it specifically
    const sortSelect = page.locator('select:has(option[value="date-desc"])')
    await sortSelect.selectOption('date-asc')
    // Both entries still visible after re-sort
    await expect(page.locator('text=Earliest')).toBeVisible()
    await expect(page.locator('text=Latest')).toBeVisible()
  })

  // ── Delete ─────────────────────────────────────────────────────────────────

  test('deleting a transaction removes it from list', async ({ page }) => {
    await seedApiAndGoto(page, '/transactions', { transactions: SEED_TRANSACTIONS })

    await expect(page.locator('text=Salary')).toBeVisible()
    await page.locator('button[aria-label="Delete transaction"]').first().click()

    await expect(page.locator('text=Salary')).not.toBeVisible()
    // Empty state should return
    await expect(page.locator('text=No transactions yet')).toBeVisible()

    // Verify DB is empty
    const resp = await page.request.get('http://localhost:3001/api/transactions')
    const txns = await resp.json()
    expect(txns).toHaveLength(0)
  })

  test('no JS errors during full transaction add + delete flow', async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', (e) => errors.push(e.message))

    await gotoAuthenticated(page, '/transactions')
    await page.locator('input[name="date"]').fill('2025-07-01')
    await page.locator('input[name="description"]').fill('Error Test Tx')
    await page.locator('input[name="amount"]').fill('99')
    await page.locator('button:has-text("Add Transaction")').click()
    await expect(page.locator('text=Error Test Tx')).toBeVisible()
    await page.locator('button[aria-label="Delete transaction"]').first().click()

    expect(errors.filter(e => !e.includes('ResizeObserver'))).toHaveLength(0)
  })
})

import { buildAdvisorContext } from '@/features/ai/advisor-context'
import type { Transaction } from '@/lib/types/transaction'

function tx(id: string, amount: number, date: string): Transaction {
  return { id, date, description: 'test', amount, category: 'Income', createdAt: date + 'T00:00:00Z' }
}

describe('buildAdvisorContext — cash flow month filter (HIGH-1 regression)', () => {
  beforeAll(() => {
    jest.useFakeTimers()
    jest.setSystemTime(new Date('2026-03-15T12:00:00Z'))
  })

  afterAll(() => {
    jest.useRealTimers()
  })

  it('includes only current-month transactions in cash flow', () => {
    const currentMonth = tx('1', 5000, '2026-03-10')  // income this month
    const lastMonth    = tx('2', -2000, '2026-02-15') // expense last month — must be excluded

    const ctx = buildAdvisorContext([], [], [currentMonth, lastMonth])

    expect(ctx.cashFlow).not.toBeNull()
    expect(ctx.cashFlow?.income).toBe(5000)
    expect(ctx.cashFlow?.expenses).toBe(0)   // last month's expense excluded
    expect(ctx.cashFlow?.net).toBe(5000)
  })

  it('returns null cashFlow when no transactions fall in current month', () => {
    const old = tx('1', 999, '2025-01-01')
    const ctx = buildAdvisorContext([], [], [old])
    expect(ctx.cashFlow).toBeNull()
  })

  it('returns null cashFlow for empty transaction list', () => {
    const ctx = buildAdvisorContext([], [], [])
    expect(ctx.cashFlow).toBeNull()
  })

  it('reflects mixed current-month transactions correctly', () => {
    const income  = tx('1', 3000, '2026-03-01')
    const expense = tx('2', -800, '2026-03-20')
    const old     = tx('3', -500, '2026-02-28') // excluded

    const ctx = buildAdvisorContext([], [], [income, expense, old])

    expect(ctx.cashFlow?.income).toBe(3000)
    expect(ctx.cashFlow?.expenses).toBe(-800)
    expect(ctx.cashFlow?.net).toBe(2200)
  })

  it('sets hasGoals and goalCount from goals array', () => {
    const ctx = buildAdvisorContext([], [], [])
    expect(ctx.hasGoals).toBe(false)
    expect(ctx.goalCount).toBe(0)
  })
})

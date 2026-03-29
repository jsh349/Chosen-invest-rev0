import { computeCashFlow } from '@/lib/utils/transaction-summary'
import type { Transaction } from '@/lib/types/transaction'

function tx(id: string, amount: number, date = '2026-03-01'): Transaction {
  return { id, date, description: 'test', amount, category: 'Income', createdAt: date + 'T00:00:00Z' }
}

describe('computeCashFlow', () => {
  it('income only', () => {
    expect(computeCashFlow([tx('1', 1000), tx('2', 500)])).toEqual({
      income: 1500, expenses: 0, net: 1500,
    })
  })

  it('expenses only', () => {
    expect(computeCashFlow([tx('1', -300), tx('2', -200)])).toEqual({
      income: 0, expenses: -500, net: -500,
    })
  })

  it('mixed income and expenses', () => {
    expect(computeCashFlow([tx('1', 1000), tx('2', -400)])).toEqual({
      income: 1000, expenses: -400, net: 600,
    })
  })

  it('empty array returns zeros', () => {
    expect(computeCashFlow([])).toEqual({ income: 0, expenses: 0, net: 0 })
  })

  it('net is income + expenses (not absolute difference)', () => {
    const result = computeCashFlow([tx('1', 200), tx('2', -500)])
    expect(result.net).toBe(result.income + result.expenses)
  })
})

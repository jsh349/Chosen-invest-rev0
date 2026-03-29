import type { Transaction } from '@/lib/types/transaction'

export type CashFlowSummary = {
  income: number
  expenses: number
  net: number
}

/** Compute income, expenses (negative), and net from a list of transactions. */
export function computeCashFlow(transactions: Transaction[]): CashFlowSummary {
  let income = 0
  let expenses = 0
  for (const t of transactions) {
    if (t.amount > 0) income += t.amount
    else expenses += t.amount
  }
  return { income, expenses, net: income + expenses }
}

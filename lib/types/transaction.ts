export type TransactionCategory =
  | 'Income'
  | 'Housing'
  | 'Groceries'
  | 'Utilities'
  | 'Subscriptions'
  | 'Transport'
  | 'Travel'
  | 'Family'
  | 'Taxes'
  | 'Investments'
  | 'Other'

/** Runtime companion to TransactionCategory — single source of truth for all category lists. */
export const TRANSACTION_CATEGORIES: readonly TransactionCategory[] = [
  'Income', 'Housing', 'Groceries', 'Utilities', 'Subscriptions',
  'Transport', 'Travel', 'Family', 'Taxes', 'Investments', 'Other',
]

export type Transaction = {
  id: string
  date: string            // YYYY-MM-DD
  description: string
  amount: number          // positive = income, negative = expense
  category: TransactionCategory
  createdAt: string
}

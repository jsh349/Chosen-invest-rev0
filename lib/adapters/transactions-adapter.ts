import type { Transaction, TransactionCategory } from '@/lib/types/transaction'
import { TRANSACTION_CATEGORIES } from '@/lib/types/transaction'

const VALID_CATEGORIES = new Set<string>(TRANSACTION_CATEGORIES)

function isValidCategory(cat: string): cat is TransactionCategory {
  return VALID_CATEGORIES.has(cat)
}

/** Async adapter interface — decouples stores from the underlying data source. */
export type TransactionsAdapter = {
  getAll(): Promise<Transaction[]>
  saveAll(transactions: Transaction[]): Promise<void>
  clear(): Promise<void>
}

/** API-backed implementation — persists transactions in Turso via /api/transactions. */
export const transactionsAdapter: TransactionsAdapter = {
  async getAll() {
    const res = await fetch('/api/transactions', { credentials: 'include' })
    if (!res.ok) throw new Error(`[transactionsAdapter] getAll failed: ${res.status}`)
    const data = await res.json() as Transaction[]
    if (!Array.isArray(data)) throw new Error('[transactionsAdapter] getAll: expected array response')
    return data
      .filter((t) => {
        if (!t.id || !Number.isFinite(t.amount) || !t.date || !/^\d{4}-\d{2}-\d{2}$/.test(t.date) || !t.description) {
          console.warn('[transactionsAdapter] Skipping malformed transaction — missing id, amount, date, or description.', t)
          return false
        }
        return true
      })
      .map((t): Transaction => {
        if (!isValidCategory(t.category)) {
          console.warn(`[transactionsAdapter] Unknown category "${t.category}" on transaction "${t.id}" — coerced to 'Other'.`)
          return { ...t, category: 'Other' }
        }
        return t
      })
  },

  async saveAll(transactions) {
    const res = await fetch('/api/transactions', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(transactions),
    })
    if (!res.ok) throw new Error(`[transactionsAdapter] saveAll failed: ${res.status}`)
  },

  async clear() {
    const res = await fetch('/api/transactions', {
      method:      'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(`[transactionsAdapter] clear failed: ${res.status}`)
  },
}

import type { Transaction, TransactionCategory } from '@/lib/types/transaction'
import { TRANSACTION_CATEGORIES } from '@/lib/types/transaction'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.transactions

const VALID_CATEGORIES = new Set<string>(TRANSACTION_CATEGORIES)

function isValidCategory(cat: string): cat is TransactionCategory {
  return VALID_CATEGORIES.has(cat)
}

/** Async adapter interface — matches the shape of a future API client. */
export type TransactionsAdapter = {
  getAll(): Promise<Transaction[]>
  saveAll(transactions: Transaction[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const transactionsAdapter: TransactionsAdapter = {
  async getAll() {
    const all = readJSON<Transaction[]>(LS_KEY, [])
    return all.filter((t) => {
      if (!isValidCategory(t.category)) {
        console.warn(`[transactionsAdapter] Unknown category "${t.category}" on transaction "${t.id}" — skipped.`)
        return false
      }
      return true
    })
  },

  async saveAll(transactions) {
    if (!writeJSON(LS_KEY, transactions)) throw new Error('localStorage write failed (transactions)')
  },
}

import type { Transaction } from '@/lib/types/transaction'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.transactions

/** Minimal data adapter for transactions. Swap implementation for API later. */
export const transactionsAdapter = {
  getAll(): Transaction[] {
    return readJSON<Transaction[]>(LS_KEY, [])
  },

  saveAll(transactions: Transaction[]): void {
    writeJSON(LS_KEY, transactions)
  },
}

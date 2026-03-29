import type { Transaction } from '@/lib/types/transaction'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.transactions

/** Async adapter interface — matches the shape of a future API client. */
export type TransactionsAdapter = {
  getAll(): Promise<Transaction[]>
  saveAll(transactions: Transaction[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const transactionsAdapter: TransactionsAdapter = {
  async getAll() {
    return readJSON<Transaction[]>(LS_KEY, [])
  },

  async saveAll(transactions) {
    writeJSON(LS_KEY, transactions)
  },
}

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Transaction } from '@/lib/types/transaction'
import { recordAudit } from '@/lib/store/audit-store'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.transactions

type TransactionsContextType = {
  transactions: Transaction[]
  isLoaded: boolean
  addTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void
}

const TransactionsContext = createContext<TransactionsContextType>({
  transactions: [],
  isLoaded: false,
  addTransaction: () => {},
  removeTransaction: () => {},
})

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = readJSON<Transaction[]>(LS_KEY, [])
    if (stored.length > 0) setTransactions(stored)
    setIsLoaded(true)
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => {
      const updated = [t, ...prev]
      writeJSON(LS_KEY, updated)
      return updated
    })
    recordAudit('Transaction added', t.description)
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const target = prev.find((t) => t.id === id)
      if (target) recordAudit('Transaction deleted', target.description)
      const updated = prev.filter((t) => t.id !== id)
      writeJSON(LS_KEY, updated)
      return updated
    })
  }, [])

  return (
    <TransactionsContext.Provider value={{ transactions, isLoaded, addTransaction, removeTransaction }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  return useContext(TransactionsContext)
}

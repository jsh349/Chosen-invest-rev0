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
import { transactionsAdapter } from '@/lib/adapters/transactions-adapter'

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
    let cancelled = false
    transactionsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) setTransactions(stored)
      setIsLoaded(true)
    }).catch(() => { if (!cancelled) setIsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => {
      const updated = [t, ...prev]
      transactionsAdapter.saveAll(updated)
        .then(() => { /* state already set */ })
        .catch((err) => { console.error(err); setTransactions(prev) })
      return updated
    })
    recordAudit('Transaction added', t.description)
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const target = prev.find((t) => t.id === id)
      if (target) recordAudit('Transaction deleted', target.description)
      const updated = prev.filter((t) => t.id !== id)
      transactionsAdapter.saveAll(updated)
        .then(() => { /* state already set */ })
        .catch((err) => { console.error(err); setTransactions(prev) })
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

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

const LS_KEY = 'chosen_transactions_v1'

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
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) setTransactions(JSON.parse(stored))
    } catch {
      // ignore malformed data
    }
    setIsLoaded(true)
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    setTransactions((prev) => {
      const updated = [t, ...prev]
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeTransaction = useCallback((id: string) => {
    setTransactions((prev) => {
      const updated = prev.filter((t) => t.id !== id)
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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

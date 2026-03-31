'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
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
  // Ref mirrors state so mutation callbacks can build the next array without
  // putting async side-effects inside the setState updater (Strict Mode double-invoke).
  const transactionsRef = useRef<Transaction[]>([])

  useEffect(() => {
    let cancelled = false
    transactionsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) {
        transactionsRef.current = stored
        setTransactions(stored)
      }
      setIsLoaded(true)
    }).catch(() => {
      if (!cancelled) setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    const updated = [t, ...transactionsRef.current]
    transactionsRef.current = updated
    setTransactions(updated)
    void transactionsAdapter.saveAll(updated).catch(() => { console.error('[transactions] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    recordAudit('Transaction added', t.description)
  }, [])

  const removeTransaction = useCallback((id: string) => {
    const target = transactionsRef.current.find((t) => t.id === id)
    if (target) recordAudit('Transaction deleted', target.description)
    const updated = transactionsRef.current.filter((t) => t.id !== id)
    transactionsRef.current = updated
    setTransactions(updated)
    void transactionsAdapter.saveAll(updated).catch(() => { console.error('[transactions] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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

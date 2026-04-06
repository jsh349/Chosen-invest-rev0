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
  /** True when the initial load failed. isLoaded is also true in this state. */
  isLoadError: boolean
  addTransaction: (t: Transaction) => void
  removeTransaction: (id: string) => void
}

const TransactionsContext = createContext<TransactionsContextType>({
  transactions: [],
  isLoaded: false,
  isLoadError: false,
  addTransaction: () => {},
  removeTransaction: () => {},
})

export function TransactionsProvider({ children }: { children: ReactNode }) {
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)
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
      if (!cancelled) {
        setIsLoadError(true)
        setIsLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addTransaction = useCallback((t: Transaction) => {
    const prev = transactionsRef.current
    const updated = [t, ...transactionsRef.current]
    transactionsRef.current = updated
    setTransactions(updated)
    void transactionsAdapter.saveAll(updated).catch(() => {
      console.error('[transactions] save failed')
      transactionsRef.current = prev
      setTransactions(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
    recordAudit('Transaction added', t.description)
  }, [])

  const removeTransaction = useCallback((id: string) => {
    const prev = transactionsRef.current
    const target = transactionsRef.current.find((t) => t.id === id)
    if (target) recordAudit('Transaction deleted', target.description)
    const updated = transactionsRef.current.filter((t) => t.id !== id)
    transactionsRef.current = updated
    setTransactions(updated)
    void transactionsAdapter.saveAll(updated).catch(() => {
      console.error('[transactions] save failed')
      transactionsRef.current = prev
      setTransactions(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
  }, [])

  return (
    <TransactionsContext.Provider value={{ transactions, isLoaded, isLoadError, addTransaction, removeTransaction }}>
      {children}
    </TransactionsContext.Provider>
  )
}

export function useTransactions() {
  return useContext(TransactionsContext)
}

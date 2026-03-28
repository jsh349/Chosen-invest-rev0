'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const LS_KEY = 'chosen_audit_v1'
const MAX_ENTRIES = 50

export type AuditEntry = {
  id: string
  action: string    // e.g. "Asset added", "Goal deleted"
  detail: string    // e.g. asset/goal name
  timestamp: string // ISO
}

/** Standalone helper — callable from any store without React context */
export function recordAudit(action: string, detail: string) {
  try {
    const raw = window.localStorage.getItem(LS_KEY)
    const existing: AuditEntry[] = raw ? JSON.parse(raw) : []
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      action,
      detail,
      timestamp: new Date().toISOString(),
    }
    const updated = [entry, ...existing].slice(0, MAX_ENTRIES)
    window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
  } catch {
    // never break the app for audit
  }
}

type AuditContextType = {
  entries: AuditEntry[]
  isLoaded: boolean
  refresh: () => void
  clear: () => void
}

const AuditContext = createContext<AuditContextType>({
  entries: [],
  isLoaded: false,
  refresh: () => {},
  clear: () => {},
})

export function AuditProvider({ children }: { children: ReactNode }) {
  const [entries, setEntries] = useState<AuditEntry[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  const load = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(LS_KEY)
      setEntries(raw ? JSON.parse(raw) : [])
    } catch {
      setEntries([])
    }
  }, [])

  useEffect(() => {
    load()
    setIsLoaded(true)
  }, [load])

  const refresh = useCallback(() => load(), [load])

  const clear = useCallback(() => {
    window.localStorage.removeItem(LS_KEY)
    setEntries([])
  }, [])

  return (
    <AuditContext.Provider value={{ entries, isLoaded, refresh, clear }}>
      {children}
    </AuditContext.Provider>
  )
}

export function useAudit() {
  return useContext(AuditContext)
}

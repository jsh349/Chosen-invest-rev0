'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.audit
const MAX_ENTRIES = 50

export type AuditEntry = {
  id: string
  action: string    // e.g. "Asset added", "Goal deleted"
  detail: string    // e.g. asset/goal name
  timestamp: string // ISO
}

/** Standalone helper — callable from any store without React context */
export function recordAudit(action: string, detail: string) {
  if (typeof window === 'undefined') return
  try {
    const existing = readJSON<AuditEntry[]>(LS_KEY, [])
    const entry: AuditEntry = {
      id: crypto.randomUUID(),
      action,
      detail,
      timestamp: new Date().toISOString(),
    }
    writeJSON(LS_KEY, [entry, ...existing].slice(0, MAX_ENTRIES))
  } catch (e) {
    // Never break the app for audit, but surface the failure so the
    // PersistErrorBanner fires — consistent with every other store.
    console.warn('[audit] failed to record:', e)
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('persist-error'))
    }
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
    setEntries(readJSON<AuditEntry[]>(LS_KEY, []))
  }, [])

  useEffect(() => {
    load()
    setIsLoaded(true)
  }, [load])

  const refresh = useCallback(() => load(), [load])

  const clear = useCallback(() => {
    writeJSON(LS_KEY, [])
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

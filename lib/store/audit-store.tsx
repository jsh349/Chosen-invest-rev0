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
    // Notify the AuditProvider so its in-memory state stays in sync with
    // localStorage without requiring a page navigation or manual refresh.
    window.dispatchEvent(new CustomEvent('audit-updated'))
  } catch (e) {
    // Audit failure is non-critical — log quietly, do not show the
    // PersistErrorBanner (which is reserved for data-loss-risk failures).
    console.warn('[audit] failed to record:', e)
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
    // Keep in-memory state in sync with localStorage writes from recordAudit(),
    // which writes directly outside the React context.
    window.addEventListener('audit-updated', load)
    return () => window.removeEventListener('audit-updated', load)
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

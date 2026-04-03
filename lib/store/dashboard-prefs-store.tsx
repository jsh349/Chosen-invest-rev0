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

import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.dashboardPrefs

export type DashboardCardKey =
  | 'allocation'
  | 'portfolioStatus'
  | 'advisor'
  | 'goals'
  | 'transactions'
  | 'taxOpportunity'
  | 'cashFlowInsight'
  | 'rank'

export const CARD_LABELS: Record<DashboardCardKey, string> = {
  allocation:      'Allocation Overview',
  portfolioStatus: 'Portfolio Status',
  advisor:         'AI Advisor',
  goals:           'Goals Summary',
  transactions:    'Transaction Summary',
  taxOpportunity:  'Tax Opportunity',
  cashFlowInsight: 'Cash Flow Insight',
  rank:            'Wealth Rank',
}

const DEFAULT_PREFS: Record<DashboardCardKey, boolean> = {
  allocation:      true,
  portfolioStatus: true,
  advisor:         true,
  goals:           true,
  transactions:    true,
  taxOpportunity:  true,
  cashFlowInsight: true,
  rank:            true,
}

type DashboardPrefsContextType = {
  prefs: Record<DashboardCardKey, boolean>
  isLoaded: boolean
  toggle: (key: DashboardCardKey) => void
}

const DashboardPrefsContext = createContext<DashboardPrefsContextType>({
  prefs: DEFAULT_PREFS,
  isLoaded: false,
  toggle: () => {},
})

export function DashboardPrefsProvider({ children }: { children: ReactNode }) {
  const [prefs, setPrefs] = useState<Record<DashboardCardKey, boolean>>(DEFAULT_PREFS)
  const [isLoaded, setIsLoaded] = useState(false)
  // Ref mirrors state so toggle can read and write current value without
  // closing over stale state inside the setState updater. This prevents
  // React Strict Mode from double-firing the localStorage write (updater
  // functions run twice in dev) and keeps the pattern compatible with
  // future async saves.
  const prefsRef = useRef<Record<DashboardCardKey, boolean>>(DEFAULT_PREFS)

  useEffect(() => {
    const stored = readJSON<Record<string, unknown>>(LS_KEY, {})
    if (stored && Object.keys(stored).length > 0) {
      // Only accept known card keys with boolean values — guards against
      // type drift (e.g. stored string where boolean expected).
      const VALID_KEYS = new Set<string>(Object.keys(DEFAULT_PREFS))
      const sanitized: Partial<Record<DashboardCardKey, boolean>> = {}
      for (const [key, value] of Object.entries(stored)) {
        if (VALID_KEYS.has(key) && typeof value === 'boolean') {
          sanitized[key as DashboardCardKey] = value
        }
      }
      const loaded = { ...DEFAULT_PREFS, ...sanitized }
      prefsRef.current = loaded
      setPrefs(loaded)
    }
    setIsLoaded(true)
  }, [])

  const toggle = useCallback((key: DashboardCardKey) => {
    const updated = { ...prefsRef.current, [key]: !prefsRef.current[key] }
    prefsRef.current = updated
    setPrefs(updated)
    writeJSON(LS_KEY, updated)
  }, [])

  return (
    <DashboardPrefsContext.Provider value={{ prefs, isLoaded, toggle }}>
      {children}
    </DashboardPrefsContext.Provider>
  )
}

export function useDashboardPrefs() {
  return useContext(DashboardPrefsContext)
}

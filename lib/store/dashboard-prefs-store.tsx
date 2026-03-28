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

const LS_KEY = STORAGE_KEYS.dashboardPrefs

export type DashboardCardKey =
  | 'allocation'
  | 'portfolioStatus'
  | 'advisor'
  | 'goals'
  | 'transactions'
  | 'taxOpportunity'
  | 'cashFlowInsight'

export const CARD_LABELS: Record<DashboardCardKey, string> = {
  allocation:      'Allocation Overview',
  portfolioStatus: 'Portfolio Status',
  advisor:         'AI Advisor',
  goals:           'Goals Summary',
  transactions:    'Transaction Summary',
  taxOpportunity:  'Tax Opportunity',
  cashFlowInsight: 'Cash Flow Insight',
}

const DEFAULT_PREFS: Record<DashboardCardKey, boolean> = {
  allocation:      true,
  portfolioStatus: true,
  advisor:         true,
  goals:           true,
  transactions:    true,
  taxOpportunity:  true,
  cashFlowInsight: true,
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

  useEffect(() => {
    const stored = readJSON<Record<string, boolean>>(LS_KEY, {})
    if (Object.keys(stored).length > 0) {
      setPrefs({ ...DEFAULT_PREFS, ...stored })
    }
    setIsLoaded(true)
  }, [])

  const toggle = useCallback((key: DashboardCardKey) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      writeJSON(LS_KEY, updated)
      return updated
    })
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

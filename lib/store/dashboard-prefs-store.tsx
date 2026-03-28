'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const LS_KEY = 'chosen_dashboard_prefs_v1'

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
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) {
        // Merge stored with defaults so new keys always have a value
        setPrefs({ ...DEFAULT_PREFS, ...JSON.parse(stored) })
      }
    } catch {
      // ignore malformed data
    }
    setIsLoaded(true)
  }, [])

  const toggle = useCallback((key: DashboardCardKey) => {
    setPrefs((prev) => {
      const updated = { ...prev, [key]: !prev[key] }
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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

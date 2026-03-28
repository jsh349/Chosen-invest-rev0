'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'

const LS_KEY = 'chosen_settings_v1'

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'KRW'

export type AppSettings = {
  currency:         CurrencyCode
  showCents:        boolean
  defaultLanding:   'dashboard' | 'portfolio' | 'goals' | 'transactions'
}

export const DEFAULT_SETTINGS: AppSettings = {
  currency:       'USD',
  showCents:      true,
  defaultLanding: 'dashboard',
}

type SettingsContextType = {
  settings: AppSettings
  isLoaded: boolean
  update: (patch: Partial<AppSettings>) => void
}

const SettingsContext = createContext<SettingsContextType>({
  settings: DEFAULT_SETTINGS,
  isLoaded: false,
  update: () => {},
})

export function SettingsProvider({ children }: { children: ReactNode }) {
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS)
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) setSettings({ ...DEFAULT_SETTINGS, ...JSON.parse(stored) })
    } catch {
      // ignore malformed data
    }
    setIsLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch }
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <SettingsContext.Provider value={{ settings, isLoaded, update }}>
      {children}
    </SettingsContext.Provider>
  )
}

export function useSettings() {
  return useContext(SettingsContext)
}

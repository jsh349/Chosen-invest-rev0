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
import type { GenderOption } from '@/lib/types/rank'

const LS_KEY = STORAGE_KEYS.settings

export type CurrencyCode = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'KRW'

export type AppSettings = {
  currency:         CurrencyCode
  showCents:        boolean
  defaultLanding:   'dashboard' | 'portfolio' | 'goals' | 'transactions'
  birthYear?:       number
  gender?:          GenderOption
  annualReturnPct?: number
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
    const stored = readJSON<Partial<AppSettings>>(LS_KEY, {})
    if (Object.keys(stored).length > 0) {
      setSettings({ ...DEFAULT_SETTINGS, ...stored })
    }
    setIsLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch }
      writeJSON(LS_KEY, updated)
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

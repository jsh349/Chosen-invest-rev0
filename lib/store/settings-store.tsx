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

const VALID_CURRENCIES = new Set<string>(['USD', 'EUR', 'GBP', 'JPY', 'KRW'])
const VALID_GENDERS    = new Set<string>(['male', 'female', 'other', 'undisclosed'])

/**
 * Strips fields with invalid types or values from a raw stored object.
 * Guards against corrupted localStorage or schema drift across app versions.
 * The result is merged onto DEFAULT_SETTINGS at load time.
 */
function sanitizeStoredSettings(raw: Record<string, unknown>): Partial<AppSettings> {
  const out: Partial<AppSettings> = {}
  if (VALID_CURRENCIES.has(raw.currency as string))                                             out.currency        = raw.currency as CurrencyCode
  if (typeof raw.showCents === 'boolean')                                                        out.showCents       = raw.showCents
  if (typeof raw.birthYear === 'number' && raw.birthYear >= 1900 && raw.birthYear <= 2100)      out.birthYear       = raw.birthYear
  if (typeof raw.gender === 'string' && VALID_GENDERS.has(raw.gender))                         out.gender          = raw.gender as GenderOption
  if (typeof raw.annualReturnPct === 'number' && raw.annualReturnPct >= -100 && raw.annualReturnPct <= 1000) out.annualReturnPct = raw.annualReturnPct
  return out
}

export type AppSettings = {
  currency:         CurrencyCode
  showCents:        boolean
  birthYear?:       number
  gender?:          GenderOption
  annualReturnPct?: number
}

export const DEFAULT_SETTINGS: AppSettings = {
  currency:  'USD',
  showCents: true,
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
    const stored = readJSON<Record<string, unknown>>(LS_KEY, {})
    if (stored && Object.keys(stored).length > 0) {
      setSettings({ ...DEFAULT_SETTINGS, ...sanitizeStoredSettings(stored) })
    }
    setIsLoaded(true)
  }, [])

  const update = useCallback((patch: Partial<AppSettings>) => {
    setSettings((prev) => {
      const updated = { ...prev, ...patch }
      if (!writeJSON(LS_KEY, updated)) {
        console.error('[settings] save failed')
        window.dispatchEvent(new CustomEvent('persist-error'))
      }
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

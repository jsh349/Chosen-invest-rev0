'use client'

import { useRef, useState } from 'react'
import { Download, Upload } from 'lucide-react'
import { useSettings, DEFAULT_SETTINGS, type CurrencyCode, type AppSettings } from '@/lib/store/settings-store'

const SELECT_CLASS = 'w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none'

// All localStorage keys managed by the app
const EXPORT_KEYS = [
  'chosen_assets_v1',
  'chosen_goals_v1',
  'chosen_transactions_v1',
  'chosen_household_v1',
  'chosen_household_notes_v1',
  'chosen_settings_v1',
  'chosen_dashboard_prefs_v1',
] as const

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar ($)'    },
  { value: 'EUR', label: 'EUR — Euro (€)'          },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
  { value: 'JPY', label: 'JPY — Japanese Yen (¥)'  },
  { value: 'KRW', label: 'KRW — Korean Won (₩)'    },
]

const LANDING_OPTIONS: { value: AppSettings['defaultLanding']; label: string }[] = [
  { value: 'dashboard',    label: 'Dashboard'    },
  { value: 'portfolio',    label: 'Portfolio'    },
  { value: 'goals',        label: 'Goals'        },
  { value: 'transactions', label: 'Transactions' },
]

function Row({ label, hint, children }: { label: string; hint?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5 border-b border-surface-border py-4 last:border-0 sm:flex-row sm:items-center sm:justify-between sm:gap-6">
      <div className="shrink-0">
        <p className="text-sm font-medium text-white">{label}</p>
        {hint && <p className="text-xs text-gray-500">{hint}</p>}
      </div>
      <div className="sm:w-56">{children}</div>
    </div>
  )
}

function handleExport() {
  const data: Record<string, unknown> = { exportedAt: new Date().toISOString() }
  for (const key of EXPORT_KEYS) {
    try {
      const raw = window.localStorage.getItem(key)
      data[key] = raw ? JSON.parse(raw) : null
    } catch {
      data[key] = null
    }
  }
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `chosen-invest-backup-${new Date().toISOString().slice(0, 10)}.json`
  a.click()
  URL.revokeObjectURL(url)
}

function validateImport(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'File must be a JSON object.'
  }
  const hasAnyKey = EXPORT_KEYS.some((k) => k in (data as Record<string, unknown>))
  if (!hasAnyKey) {
    return 'File does not contain any recognised Chosen Invest data.'
  }
  return null
}

export default function SettingsPage() {
  const { settings, isLoaded, update } = useSettings()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  function handleImport(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    // Reset input so the same file can be re-selected after an error
    e.target.value = ''

    const reader = new FileReader()
    reader.onload = (evt) => {
      try {
        const data = JSON.parse(evt.target?.result as string)
        const error = validateImport(data)
        if (error) { setImportStatus({ type: 'error', message: error }); return }

        let restored = 0
        for (const key of EXPORT_KEYS) {
          const value = (data as Record<string, unknown>)[key]
          if (value !== null && value !== undefined) {
            window.localStorage.setItem(key, JSON.stringify(value))
            restored++
          }
        }
        setImportStatus({ type: 'success', message: `${restored} data section${restored !== 1 ? 's' : ''} restored. Refresh the page to see changes.` })
      } catch {
        setImportStatus({ type: 'error', message: 'Could not parse file. Make sure it is a valid JSON backup.' })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">Local preferences — saved in your browser</p>
      </div>

      {/* Display */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-4">
        <h2 className="border-b border-surface-border py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Display
        </h2>
        <Row label="Currency" hint="Used for amount formatting across the app">
          <select
            value={settings.currency}
            onChange={(e) => update({ currency: e.target.value as CurrencyCode })}
            className={SELECT_CLASS}
          >
            {CURRENCIES.map((c) => <option key={c.value} value={c.value}>{c.label}</option>)}
          </select>
        </Row>
        <Row label="Show cents" hint="Display decimal places in currency amounts">
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={settings.showCents}
              onChange={(e) => update({ showCents: e.target.checked })}
              className="h-4 w-4 rounded border-surface-border accent-brand-500"
            />
            <span className="text-sm text-gray-400">
              {settings.showCents ? 'Showing cents (e.g. $1,234.56)' : 'Hidden (e.g. $1,234)'}
            </span>
          </label>
        </Row>
      </div>

      {/* Navigation */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-4">
        <h2 className="border-b border-surface-border py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Navigation
        </h2>
        <Row label="Default landing page" hint="Where to go after signing in">
          <select
            value={settings.defaultLanding}
            onChange={(e) => update({ defaultLanding: e.target.value as AppSettings['defaultLanding'] })}
            className={SELECT_CLASS}
          >
            {LANDING_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
          </select>
        </Row>
      </div>

      {/* Data export / import */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-4">
        <h2 className="border-b border-surface-border py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Data
        </h2>

        <div className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Export data</p>
            <p className="text-xs text-gray-500">Download all local app data as a JSON backup file</p>
          </div>
          <button
            onClick={handleExport}
            className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-xs text-gray-300 hover:border-brand-700 hover:text-white transition-colors w-fit"
          >
            <Download className="h-3.5 w-3.5" />
            Export JSON
          </button>
        </div>

        <div className="flex flex-col gap-3 border-t border-surface-border py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm font-medium text-white">Import data</p>
            <p className="text-xs text-gray-500">Restore from a previously exported JSON backup</p>
          </div>
          <button
            onClick={() => { setImportStatus(null); fileInputRef.current?.click() }}
            className="flex items-center gap-2 rounded-lg border border-surface-border px-3 py-1.5 text-xs text-gray-300 hover:border-brand-700 hover:text-white transition-colors w-fit"
          >
            <Upload className="h-3.5 w-3.5" />
            Import JSON
          </button>
          <input ref={fileInputRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
        </div>

        {importStatus && (
          <p className={`mb-4 rounded-lg px-3 py-2 text-xs ${importStatus.type === 'success' ? 'bg-green-950 text-green-400' : 'bg-red-950 text-red-400'}`}>
            {importStatus.message}
          </p>
        )}
      </div>

      {/* Reset */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Reset preferences</p>
          <p className="text-xs text-gray-500">Restore display and navigation preferences to defaults</p>
        </div>
        <button
          onClick={() => update(DEFAULT_SETTINGS)}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs text-gray-400 hover:border-red-800 hover:text-red-400 transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        All data is stored locally in your browser and is not synced to any server.
      </p>
    </div>
  )
}

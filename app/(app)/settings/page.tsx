'use client'

import { useSettings, DEFAULT_SETTINGS, type CurrencyCode, type AppSettings } from '@/lib/store/settings-store'

const SELECT_CLASS = 'w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none'

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar ($)'     },
  { value: 'EUR', label: 'EUR — Euro (€)'           },
  { value: 'GBP', label: 'GBP — British Pound (£)'  },
  { value: 'JPY', label: 'JPY — Japanese Yen (¥)'   },
  { value: 'KRW', label: 'KRW — Korean Won (₩)'     },
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

export default function SettingsPage() {
  const { settings, isLoaded, update } = useSettings()

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Settings</h1>
        <p className="mt-0.5 text-sm text-gray-500">Local preferences — saved in your browser</p>
      </div>

      {/* Display preferences */}
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
            {CURRENCIES.map((c) => (
              <option key={c.value} value={c.value}>{c.label}</option>
            ))}
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

      {/* Navigation preferences */}
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
            {LANDING_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </Row>
      </div>

      {/* Reset */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-4 py-3">
        <div>
          <p className="text-sm font-medium text-white">Reset to defaults</p>
          <p className="text-xs text-gray-500">Restore all preferences to their original values</p>
        </div>
        <button
          onClick={() => update(DEFAULT_SETTINGS)}
          className="rounded-lg border border-surface-border px-3 py-1.5 text-xs text-gray-400 hover:border-red-800 hover:text-red-400 transition-colors"
        >
          Reset
        </button>
      </div>

      <p className="text-xs text-gray-600 text-center">
        Settings are stored locally in your browser and are not synced to any server.
      </p>
    </div>
  )
}

'use client'

import { useEffect, useRef, useState } from 'react'
import { Download, Upload, History } from 'lucide-react'
import { useSettings, DEFAULT_SETTINGS, type CurrencyCode } from '@/lib/store/settings-store'
import type { GenderOption } from '@/lib/types/rank'
import { useAudit } from '@/lib/store/audit-store'
import { STORAGE_KEYS, ALL_STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import {
  getAvailableBenchmarkSources,
  getActiveBenchmarkSourceId,
  setActiveBenchmarkSourceId,
  type BenchmarkSource,
} from '@/lib/adapters/rank-benchmarks-adapter'

/** Keys whose stored value must be an array. Non-array values are skipped on import. */
const ARRAY_KEYS: ReadonlySet<string> = new Set([
  STORAGE_KEYS.assets,
  STORAGE_KEYS.goals,
  STORAGE_KEYS.transactions,
  STORAGE_KEYS.household,
  STORAGE_KEYS.householdNotes,
  STORAGE_KEYS.audit,
  STORAGE_KEYS.rankSnapshots,
])

/** Keys whose stored value must be a plain string. */
const STRING_KEYS: ReadonlySet<string> = new Set([
  STORAGE_KEYS.benchmarkSource,
  STORAGE_KEYS.benchmarkSeen,
  STORAGE_KEYS.rankReviewSeen,
])

/** Keys whose stored value must be a plain object (not array, not null). */
const OBJECT_KEYS: ReadonlySet<string> = new Set([
  STORAGE_KEYS.settings,
  STORAGE_KEYS.dashboardPrefs,
  STORAGE_KEYS.benchmarkPending,
  STORAGE_KEYS.benchmarkApplied,
])

function isSafeToRestore(key: string, value: unknown): boolean {
  if (ARRAY_KEYS.has(key) && !Array.isArray(value)) return false
  if (OBJECT_KEYS.has(key) && (typeof value !== 'object' || value === null || Array.isArray(value))) return false
  if (STRING_KEYS.has(key) && typeof value !== 'string') return false
  return true
}

const SELECT_CLASS = 'w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none'

const CURRENCIES: { value: CurrencyCode; label: string }[] = [
  { value: 'USD', label: 'USD — US Dollar ($)'    },
  { value: 'EUR', label: 'EUR — Euro (€)'          },
  { value: 'GBP', label: 'GBP — British Pound (£)' },
  { value: 'JPY', label: 'JPY — Japanese Yen (¥)'  },
  { value: 'KRW', label: 'KRW — Korean Won (₩)'    },
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
  if (typeof window === 'undefined') return
  const data: Record<string, unknown> = { exportedAt: new Date().toISOString() }
  for (const key of ALL_STORAGE_KEYS) {
    try {
      const raw = window.localStorage.getItem(key)
      if (raw === null) { data[key] = null; continue }
      // Scalar string keys are stored as raw strings — no JSON layer
      data[key] = STRING_KEYS.has(key) ? raw : JSON.parse(raw)
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
  const hasAnyKey = ALL_STORAGE_KEYS.some((k) => k in (data as Record<string, unknown>))
  if (!hasAnyKey) {
    return 'File does not contain any recognised Chosen Invest data.'
  }
  return null
}

export default function SettingsPage() {
  const { settings, isLoaded, update } = useSettings()
  const { entries: auditEntries, isLoaded: auditLoaded, refresh: refreshAudit, clear: clearAudit } = useAudit()
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [importStatus, setImportStatus] = useState<{ type: 'success' | 'error'; message: string } | null>(null)

  // Local raw strings so typing partial numbers (e.g. "199") doesn't reset the field.
  // Synced back from settings when settings change externally (e.g. Reset).
  const [birthYearRaw, setBirthYearRaw] = useState<string>(settings.birthYear?.toString() ?? '')
  const [returnRaw, setReturnRaw] = useState<string>(settings.annualReturnPct?.toString() ?? '')
  const [birthYearError, setBirthYearError] = useState('')
  const [returnError, setReturnError] = useState('')

  const benchmarkSources = getAvailableBenchmarkSources()
  const [selectedBenchmarkSource, setSelectedBenchmarkSource] = useState<BenchmarkSource['id']>(
    getActiveBenchmarkSourceId
  )

  // recordAudit() writes directly to localStorage outside the React context,
  // so context state can be stale when navigating here. Refresh on mount so
  // the audit log reflects actions taken during the current session.
  useEffect(() => { refreshAudit() }, [refreshAudit])

  // Keep raw input strings in sync when settings change externally (e.g. Reset button).
  useEffect(() => { setBirthYearRaw(settings.birthYear?.toString() ?? ''); setBirthYearError('') }, [settings.birthYear])
  useEffect(() => { setReturnRaw(settings.annualReturnPct?.toString() ?? ''); setReturnError('') }, [settings.annualReturnPct])

  if (!isLoaded) {
    return (
      <LoadingSpinner />
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
        for (const key of ALL_STORAGE_KEYS) {
          const value = (data as Record<string, unknown>)[key]
          if (value !== null && value !== undefined && isSafeToRestore(key, value)) {
            if (typeof window !== 'undefined') {
              // Scalar string keys are stored as raw strings — no JSON layer
              window.localStorage.setItem(key, STRING_KEYS.has(key) ? (value as string) : JSON.stringify(value))
            }
            restored++
          }
        }
        setImportStatus({ type: 'success', message: `${restored} data section${restored !== 1 ? 's' : ''} restored. Reloading…` })
        setTimeout(() => window.location.reload(), 1200)
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

      {/* Profile */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-4">
        <h2 className="border-b border-surface-border py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
          Profile
        </h2>
        <Row label="Birth year" hint="Used for age-based wealth ranking">
          <input
            type="number"
            min={1920}
            max={new Date().getFullYear() - 10}
            placeholder="e.g. 1990"
            value={birthYearRaw}
            onChange={(e) => {
              const raw = e.target.value
              setBirthYearRaw(raw)
              if (raw === '') { update({ birthYear: undefined }); setBirthYearError(''); return }
              const yr = parseInt(raw, 10)
              if (yr >= 1920 && yr <= new Date().getFullYear() - 10) {
                update({ birthYear: yr })
                setBirthYearError('')
              } else {
                setBirthYearError(`Enter a year between 1920 and ${new Date().getFullYear() - 10}.`)
              }
            }}
            className={SELECT_CLASS}
          />
          {birthYearError && <p className="mt-1 text-xs text-red-400">{birthYearError}</p>}
        </Row>
        <Row label="Gender" hint="Used for age + gender wealth ranking (optional)">
          <select
            value={settings.gender ?? ''}
            onChange={(e) => {
              const val = e.target.value
              update({ gender: val === '' ? undefined : val as GenderOption })
            }}
            className={SELECT_CLASS}
          >
            <option value="">— Not set —</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
            <option value="undisclosed">Prefer not to say</option>
          </select>
        </Row>
        <Row label="Est. annual return (%)" hint="Your estimated annualized investment return. Used for return ranking.">
          <input
            type="number"
            step="0.1"
            min={-50}
            max={100}
            placeholder="e.g. 8.5"
            value={returnRaw}
            onChange={(e) => {
              const raw = e.target.value
              setReturnRaw(raw)
              if (raw === '') { update({ annualReturnPct: undefined }); setReturnError(''); return }
              const n = parseFloat(raw)
              if (Number.isFinite(n) && n >= -50 && n <= 100) {
                update({ annualReturnPct: n })
                setReturnError('')
              } else {
                setReturnError('Enter a value between −50 and 100.')
              }
            }}
            className={SELECT_CLASS}
          />
          {returnError && <p className="mt-1 text-xs text-red-400">{returnError}</p>}
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

      {/* Recent activity */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-4">
        <div className="flex items-center justify-between border-b border-surface-border py-3">
          <h2 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-gray-500">
            <History className="h-3.5 w-3.5" />
            Recent Activity
          </h2>
          {auditEntries.length > 0 && (
            <button
              onClick={clearAudit}
              className="text-xs text-gray-600 hover:text-red-400 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        {!auditLoaded ? null : auditEntries.length === 0 ? (
          <p className="py-6 text-center text-sm text-gray-500">No activity recorded yet.</p>
        ) : (
          <div className="divide-y divide-surface-border max-h-72 overflow-y-auto">
            {auditEntries.slice(0, 20).map((e) => (
              <div key={e.id} className="flex items-center justify-between gap-3 py-2.5">
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-gray-300">
                    <span className="font-medium">{e.action}</span>
                    <span className="text-gray-500"> — {e.detail}</span>
                  </p>
                </div>
                <span className="shrink-0 text-xs text-gray-600 tabular-nums">
                  {new Date(e.timestamp).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                  {' '}
                  {new Date(e.timestamp).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Benchmark source — shown only when 2+ sources are available (internal use) */}
      {benchmarkSources.length >= 2 && (
        <div className="rounded-xl border border-surface-border bg-surface-card px-4">
          <h2 className="border-b border-surface-border py-3 text-xs font-semibold uppercase tracking-wide text-gray-500">
            Benchmark Data <span className="normal-case font-normal text-gray-600">(internal)</span>
          </h2>
          <Row label="Active source" hint="Rank calculations use this benchmark dataset">
            <div className="flex items-center gap-2">
              <select
                value={selectedBenchmarkSource}
                onChange={(e) => setSelectedBenchmarkSource(e.target.value as BenchmarkSource['id'])}
                className={SELECT_CLASS}
              >
                {benchmarkSources.map((s) => (
                  <option key={s.id} value={s.id}>{s.label}</option>
                ))}
              </select>
              <button
                onClick={() => {
                  setActiveBenchmarkSourceId(selectedBenchmarkSource)
                  window.location.reload()
                }}
                disabled={selectedBenchmarkSource === getActiveBenchmarkSourceId()}
                className="shrink-0 rounded-lg border border-surface-border px-3 py-2 text-xs text-gray-300 hover:border-brand-700 hover:text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Apply
              </button>
            </div>
          </Row>
        </div>
      )}

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

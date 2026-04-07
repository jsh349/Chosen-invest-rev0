import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

export type BenchmarkSourceSwitch = {
  /** Source id that was active before the switch (e.g. 'default'). */
  from:      string
  /** Source id that became active after the switch (e.g. 'curated'). */
  to:        string
  /** ISO 8601 timestamp of when the switch was recorded. */
  changedAt: string
}

/** Maximum number of entries to retain. */
export const MAX_SOURCE_HISTORY = 5

/**
 * Prepends a new switch record to localStorage history.
 * No-op when from === to (no actual change).
 * Trims the list to MAX_SOURCE_HISTORY after insertion.
 * SSR-safe — silently skips when window is unavailable.
 */
export function recordBenchmarkSourceSwitch(from: string, to: string): void {
  if (from === to) return
  const entry: BenchmarkSourceSwitch = {
    from,
    to,
    changedAt: new Date().toISOString(),
  }
  const history = readJSON<BenchmarkSourceSwitch[]>(STORAGE_KEYS.benchmarkSourceHistory, [])
  const updated = [entry, ...history].slice(0, MAX_SOURCE_HISTORY)
  writeJSON(STORAGE_KEYS.benchmarkSourceHistory, updated)
}

/**
 * Returns the stored switch history, most recent first.
 * Returns an empty array when nothing has been recorded or on any read error.
 * SSR-safe — returns [] when window is unavailable.
 */
export function getBenchmarkSourceHistory(): BenchmarkSourceSwitch[] {
  return readJSON<BenchmarkSourceSwitch[]>(STORAGE_KEYS.benchmarkSourceHistory, [])
}

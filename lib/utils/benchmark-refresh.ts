/**
 * Benchmark refresh workflow — internal state layer.
 *
 * Manages the lifecycle of a pending benchmark replacement:
 *   stage → (page reload) → apply → record
 *
 * Nothing here connects to a network or triggers a reload automatically.
 * The adapter reads the pending file on the next module load; the caller is
 * responsible for signalling the user that a reload is needed.
 *
 * All functions are SSR-safe (no-op when window is undefined).
 */

import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { validateBenchmarkFile } from '@/lib/utils/benchmark-import'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { writeJSON, removeKey } from '@/lib/utils/local-storage'

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/** Metadata written when a pending benchmark is applied. */
export type BenchmarkAppliedRecord = {
  /** Source label from the applied BenchmarkFile */
  source: string
  /** Vintage year from the applied BenchmarkFile */
  vintageYear: number
  /** ISO 8601 timestamp when the file was applied */
  appliedAt: string
}

/** Snapshot of the full refresh workflow state — for display or diagnostics. */
export type BenchmarkRefreshState = {
  /** True when a validated pending file is staged and waiting to be applied */
  hasPending: boolean
  /** Source label of the pending file, or null if none */
  pendingSource: string | null
  /** Record of the last applied benchmark, or null if never applied */
  lastApplied: BenchmarkAppliedRecord | null
}

// ---------------------------------------------------------------------------
// Pending file
// ---------------------------------------------------------------------------

/**
 * Stages a BenchmarkFile as the pending replacement.
 * Validates the file first — throws if invalid (caller should validate before staging).
 * SSR-safe: no-op on the server.
 */
export function stagePendingBenchmark(file: BenchmarkFile): void {
  if (typeof window === 'undefined') return
  const error = validateBenchmarkFile(file)
  if (error) throw new Error(`Cannot stage invalid benchmark file: ${error}`)
  writeJSON(STORAGE_KEYS.benchmarkPending, file)
}

/**
 * Returns the currently staged BenchmarkFile, or null if none is staged.
 * Returns null if the stored value fails validation (corrupt / stale schema).
 * SSR-safe: returns null on the server.
 */
export function getPendingBenchmark(): BenchmarkFile | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.benchmarkPending)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return validateBenchmarkFile(parsed) === null ? (parsed as BenchmarkFile) : null
  } catch {
    return null
  }
}

/**
 * Removes the staged pending benchmark.
 * SSR-safe: no-op on the server.
 */
export function clearPendingBenchmark(): void {
  removeKey(STORAGE_KEYS.benchmarkPending)
}

// ---------------------------------------------------------------------------
// Applied record
// ---------------------------------------------------------------------------

/**
 * Writes an applied record for a file that has just been put into use.
 * Call this after the adapter has loaded the pending file on module init.
 * SSR-safe: no-op on the server.
 */
export function recordAppliedBenchmark(file: BenchmarkFile): void {
  if (typeof window === 'undefined') return
  const record: BenchmarkAppliedRecord = {
    source:      file.source,
    vintageYear: file.vintageYear,
    appliedAt:   new Date().toISOString(),
  }
  writeJSON(STORAGE_KEYS.benchmarkApplied, record)
}

/**
 * Returns the last applied benchmark record, or null if never applied.
 * SSR-safe: returns null on the server.
 */
export function getLastAppliedBenchmark(): BenchmarkAppliedRecord | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = window.localStorage.getItem(STORAGE_KEYS.benchmarkApplied)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return null
    const record = parsed as Record<string, unknown>
    if (
      typeof record.source      !== 'string' ||
      typeof record.vintageYear !== 'number' ||
      typeof record.appliedAt   !== 'string'
    ) return null
    return record as unknown as BenchmarkAppliedRecord
  } catch {
    return null
  }
}

// ---------------------------------------------------------------------------
// Aggregate state
// ---------------------------------------------------------------------------

/**
 * Returns a snapshot of the full refresh workflow state.
 * Useful for status indicators or diagnostics without exposing raw storage.
 */
export function readBenchmarkRefreshState(): BenchmarkRefreshState {
  const pending = getPendingBenchmark()
  return {
    hasPending:    pending !== null,
    pendingSource: pending?.source ?? null,
    lastApplied:   getLastAppliedBenchmark(),
  }
}

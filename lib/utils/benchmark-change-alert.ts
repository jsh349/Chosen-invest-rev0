import { getActiveBenchmarkSourceId, getActiveBenchmarkMeta } from '@/lib/adapters/rank-benchmarks-adapter'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readScalar, writeScalar } from '@/lib/utils/local-storage'

/**
 * Returns a short informational note when any saved snapshot predates the
 * current benchmark's updatedAt date, meaning comparisons may span different
 * reference ranges.
 *
 * Returns null when no snapshots exist or all are newer than the benchmark update.
 *
 * @param snapshots - Array of objects with a savedAt ISO 8601 string.
 */
export function benchmarkVersionNote(snapshots: { savedAt: string }[]): string | null {
  if (snapshots.length === 0) return null
  const benchmarkDate = new Date(getActiveBenchmarkMeta().updatedAt)
  const hasOlderSnapshot = snapshots.some((s) => new Date(s.savedAt) < benchmarkDate)
  if (!hasOlderSnapshot) return null
  return 'Rank comparisons may reflect updated benchmark reference ranges.'
}

const LS_KEY = STORAGE_KEYS.benchmarkSeen

/**
 * A string that uniquely identifies the active benchmark version and source.
 * When either changes, the fingerprint changes and an alert becomes visible.
 */
export function getBenchmarkFingerprint(): string {
  const source = getActiveBenchmarkSourceId()
  return `${getActiveBenchmarkMeta().version}::${source}`
}

/**
 * Returns true when the stored "last seen" fingerprint differs from the current one.
 * Always returns false on the server (SSR-safe).
 */
export function checkBenchmarkChanged(): boolean {
  if (typeof window === 'undefined') return false
  const stored = readScalar(LS_KEY)
  if (stored === null) {
    writeScalar(LS_KEY, getBenchmarkFingerprint())
    return false
  }
  return stored !== getBenchmarkFingerprint()
}

/**
 * Persists the current fingerprint as seen, suppressing the alert until the
 * version or source changes again.
 */
export function dismissBenchmarkAlert(): void {
  if (typeof window === 'undefined') return
  writeScalar(LS_KEY, getBenchmarkFingerprint())
}

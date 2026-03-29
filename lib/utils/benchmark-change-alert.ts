import { BENCHMARK_META } from '@/lib/mock/rank-benchmarks'
import { getActiveBenchmarkSourceId } from '@/lib/adapters/rank-benchmarks-adapter'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'

const LS_KEY = STORAGE_KEYS.benchmarkSeen

/**
 * A string that uniquely identifies the active benchmark version and source.
 * When either changes, the fingerprint changes and an alert becomes visible.
 */
export function getBenchmarkFingerprint(): string {
  const source = getActiveBenchmarkSourceId()
  return `${BENCHMARK_META.version}::${source}`
}

/**
 * Returns true when the stored "last seen" fingerprint differs from the current one.
 * Always returns false on the server (SSR-safe).
 */
export function checkBenchmarkChanged(): boolean {
  if (typeof window === 'undefined') return false
  try {
    const seen = localStorage.getItem(LS_KEY)
    return seen !== getBenchmarkFingerprint()
  } catch {
    return false
  }
}

/**
 * Persists the current fingerprint as seen, suppressing the alert until the
 * version or source changes again.
 */
export function dismissBenchmarkAlert(): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(LS_KEY, getBenchmarkFingerprint())
  } catch { /* ignore quota / security errors */ }
}

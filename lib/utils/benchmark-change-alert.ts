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

/**
 * Maps a source id to its human-readable display label.
 * Centralised so all source-change surfaces use consistent terminology —
 * previously the label derivation was inlined and duplicated, and neither
 * copy handled the 'external' source introduced in BENCHMARK_SOURCE_PRECEDENCE.
 */
function sourceLabelFor(sourceId: string): string {
  if (sourceId === 'curated')  return 'Curated dataset'
  if (sourceId === 'external') return 'External source'
  return 'Built-in reference'
}

/**
 * Returns a compact note when the benchmark *source* specifically changed
 * since the user last visited. Returns null when the source is unchanged,
 * on first visit (no stored fingerprint), or on the server.
 *
 * Must be called before dismissBenchmarkAlert() to access the previous fingerprint.
 */
export function getBenchmarkTransitionNote(): string | null {
  if (typeof window === 'undefined') return null
  const stored = readScalar(LS_KEY)
  if (stored === null) return null
  const prevSource = stored.split('::')[1] ?? null
  if (prevSource === null) return null
  const currentSource = getActiveBenchmarkSourceId()
  if (prevSource === currentSource) return null
  const from = sourceLabelFor(prevSource).toLowerCase()
  const to   = sourceLabelFor(currentSource).toLowerCase()
  return `Benchmark source changed from ${from} to ${to} — reference ranges may differ.`
}

// ---------------------------------------------------------------------------
// Source change summary (structured)
// ---------------------------------------------------------------------------

export type BenchmarkSourceSummary = {
  /** Human-readable label for the currently active source */
  currentLabel: string
  /** Human-readable label for the previously active source, or null if unchanged */
  previousLabel: string | null
  /** True when the curated source failed to load and built-in is used instead */
  fallbackActive: boolean
}

/**
 * Returns a structured summary of the current benchmark source state.
 * Call this before checkBenchmarkChanged() / dismissBenchmarkAlert() so the
 * previous fingerprint is still available.
 *
 * Returns null on the server (SSR-safe).
 */
/**
 * Returns a short interpretive note explaining the potential impact of a
 * benchmark source change on stored rank data.
 *
 * Only meaningful when prior snapshots exist — without them there is no
 * historical comparison affected. Returns null otherwise.
 *
 * Wording is intentionally cautious: no numerical causality implied.
 */
export function getBenchmarkSourceImpactNote(hasPriorSnapshots: boolean): string | null {
  if (!hasPriorSnapshots) return null
  return 'Prior snapshots used different reference ranges — direct comparisons may not be exact.'
}

export function getBenchmarkSourceSummary(fallbackActive: boolean): BenchmarkSourceSummary | null {
  if (typeof window === 'undefined') return null
  const currentSource = getActiveBenchmarkSourceId()
  const currentLabel = sourceLabelFor(currentSource)

  let previousLabel: string | null = null
  const stored = readScalar(LS_KEY)
  if (stored !== null) {
    const prevSource = stored.split('::')[1] ?? null
    if (prevSource !== null && prevSource !== currentSource) {
      previousLabel = sourceLabelFor(prevSource)
    }
  }

  return { currentLabel, previousLabel, fallbackActive }
}

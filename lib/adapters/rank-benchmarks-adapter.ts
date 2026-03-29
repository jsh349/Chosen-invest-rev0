import type { BenchmarkBucket } from '@/lib/types/rank'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { validateBenchmarkFile, parseBenchmarkFile } from '@/lib/utils/benchmark-import'
import { runBenchmarkQA } from '@/lib/utils/benchmark-qa'
import {
  OVERALL_WEALTH_BUCKETS,
  AGE_BASED_BUCKETS,
  AGE_GENDER_BUCKETS,
  RETURN_BUCKETS,
  BENCHMARK_META,
} from '@/lib/mock/rank-benchmarks'
import { CURATED_BENCHMARK_FILE } from '@/lib/mock/rank-benchmarks-curated'
import { getLastAppliedBenchmark } from '@/lib/utils/benchmark-refresh'

/** Read-only interface for rank benchmark data. Swap implementation for a real data source later. */
export type RankBenchmarksAdapter = {
  getOverallWealthBenchmarks(): BenchmarkBucket[]
  getAgeBenchmarks(): BenchmarkBucket[]
  getAgeGenderBenchmarks(): BenchmarkBucket[]
  getReturnBenchmarks(): BenchmarkBucket[]
}

// ---------------------------------------------------------------------------
// Source selection — internal, not part of exported user data
// ---------------------------------------------------------------------------

import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { recordBenchmarkSourceSwitch } from '@/lib/utils/benchmark-source-history'

const BENCHMARK_SOURCE_LS_KEY = STORAGE_KEYS.benchmarkSource

export type BenchmarkSource = {
  id: 'default' | 'curated'
  label: string
}

/**
 * Returns available benchmark sources.
 * If CURATED_BENCHMARK_FILE is null or invalid, only the built-in source is returned.
 * When there is only one source, the UI should stay hidden.
 */
export function getAvailableBenchmarkSources(): BenchmarkSource[] {
  const sources: BenchmarkSource[] = [
    { id: 'default', label: 'Built-in (US reference)' },
  ]
  if (CURATED_BENCHMARK_FILE !== null) {
    const validationError = validateBenchmarkFile(CURATED_BENCHMARK_FILE)
    if (!validationError) {
      sources.push({
        id: 'curated',
        label: `Curated — ${CURATED_BENCHMARK_FILE.source} (${CURATED_BENCHMARK_FILE.vintageYear})`,
      })
    }
  }
  return sources
}

/** Reads the stored source preference. Falls back to 'default' safely. */
export function getActiveBenchmarkSourceId(): BenchmarkSource['id'] {
  if (typeof window === 'undefined') return 'default'
  try {
    const stored = window.localStorage.getItem(BENCHMARK_SOURCE_LS_KEY)
    return stored === 'curated' ? 'curated' : 'default'
  } catch {
    return 'default'
  }
}

/** Persists the source preference. Call window.location.reload() after to apply. */
export function setActiveBenchmarkSourceId(id: BenchmarkSource['id']): void {
  if (typeof window === 'undefined') return
  try {
    const prevId = getActiveBenchmarkSourceId()
    if (id === 'default') {
      window.localStorage.removeItem(BENCHMARK_SOURCE_LS_KEY)
    } else {
      window.localStorage.setItem(BENCHMARK_SOURCE_LS_KEY, id)
    }
    recordBenchmarkSourceSwitch(prevId, id)
  } catch { /* ignore quota / security errors */ }
}

// ---------------------------------------------------------------------------
// Adapter resolution
// ---------------------------------------------------------------------------

function buildDefaultAdapter(): RankBenchmarksAdapter {
  return {
    getOverallWealthBenchmarks: () => OVERALL_WEALTH_BUCKETS,
    getAgeBenchmarks:           () => AGE_BASED_BUCKETS,
    getAgeGenderBenchmarks:     () => AGE_GENDER_BUCKETS,
    getReturnBenchmarks:        () => RETURN_BUCKETS,
  }
}

/**
 * Resolve the active adapter once at module load.
 * Respects the stored source preference; falls back to built-in defaults
 * when the curated file is absent, invalid, fails QA, or throws during parsing.
 * Logs a console.warn for each fallback path so issues are visible in devtools.
 */
function resolveAdapter(): RankBenchmarksAdapter {
  const pref = getActiveBenchmarkSourceId()

  if (pref === 'curated') {
    if (CURATED_BENCHMARK_FILE === null) {
      console.warn('[BenchmarkAdapter] Curated source selected but file is not available. Using built-in defaults.')
    } else {
      const validationError = validateBenchmarkFile(CURATED_BENCHMARK_FILE)
      if (validationError) {
        console.warn(`[BenchmarkAdapter] Curated file failed validation (${validationError}). Using built-in defaults.`)
      } else {
        try {
          const buckets = parseBenchmarkFile(CURATED_BENCHMARK_FILE)
          const qaIssues = runBenchmarkQA(buckets, { silent: process.env.NODE_ENV === 'test' })
          if (qaIssues > 0) {
            console.warn(`[BenchmarkAdapter] Curated file failed QA (${qaIssues} issue(s)). Using built-in defaults.`)
          } else {
            return {
              getOverallWealthBenchmarks: () => buckets.overallWealth,
              getAgeBenchmarks:           () => buckets.ageBased,
              getAgeGenderBenchmarks:     () => buckets.ageGender,
              getReturnBenchmarks:        () => buckets.investmentReturn,
            }
          }
        } catch (err) {
          console.warn('[BenchmarkAdapter] Failed to parse curated file. Using built-in defaults.', err)
        }
      }
    }
    // Curated was requested but could not be loaded — flag the fallback
    _isUsingFallback = true
  }

  return buildDefaultAdapter()
}

// ---------------------------------------------------------------------------
// Fallback indicator
// ---------------------------------------------------------------------------

/**
 * Set to true when the user's preferred source ('curated') could not be loaded
 * and the adapter fell back to built-in defaults.
 * Remains false when the default source is the intentional preference.
 */
let _isUsingFallback = false

/**
 * Returns true when the active adapter is using built-in default benchmark data
 * despite the user having selected the 'curated' source.
 *
 * Useful for displaying a transparency note in the rank UI.
 * Always returns false on the server (SSR-safe).
 */
export function isUsingFallbackBenchmark(): boolean {
  return _isUsingFallback
}

/**
 * Returns the version identifier and reference date for the currently active
 * benchmark source. Used by change-alert fingerprinting and version notes.
 *
 * - default source:  reflects BENCHMARK_META (built-in)
 * - other sources:   reflects the last applied BenchmarkFile record,
 *                    falling back to BENCHMARK_META when no record exists yet
 *
 * Always returns a valid object — never throws.
 */
export function getActiveBenchmarkMeta(): { version: string; updatedAt: string } {
  const sourceId = getActiveBenchmarkSourceId()
  if (sourceId === 'default') {
    return { version: BENCHMARK_META.version, updatedAt: BENCHMARK_META.updatedAt }
  }
  const lastApplied = getLastAppliedBenchmark()
  if (lastApplied) {
    return {
      version:   `${lastApplied.source} (${lastApplied.vintageYear})`,
      updatedAt: lastApplied.appliedAt.slice(0, 10),
    }
  }
  return { version: BENCHMARK_META.version, updatedAt: BENCHMARK_META.updatedAt }
}

/** Active adapter — resolved from stored preference at module load. */
export const rankBenchmarksAdapter: RankBenchmarksAdapter = resolveAdapter()

// One-time QA check at module load. Logs console.warn for any malformed bucket.
// Never blocks; silent in test environments.
runBenchmarkQA({
  overallWealth:    rankBenchmarksAdapter.getOverallWealthBenchmarks(),
  ageBased:         rankBenchmarksAdapter.getAgeBenchmarks(),
  ageGender:        rankBenchmarksAdapter.getAgeGenderBenchmarks(),
  investmentReturn: rankBenchmarksAdapter.getReturnBenchmarks(),
}, { silent: process.env.NODE_ENV === 'test' })

/**
 * Creates a RankBenchmarksAdapter from a validated BenchmarkFile.
 * Call validateBenchmarkFile() first to confirm the file is well-formed.
 *
 * Runs a non-blocking QA pass; logs console.warn for any semantic issues found
 * but still returns the adapter (caller has already confirmed structural validity).
 * Falls back to built-in defaults if parsing throws unexpectedly.
 */
export function rankBenchmarksAdapterFromFile(file: BenchmarkFile): RankBenchmarksAdapter {
  try {
    const buckets = parseBenchmarkFile(file)
    runBenchmarkQA(buckets, { silent: process.env.NODE_ENV === 'test' })
    return {
      getOverallWealthBenchmarks: () => buckets.overallWealth,
      getAgeBenchmarks:           () => buckets.ageBased,
      getAgeGenderBenchmarks:     () => buckets.ageGender,
      getReturnBenchmarks:        () => buckets.investmentReturn,
    }
  } catch (err) {
    console.warn('[BenchmarkAdapter] rankBenchmarksAdapterFromFile: failed to parse file. Falling back to defaults.', err)
    return buildDefaultAdapter()
  }
}

import type { BenchmarkBucket } from '@/lib/types/rank'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { validateBenchmarkFile, parseBenchmarkFile } from '@/lib/utils/benchmark-import'
import {
  OVERALL_WEALTH_BUCKETS,
  AGE_BASED_BUCKETS,
  AGE_GENDER_BUCKETS,
  RETURN_BUCKETS,
} from '@/lib/mock/rank-benchmarks'
import { CURATED_BENCHMARK_FILE } from '@/lib/mock/rank-benchmarks-curated'

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

const BENCHMARK_SOURCE_LS_KEY = 'chosen_benchmark_source_v1'

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
  if (CURATED_BENCHMARK_FILE !== null && !validateBenchmarkFile(CURATED_BENCHMARK_FILE)) {
    sources.push({
      id: 'curated',
      label: `Curated — ${CURATED_BENCHMARK_FILE.source} (${CURATED_BENCHMARK_FILE.vintageYear})`,
    })
  }
  return sources
}

/** Reads the stored source preference. Falls back to 'default' safely. */
export function getActiveBenchmarkSourceId(): BenchmarkSource['id'] {
  if (typeof window === 'undefined') return 'default'
  try {
    const stored = localStorage.getItem(BENCHMARK_SOURCE_LS_KEY)
    return stored === 'curated' ? 'curated' : 'default'
  } catch {
    return 'default'
  }
}

/** Persists the source preference. Call window.location.reload() after to apply. */
export function setActiveBenchmarkSourceId(id: BenchmarkSource['id']): void {
  if (typeof window === 'undefined') return
  try {
    if (id === 'default') {
      localStorage.removeItem(BENCHMARK_SOURCE_LS_KEY)
    } else {
      localStorage.setItem(BENCHMARK_SOURCE_LS_KEY, id)
    }
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
 * when the curated file is absent, invalid, or the preference is unset.
 */
function resolveAdapter(): RankBenchmarksAdapter {
  const pref = getActiveBenchmarkSourceId()
  if (pref === 'curated' && CURATED_BENCHMARK_FILE !== null) {
    const error = validateBenchmarkFile(CURATED_BENCHMARK_FILE)
    if (!error) {
      const buckets = parseBenchmarkFile(CURATED_BENCHMARK_FILE)
      return {
        getOverallWealthBenchmarks: () => buckets.overallWealth,
        getAgeBenchmarks:           () => buckets.ageBased,
        getAgeGenderBenchmarks:     () => buckets.ageGender,
        getReturnBenchmarks:        () => buckets.investmentReturn,
      }
    }
  }
  return buildDefaultAdapter()
}

/** Active adapter — resolved from stored preference at module load. */
export const rankBenchmarksAdapter: RankBenchmarksAdapter = resolveAdapter()

/**
 * Creates a RankBenchmarksAdapter from a validated BenchmarkFile.
 * Call validateBenchmarkFile() first to confirm the file is well-formed.
 */
export function rankBenchmarksAdapterFromFile(file: BenchmarkFile): RankBenchmarksAdapter {
  const buckets = parseBenchmarkFile(file)
  return {
    getOverallWealthBenchmarks: () => buckets.overallWealth,
    getAgeBenchmarks:           () => buckets.ageBased,
    getAgeGenderBenchmarks:     () => buckets.ageGender,
    getReturnBenchmarks:        () => buckets.investmentReturn,
  }
}

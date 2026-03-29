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

/**
 * Resolve the active adapter once at module load.
 * Uses the curated file if present and valid; falls back to the built-in defaults.
 */
function resolveAdapter(): RankBenchmarksAdapter {
  if (CURATED_BENCHMARK_FILE !== null) {
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
  // Default: built-in mock benchmark data
  return {
    getOverallWealthBenchmarks: () => OVERALL_WEALTH_BUCKETS,
    getAgeBenchmarks:           () => AGE_BASED_BUCKETS,
    getAgeGenderBenchmarks:     () => AGE_GENDER_BUCKETS,
    getReturnBenchmarks:        () => RETURN_BUCKETS,
  }
}

/** Active adapter — curated file if valid, otherwise built-in defaults. */
export const rankBenchmarksAdapter: RankBenchmarksAdapter = resolveAdapter()

/**
 * Creates a RankBenchmarksAdapter from a validated BenchmarkFile.
 * Call validateBenchmarkFile() first to confirm the file is well-formed.
 *
 * Usage:
 *   const error = validateBenchmarkFile(json)
 *   if (!error) setAdapter(rankBenchmarksAdapterFromFile(json as BenchmarkFile))
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

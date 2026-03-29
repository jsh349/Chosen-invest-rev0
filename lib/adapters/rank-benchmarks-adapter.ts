import type { BenchmarkBucket } from '@/lib/types/rank'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { parseBenchmarkFile } from '@/lib/utils/benchmark-import'
import {
  OVERALL_WEALTH_BUCKETS,
  AGE_BASED_BUCKETS,
  AGE_GENDER_BUCKETS,
  RETURN_BUCKETS,
} from '@/lib/mock/rank-benchmarks'

/** Read-only interface for rank benchmark data. Swap implementation for a real data source later. */
export type RankBenchmarksAdapter = {
  getOverallWealthBenchmarks(): BenchmarkBucket[]
  getAgeBenchmarks(): BenchmarkBucket[]
  getAgeGenderBenchmarks(): BenchmarkBucket[]
  getReturnBenchmarks(): BenchmarkBucket[]
}

/** Local implementation backed by mock benchmark data. */
export const rankBenchmarksAdapter: RankBenchmarksAdapter = {
  getOverallWealthBenchmarks: () => OVERALL_WEALTH_BUCKETS,
  getAgeBenchmarks:           () => AGE_BASED_BUCKETS,
  getAgeGenderBenchmarks:     () => AGE_GENDER_BUCKETS,
  getReturnBenchmarks:        () => RETURN_BUCKETS,
}

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

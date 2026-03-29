import type { BenchmarkBucket } from '@/lib/types/rank'
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

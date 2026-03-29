import type { RankBenchmarksAdapter } from '@/lib/adapters/rank-benchmarks-adapter'
import {
  OVERALL_WEALTH_BUCKETS,
  AGE_BASED_BUCKETS,
  AGE_GENDER_BUCKETS,
  RETURN_BUCKETS,
} from '@/lib/mock/rank-benchmarks'

/**
 * Connection status of the external benchmark adapter.
 *   'not_connected' — stub only; no real source is configured.
 *   'connected'     — (future) a live source URL and fetch mechanism are in place.
 */
export type ExternalAdapterStatus = 'not_connected' | 'connected'

/**
 * Current status. Read this before trusting data from externalBenchmarkAdapter.
 * Change to 'connected' only when a real ExternalBenchmarkPayload pipeline exists.
 */
export const externalAdapterStatus: ExternalAdapterStatus = 'not_connected'

/**
 * Stub implementation of RankBenchmarksAdapter for a future external data source.
 *
 * Currently falls back to built-in local data — identical to the default adapter.
 * No network calls are made. This is a preparation layer only.
 *
 * To activate with real data:
 *   1. Fetch an ExternalBenchmarkPayload (validateExternalPayload → externalPayloadToFile)
 *   2. Pass the resulting BenchmarkFile to rankBenchmarksAdapterFromFile()
 *   3. Replace the fallback returns below with calls to that adapter's methods
 *   4. Set externalAdapterStatus to 'connected'
 *   5. Wire this into resolveAdapter() in rank-benchmarks-adapter.ts
 */
export const externalBenchmarkAdapter: RankBenchmarksAdapter = {
  getOverallWealthBenchmarks: () => OVERALL_WEALTH_BUCKETS,
  getAgeBenchmarks:           () => AGE_BASED_BUCKETS,
  getAgeGenderBenchmarks:     () => AGE_GENDER_BUCKETS,
  getReturnBenchmarks:        () => RETURN_BUCKETS,
}

/**
 * Canonical precedence order for benchmark source resolution — highest priority first.
 *
 * curated   — explicitly validated local file; preferred over built-in when available
 * external  — future live data source (currently a not_connected stub)
 * default   — built-in local data; always available as the final fallback
 *
 * resolveAdapter() in rank-benchmarks-adapter.ts follows this order.
 * When a higher-priority source is unavailable or fails validation,
 * resolution continues down the list until 'default' is reached.
 */
export const BENCHMARK_SOURCE_PRECEDENCE = ['curated', 'external', 'default'] as const

export type KnownBenchmarkSourceId = typeof BENCHMARK_SOURCE_PRECEDENCE[number]

/**
 * Returns true when id is a recognised source in the precedence list.
 * Use this to guard unknown values read from localStorage or external input.
 */
export function isKnownSourceId(id: string): id is KnownBenchmarkSourceId {
  return (BENCHMARK_SOURCE_PRECEDENCE as readonly string[]).includes(id)
}

/**
 * Returns the precedence rank of a source — lower number means higher priority.
 * Returns Infinity for any unrecognised id so it always loses to known sources.
 */
export function sourcePrecedenceRank(id: string): number {
  const idx = (BENCHMARK_SOURCE_PRECEDENCE as readonly string[]).indexOf(id)
  return idx === -1 ? Infinity : idx
}

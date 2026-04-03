import type { BenchmarkHealthStatus } from '@/lib/utils/benchmark-health'

export type RankConfidenceLevel = 'low' | 'moderate'

export type RankConfidenceNote = {
  text:  string
  /**
   * Severity tier for the confidence concern.
   * Reserved for future UI treatment differentiation (e.g. colour, icon, or
   * prominence adjustments per tier when external benchmark sources arrive).
   * Currently only `text` is consumed at runtime — callers use `.text` directly.
   * Do not remove: the field is tested and intended for future consumer use.
   */
  level: RankConfidenceLevel
}

/**
 * Returns a single concise, non-technical note about rank data trustworthiness
 * when a concern exists — or null when everything is healthy.
 *
 * Takes only benchmarkHealthStatus — isUsingFallback is intentionally omitted.
 * getBenchmarkHealthStatus() always produces status 'fallback' when isUsingFallback
 * is true, so the health status alone encodes both signals; passing both would
 * create an implicit contract that callers must keep in sync.
 *
 * Priority order (first match wins — one note at a time):
 *   1. status 'fallback' → level 'moderate' (preferred source failed to load)
 *   2. status 'invalid'  → level 'low'    (source not yet connected)
 *   3. status 'partial'  → level 'moderate' (some rank categories unsupported)
 *   4. status 'healthy'  → null           (no concern to surface)
 */
export function getRankConfidenceNote(params: {
  benchmarkHealthStatus: BenchmarkHealthStatus
}): RankConfidenceNote | null {
  const { benchmarkHealthStatus } = params

  if (benchmarkHealthStatus === 'fallback') {
    return {
      text:  'Preferred source unavailable — using built-in ranges.',
      level: 'moderate',
    }
  }

  if (benchmarkHealthStatus === 'invalid') {
    return {
      text:  'Selected source not yet available — using built-in ranges.',
      level: 'low',
    }
  }

  if (benchmarkHealthStatus === 'partial') {
    return {
      text:  'Some rank categories unavailable from this source.',
      level: 'moderate',
    }
  }

  return null
}

import type { BenchmarkHealthStatus } from '@/lib/utils/benchmark-health'

export type RankConfidenceLevel = 'low' | 'moderate'

export type RankConfidenceNote = {
  text:  string
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
 *   1. status 'fallback' → level 'low'    (preferred source failed to load)
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
      text:  'Preferred source unavailable — using built-in reference ranges.',
      level: 'moderate',
    }
  }

  if (benchmarkHealthStatus === 'invalid') {
    return {
      text:  'Selected source not yet connected — using built-in reference ranges.',
      level: 'low',
    }
  }

  if (benchmarkHealthStatus === 'partial') {
    return {
      text:  'Some rank categories are unavailable from the active source.',
      level: 'moderate',
    }
  }

  return null
}

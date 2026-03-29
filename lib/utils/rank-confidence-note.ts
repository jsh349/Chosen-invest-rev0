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
 * Based entirely on existing signals: benchmark fallback usage and health status.
 * Priority order (first match wins — one note at a time):
 *   1. fallback active → level 'low'      (preferred source failed to load)
 *   2. status 'invalid' → level 'low'     (source is a stub, no real data)
 *   3. status 'partial' → level 'moderate' (some rank categories unsupported)
 *   4. status 'healthy' → null            (no concern to surface)
 */
export function getRankConfidenceNote(params: {
  isUsingFallback:       boolean
  benchmarkHealthStatus: BenchmarkHealthStatus
}): RankConfidenceNote | null {
  const { isUsingFallback, benchmarkHealthStatus } = params

  if (isUsingFallback || benchmarkHealthStatus === 'fallback') {
    return {
      text:  'Using built-in reference data — your preferred benchmark source could not be loaded.',
      level: 'low',
    }
  }

  if (benchmarkHealthStatus === 'invalid') {
    return {
      text:  'This benchmark source is a placeholder — rank comparisons use built-in reference data.',
      level: 'low',
    }
  }

  if (benchmarkHealthStatus === 'partial') {
    return {
      text:  'Some rank categories are not available from the active benchmark source.',
      level: 'moderate',
    }
  }

  return null
}

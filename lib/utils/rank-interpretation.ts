/**
 * Maps a percentile to a short, calm interpretation sentence.
 *
 * Distinct from percentileBandLabel (which gives a factual tier label) —
 * this provides a one-line contextual reading of what the score means
 * relative to the benchmark median.
 *
 * @param percentile      The user's percentile score (0–100).
 * @param isLowConfidence When true (fallback / invalid benchmark source), the
 *   comparison point is described as "reference estimate" rather than
 *   "benchmark median" to avoid implying a precision the source cannot deliver.
 */
export function getRankInterpretation(percentile: number, isLowConfidence = false): string {
  const comparison = 'benchmark median'
  if (percentile >= 75) return `Well above the ${comparison}.`
  if (percentile >= 50) return `Above the ${comparison}.`
  if (percentile >= 40) return `Near the ${comparison}.`
  if (percentile >= 25) return `Below the ${comparison}.`
  return `Well below the ${comparison}.`
}

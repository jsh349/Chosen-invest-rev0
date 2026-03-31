/**
 * Maps a percentile to a short, calm interpretation sentence.
 *
 * Distinct from percentileBandLabel (which gives a factual tier label) —
 * this provides a one-line contextual reading of what the score means
 * relative to the benchmark median.
 *
 * @param percentile  The user's percentile score (0–100).
 */
export function getRankInterpretation(percentile: number): string {
  if (percentile >= 75) return 'Compares favorably against the reference group.'
  if (percentile >= 50) return 'Above the benchmark median.'
  if (percentile >= 40) return 'Near the benchmark median.'
  if (percentile >= 25) return 'Below the benchmark median.'
  return 'In the lower range of the reference group.'
}

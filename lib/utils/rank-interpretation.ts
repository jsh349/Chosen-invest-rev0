/**
 * Maps a percentile to a short, calm interpretation sentence.
 *
 * Distinct from percentileBandLabel (which gives a factual tier label) —
 * this provides a one-line contextual reading of what the score means
 * relative to the benchmark midpoint.
 *
 * @param percentile      The user's percentile score (0–100).
 * @param isLowConfidence When true (fallback or invalid benchmark source),
 *   the two extreme bands ("Well above" / "Well below") are softened to
 *   "Likely above" / "Likely below" — reflecting that the degraded source
 *   does not support assertive precision at the extremes. Middle bands are
 *   unchanged; they already use measured language. The primary confidence
 *   caveat is still communicated by getRankConfidenceNote in the chip strip.
 */
export function getRankInterpretation(percentile: number, isLowConfidence = false): string {
  if (percentile >= 75) return isLowConfidence ? 'Likely above the benchmark median.' : 'Well above the benchmark median.'
  if (percentile >= 50) return 'Above the benchmark median.'
  if (percentile >= 40) return 'Just below the benchmark median.'
  if (percentile >= 25) return 'Below the benchmark median.'
  return isLowConfidence ? 'Likely below the benchmark median.' : 'Well below the benchmark median.'
}

/**
 * Maps a raw percentile score to a clean, professional band label for display.
 * Rounds to statistically meaningful tiers; avoids hype language.
 *
 * @param percentile  The user's percentile (0–100). Higher = wealthier / better return.
 */
export function percentileBandLabel(percentile: number): string {
  if (percentile >= 90) return 'Top 10%'
  if (percentile >= 75) return 'Top 25%'
  if (percentile >= 50) return 'Above median'
  if (percentile >= 40) return 'Around median'
  if (percentile >= 25) return 'Below median'
  return 'Bottom 25%'
}

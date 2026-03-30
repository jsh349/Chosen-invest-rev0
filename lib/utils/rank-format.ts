/**
 * Shared formatting helpers for rank display surfaces.
 *
 * Centralised here so colour thresholds and label logic have one source
 * of truth across rank-report-section, rank-share-card, and rank/page.
 */

/**
 * Converts a percentile score to a "Top X%" label.
 * Returns 'Top <1%' when the user is in the top 1 percentile (score = 100).
 */
export function topPctLabel(percentile: number): string {
  const top = 100 - percentile
  return top === 0 ? '<1%' : `${top}%`
}

/**
 * Returns a Tailwind text-colour class based on percentile band.
 * Thresholds:
 *   >= 75 → emerald  (top quartile)
 *   >= 50 → brand    (above median)
 *   >= 30 → amber    (lower-mid)
 *    < 30 → gray     (lower range)
 */
export function percentileColor(percentile: number): string {
  if (percentile >= 75) return 'text-emerald-400'
  if (percentile >= 50) return 'text-brand-400'
  if (percentile >= 30) return 'text-amber-400'
  return 'text-gray-400'
}

import type { RankResult } from '@/lib/types/rank'
import type { AllocationSlice } from '@/lib/types/dashboard'
import { indexRanks } from '@/lib/utils/rank-index'

/** Top-category share at which holdings are considered concentrated. */
const CONCENTRATION_THRESHOLD = 70

/** Asset categories treated as high-volatility for concentration warnings. */
const VOLATILE_CATEGORIES = new Set(['crypto', 'stock'])

/**
 * Returns one short insight when rank data and allocation state can be
 * meaningfully compared, or null when conditions are not met.
 *
 * Rules are evaluated in priority order; the first match wins.
 *
 * Rule 1 — Strong wealth rank but concentrated allocation:
 *   overall >= 75 AND top category >= CONCENTRATION_THRESHOLD
 *
 * Rule 2 — Weak return rank with undiversified allocation:
 *   return available AND < 40 AND only one category present
 *
 * Rule 3 — Strong return rank concentrated in a volatile category:
 *   return >= 75 AND top category is volatile AND >= CONCENTRATION_THRESHOLD
 */
export function getRankAllocationInsight(
  ranks: RankResult[],
  categoryBreakdown: AllocationSlice[],
): string | null {
  if (categoryBreakdown.length === 0) return null

  const { overall, ret } = indexRanks(ranks)
  const overallPct = overall?.percentile ?? null
  const retPct     = ret?.percentile     ?? null
  const top        = categoryBreakdown[0]

  // Rule 1: strong wealth rank but concentrated
  if (overallPct !== null && overallPct >= 75 && top.percentage >= CONCENTRATION_THRESHOLD) {
    return `Overall wealth rank is strong, but holdings are concentrated in ${top.label}.`
  }

  // Rule 2: weak return rank with single category
  if (retPct !== null && retPct < 40 && categoryBreakdown.length === 1) {
    return `Return rank is below the benchmark median with holdings in a single category.`
  }

  // Rule 3: strong return rank concentrated in a volatile category
  if (
    retPct !== null &&
    retPct >= 75 &&
    VOLATILE_CATEGORIES.has(top.category) &&
    top.percentage >= CONCENTRATION_THRESHOLD
  ) {
    return `Return rank is strong, though heavy concentration in ${top.label} introduces elevated volatility exposure.`
  }

  return null
}

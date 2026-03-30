import type { RankResult } from '@/lib/types/rank'
import { indexRanks } from '@/lib/utils/rank-index'

/** Minimum percentile point gap treated as a "meaningful difference" between rank types. */
export const RANK_GAP_THRESHOLD = 20

/**
 * Compares available rank outputs and returns one short, deterministic insight
 * when a meaningful gap or profile gap is detected. Returns null otherwise.
 *
 * Rules are evaluated in priority order; the first match wins.
 */
export function getRankInsight(ranks: RankResult[]): string | null {
  const { overall, ret, ageBased, ageGender } = indexRanks(ranks)

  const overallPct = overall?.percentile ?? null
  const retPct     = ret?.percentile     ?? null

  // Rule 1: wealth rank significantly stronger than return rank
  if (overallPct !== null && retPct !== null && overallPct - retPct >= RANK_GAP_THRESHOLD) {
    return 'Wealth rank is higher than investment return rank. Your return estimate may be conservative relative to your accumulated position.'
  }

  // Rule 2: return rank significantly stronger than wealth rank
  if (overallPct !== null && retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD) {
    return 'Return rank is higher than overall wealth rank. Sustained returns at this rate could improve wealth position over time.'
  }

  // Rule 3: wealth rank available but age comparison missing (birth year not set)
  if (overallPct !== null && ageBased?.missingField === 'birth year') {
    return 'Peer group comparison is unavailable — add birth year in Settings to see how your wealth compares within your age group.'
  }

  // Rule 4: age rank available but gender comparison missing
  if (overallPct !== null && ageBased?.percentile != null && ageGender?.missingField) {
    return 'Age and gender comparison is unavailable — add gender in Settings for a more specific peer group ranking.'
  }

  return null
}

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
    return 'Overall wealth rank is stronger than return rank.'
  }

  // Rule 2: return rank significantly stronger than wealth rank
  if (overallPct !== null && retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD) {
    return 'Return rank is stronger than overall wealth rank.'
  }

  return null
}

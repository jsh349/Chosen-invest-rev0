import type { RankResult, RankType } from '@/lib/types/rank'

/**
 * Canonical priority order for rank outputs.
 * Earlier entries are more broadly applicable and should be emphasised first
 * in summary contexts. Later entries are more specific or optional.
 *
 *   1. overall_wealth   — always computed; broadest comparison group
 *   2. age_based        — age-filtered; more specific than overall
 *   3. age_gender       — age + gender filtered; most specific wealth rank
 *   4. investment_return — separate dimension (return %, not wealth level)
 */
export const RANK_PRIORITY_ORDER: readonly RankType[] = [
  'overall_wealth',
  'age_based',
  'age_gender',
  'investment_return',
]

/**
 * Returns the highest-priority RankResult that has a real percentile value.
 *
 * Useful for summary contexts that need a single "lead" rank without
 * re-implementing the priority order.
 *
 * Returns null when no rank in the array has a non-null percentile.
 */
export function getPrimaryRank(ranks: RankResult[]): RankResult | null {
  for (const type of RANK_PRIORITY_ORDER) {
    const match = ranks.find((r) => r.type === type && r.percentile !== null)
    if (match) return match
  }
  return null
}

/**
 * Returns the ranks array sorted by RANK_PRIORITY_ORDER.
 * Ranks not present in the priority list are appended at the end.
 * Does not mutate the input array.
 */
export function sortRanksByPriority(ranks: RankResult[]): RankResult[] {
  return [...ranks].sort((a, b) => {
    const ai = RANK_PRIORITY_ORDER.indexOf(a.type)
    const bi = RANK_PRIORITY_ORDER.indexOf(b.type)
    const aIdx = ai === -1 ? RANK_PRIORITY_ORDER.length : ai
    const bIdx = bi === -1 ? RANK_PRIORITY_ORDER.length : bi
    return aIdx - bIdx
  })
}

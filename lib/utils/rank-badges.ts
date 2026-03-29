import type { RankResult } from '@/lib/types/rank'
import { indexRanks } from '@/lib/utils/rank-index'

export type RankBadge = {
  id: string
  label: string
  /** One-line context shown as a tooltip / subtitle */
  description: string
}

/**
 * Returns the rank badges earned from a set of RankResult objects.
 * At most one badge per category (highest tier wins within each).
 * Returns an empty array when data is insufficient.
 */
export function getRankBadges(ranks: RankResult[]): RankBadge[] {
  const earned: RankBadge[] = []

  const { overall: overallResult, ageBased, ret: retResult } = indexRanks(ranks)
  const overall = overallResult?.percentile ?? null
  const age     = ageBased?.percentile      ?? null
  const ret     = retResult?.percentile     ?? null

  // Overall wealth — highest tier only
  if (overall !== null) {
    if (overall >= 90) {
      earned.push({ id: 'top_10_overall', label: 'Top 10% Overall', description: 'Overall wealth above the 90th percentile benchmark.' })
    } else if (overall >= 75) {
      earned.push({ id: 'top_25_overall', label: 'Top 25% Overall', description: 'Overall wealth above the 75th percentile benchmark.' })
    } else if (overall >= 50) {
      earned.push({ id: 'top_50_overall', label: 'Top 50% Overall', description: 'Overall wealth above the median benchmark.' })
    }
  }

  // Age-based — highest tier only
  if (age !== null) {
    if (age >= 90) {
      earned.push({ id: 'top_10_age', label: 'Top 10% by Age', description: 'Wealth above the 90th percentile for this age group.' })
    } else if (age >= 75) {
      earned.push({ id: 'top_25_age', label: 'Top 25% by Age', description: 'Wealth above the 75th percentile for this age group.' })
    }
  }

  // Investment return — single tier
  if (ret !== null && ret >= 75) {
    earned.push({ id: 'strong_return', label: 'Strong Return', description: 'Estimated annual return above the 75th percentile benchmark.' })
  }

  return earned
}

import type { RankResult } from '@/lib/types/rank'
import type { Goal } from '@/lib/types/goal'
import { indexRanks } from '@/lib/utils/rank-index'

/**
 * Returns one short insight string bridging rank context and goals,
 * or null if no meaningful comparison can be made.
 * Rules fire in priority order; first match wins.
 */
export function getRankGoalInsight(ranks: RankResult[], goals: Goal[]): string | null {
  const { overall, ret } = indexRanks(ranks)
  const overallPct  = overall?.percentile ?? null
  const returnPct   = ret?.percentile     ?? null

  // Rule 1: strong wealth rank but no goals set
  if (overallPct !== null && overallPct >= 75 && goals.length === 0) {
    return 'Overall wealth rank is strong, but no financial goals are set.'
  }

  // Rule 2: moderate+ wealth rank, goals exist but none have a target date
  if (
    overallPct !== null &&
    overallPct >= 40 &&
    goals.length > 0 &&
    goals.every((g) => !g.targetDate)
  ) {
    return 'You have goals set, but none have a target date.'
  }

  // Rule 3: strong return rank but no investment or retirement goals
  if (
    returnPct !== null &&
    returnPct >= 75 &&
    !goals.some((g) => g.type === 'investment' || g.type === 'retirement')
  ) {
    return 'Your return rank is strong — no investment or retirement goal is set.'
  }

  return null
}

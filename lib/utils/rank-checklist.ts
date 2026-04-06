import type { RankResult } from '@/lib/types/rank'
import { ROUTES } from '@/lib/constants/routes'
import { indexRanks } from '@/lib/utils/rank-index'

export type RankChecklistItem = {
  text: string
  href: string
}

/** Maximum number of items returned. */
const MAX_ITEMS = 4

/**
 * Returns a compact list of the most relevant actions for improving rank insight
 * quality. Returns an empty array when nothing is missing — callers should render
 * nothing in that case.
 *
 * Items are collected in priority order and capped at MAX_ITEMS (4).
 *
 * Priority:
 *   1. Missing birth year   → age-based comparison unavailable
 *   2. Missing gender       → age + gender comparison unavailable
 *   3. Missing return input → investment return rank unavailable
 *   4. Wealth rank < 40     → allocation may warrant review
 *   5. No goals defined     → rank-goal bridge has no context
 */
export function getRankChecklist(
  profile: {
    hasAge:    boolean
    hasGender: boolean
    hasReturn: boolean
    hasGoals:  boolean
  },
  ranks: RankResult[],
): RankChecklistItem[] {
  const items: RankChecklistItem[] = []

  if (!profile.hasAge) {
    items.push({ text: 'Add birth year for age-based comparison', href: ROUTES.settings })
  }
  if (!profile.hasGender) {
    items.push({ text: 'Add gender for age and gender comparison', href: ROUTES.settings })
  }
  if (!profile.hasReturn) {
    items.push({ text: 'Add return estimate for return rank', href: ROUTES.settings })
  }

  // Allocation review — only when age context is available, so the rank signal
  // is demographic-adjusted and more reliable as a portfolio review trigger.
  // Without age, the overall rank may shift significantly once profile is complete.
  const { overall } = indexRanks(ranks)
  if (
    profile.hasAge &&
    overall?.percentile !== null && overall?.percentile !== undefined &&
    overall.percentile < 40
  ) {
    items.push({ text: 'Adjust portfolio allocation', href: ROUTES.portfolioList })
  }

  if (!profile.hasGoals) {
    items.push({ text: 'Set a financial goal', href: ROUTES.goals })
  }

  return items.slice(0, MAX_ITEMS)
}

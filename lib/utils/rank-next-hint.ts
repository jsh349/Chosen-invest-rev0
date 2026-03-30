import type { RankResult } from '@/lib/types/rank'
import { ROUTES } from '@/lib/constants/routes'

export type RankHint = {
  text: string
  href: string
}

/**
 * Returns the single most relevant next-step hint for improving rank completeness.
 * Priority order: age → gender → return estimate → null (all inputs present).
 *
 * @param profile.hasAge    - true when birth year is set in Settings
 * @param profile.hasGender - true when gender is set in Settings
 * @param profile.hasReturn - true when annual return estimate is set in Settings
 */
export function getNextRankHint(profile: {
  hasAge:    boolean
  hasGender: boolean
  hasReturn: boolean
}): RankHint | null {
  if (!profile.hasAge) {
    return {
      text: 'Add your birth year in Settings to unlock age-based rank comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasGender) {
    return {
      text: 'Add your gender in Settings for a more detailed age and gender comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasReturn) {
    return {
      text: 'Add an estimated annual return in Settings to unlock investment rank.',
      href: ROUTES.settings,
    }
  }
  return null
}

/**
 * Returns the single highest-priority next action for compact rank report
 * surfaces. Extends getNextRankHint with engagement-level fallbacks when
 * the profile is already complete.
 *
 * Priority order matches getRankChecklist:
 *   1. Missing age    → Settings
 *   2. Missing gender → Settings
 *   3. Missing return → Settings
 *   4. No goals set   → Goals
 *   5. Low wealth rank (< 40th percentile) → Portfolio
 *
 * Returns null when no action is needed.
 */
export function getPrimaryRankNextAction(
  profile: { hasAge: boolean; hasGender: boolean; hasReturn: boolean; hasGoals: boolean },
  ranks: RankResult[],
): RankHint | null {
  // Profile completeness hints take priority (existing logic unchanged)
  const profileHint = getNextRankHint(profile)
  if (profileHint !== null) return profileHint

  // No goals set — prompt to define one
  if (!profile.hasGoals) {
    return {
      text: 'Set a financial goal to build on your wealth rank.',
      href: ROUTES.goals,
    }
  }

  // Low wealth rank — suggest portfolio review
  const overall = ranks.find((r) => r.type === 'overall_wealth')
  if (overall?.percentile !== undefined && overall.percentile !== null && overall.percentile < 40) {
    return {
      text: 'Review your portfolio allocation to improve your rank position.',
      href: ROUTES.portfolioList,
    }
  }

  return null
}

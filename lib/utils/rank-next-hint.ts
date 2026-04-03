import type { RankResult } from '@/lib/types/rank'
import { ROUTES } from '@/lib/constants/routes'
import { indexRanks } from '@/lib/utils/rank-index'

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
      text: 'Add your birth year to unlock age-based rank comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasGender) {
    return {
      text: 'Add your gender for a more specific age and gender comparison.',
      href: ROUTES.settings,
    }
  }
  if (!profile.hasReturn) {
    return {
      text: 'Add an estimated annual return to unlock return rank.',
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
 *   4. Low wealth rank (< 40th percentile) → Portfolio
 *   5. No goals set   → Goals
 *
 * @param options.isLowConfidence  When true (fallback or invalid benchmark source):
 *   - Portfolio and goals wording is softened ("Consider..." vs "Review... to improve...").
 *   - Profile hints remove 'unlock' framing: the added rank category will also use
 *     fallback data, so implying it will reliably improve accuracy overstates confidence.
 *
 * Returns null when no action is needed.
 */
export function getPrimaryRankNextAction(
  profile: { hasAge: boolean; hasGender: boolean; hasReturn: boolean; hasGoals: boolean },
  ranks: RankResult[],
  { isLowConfidence = false, mode = 'individual' as 'individual' | 'household' }:
    { isLowConfidence?: boolean; mode?: 'individual' | 'household' } = {},
): RankHint | null {
  // Profile completeness hints — always shown, wording adapts to confidence level.
  // In low-confidence states, 'unlock' framing is removed: the unlocked rank will
  // also use fallback data, so outcome promises are replaced with neutral descriptions.
  if (!profile.hasAge) {
    return {
      href: ROUTES.settings,
      text: isLowConfidence
        ? 'Add your birth year to include age in your comparison.'
        : 'Add your birth year to unlock age-based comparison.',
    }
  }
  if (!profile.hasGender) {
    return {
      href: ROUTES.settings,
      text: isLowConfidence
        ? 'Add your gender for age and gender comparison.'
        : 'Add your gender for a more specific age and gender comparison.',
    }
  }
  if (!profile.hasReturn) {
    return {
      href: ROUTES.settings,
      text: isLowConfidence
        ? 'Add an estimated annual return to include return rank.'
        : 'Add an estimated annual return to unlock return rank.',
    }
  }

  // Low wealth rank — suggest portfolio review (matches getRankChecklist priority).
  // Wording is softened in low-confidence states: the rank itself may shift once
  // the benchmark source is restored, so outcome claims are removed.
  const { overall } = indexRanks(ranks)
  if (overall?.percentile !== null && overall?.percentile !== undefined && overall.percentile < 40) {
    return {
      text: isLowConfidence
        ? 'Consider reviewing your portfolio allocation.'
        : mode === 'household'
          ? 'Adjust your portfolio allocation to improve your household rank.'
          : 'Adjust your portfolio allocation to improve your rank position.',
      href: ROUTES.portfolioList,
    }
  }

  // No goals set — prompt to define one.
  if (!profile.hasGoals) {
    return {
      text: isLowConfidence
        ? 'Consider setting a financial goal.'
        : mode === 'household'
          ? 'Set a financial goal to build toward your financial targets.'
          : 'Set a financial goal to build on your wealth rank.',
      href: ROUTES.goals,
    }
  }

  return null
}

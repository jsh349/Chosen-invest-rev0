import type { RankResult } from '@/lib/types/rank'
import { indexRanks } from '@/lib/utils/rank-index'

export type RankReviewItem = {
  /** Which review dimension this item covers */
  topic: 'profile' | 'wealth' | 'return'
  /** Short human-readable label */
  label: string
  /**
   * - ok      → nothing to do
   * - review  → data exists but warrants attention
   * - missing → required input or data is absent
   */
  status: 'ok' | 'review' | 'missing'
  /** One-sentence note explaining the status */
  note: string
}

/**
 * Produces a structured review summary across three rank dimensions:
 * profile completeness, wealth rank standing, and return rank standing.
 *
 * Returns null when every item is 'ok' — callers should render nothing in that case.
 * Returns all three items otherwise so the user sees the full picture.
 *
 * Rules are deterministic; no AI or network calls.
 */
export function getRankReviewSummary(
  ranks: RankResult[],
  profile: { hasAge: boolean; hasGender: boolean; hasReturn: boolean },
): RankReviewItem[] | null {
  const { overall, ret } = indexRanks(ranks)
  const overallPct = overall?.percentile ?? null
  const returnPct  = ret?.percentile     ?? null

  // --- Profile completeness ---
  const profileItem: RankReviewItem = (() => {
    if (!profile.hasAge) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'missing',
        note: 'Birth year not set — age-based rank unavailable.',
      }
    }
    if (!profile.hasGender && !profile.hasReturn) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Gender and return estimate not set.',
      }
    }
    if (!profile.hasGender) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Gender not set — age-gender rank unavailable.',
      }
    }
    if (!profile.hasReturn) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Return estimate not set — return rank unavailable.',
      }
    }
    return {
      topic: 'profile', label: 'Profile',
      status: 'ok',
      note: 'All profile inputs are complete.',
    }
  })()

  // --- Wealth rank standing ---
  const wealthItem: RankReviewItem = (() => {
    if (overallPct === null) {
      return {
        topic: 'wealth', label: 'Wealth rank',
        status: 'missing',
        note: 'Overall wealth rank is not yet available.',
      }
    }
    if (overallPct < 50) {
      return {
        topic: 'wealth', label: 'Wealth rank',
        status: 'review',
        note: overallPct >= 40
          ? 'Around the benchmark midpoint.'
          : 'Tracking below the benchmark midpoint.',
      }
    }
    return {
      topic: 'wealth', label: 'Wealth rank',
      status: 'ok',
      note: 'At or above the benchmark median.',
    }
  })()

  // --- Return rank standing ---
  const returnItem: RankReviewItem = (() => {
    if (returnPct === null) {
      return {
        topic: 'return', label: 'Return rank',
        status: 'missing',
        note: 'No return estimate — return rank unavailable.',
      }
    }
    if (returnPct < 50) {
      return {
        topic: 'return', label: 'Return rank',
        status: 'review',
        note: returnPct >= 40
          ? 'Around the benchmark midpoint.'
          : 'Tracking below the benchmark midpoint.',
      }
    }
    return {
      topic: 'return', label: 'Return rank',
      status: 'ok',
      note: 'At or above the benchmark median.',
    }
  })()

  const items: RankReviewItem[] = [profileItem, wealthItem, returnItem]
  const needsAttention = items.some((i) => i.status !== 'ok')
  return needsAttention ? items : null
}

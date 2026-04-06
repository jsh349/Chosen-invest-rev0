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
        note: 'Birth year needed for age-based comparison.',
      }
    }
    if (!profile.hasGender && !profile.hasReturn) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Gender and return estimate both needed.',
      }
    }
    if (!profile.hasGender) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Gender needed for age and gender comparison.',
      }
    }
    if (!profile.hasReturn) {
      return {
        topic: 'profile', label: 'Profile',
        status: 'review',
        note: 'Return estimate needed for return rank.',
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
          : overallPct >= 25
            ? 'Tracking below the benchmark midpoint.'
            : 'Well below the benchmark midpoint.',
      }
    }
    return {
      topic: 'wealth', label: 'Wealth rank',
      status: 'ok',
      // Mirror getRankInterpretation tiers so report and review surfaces
      // describe the same rank outcome with the same phrase.
      note: overallPct >= 75 ? 'Well above the benchmark median.' : 'Above the benchmark median.',
    }
  })()

  // --- Return rank standing ---
  const returnItem: RankReviewItem = (() => {
    if (returnPct === null) {
      return {
        topic: 'return', label: 'Return rank',
        status: 'missing',
        note: 'Return estimate needed for return rank.',
      }
    }
    if (returnPct < 50) {
      return {
        topic: 'return', label: 'Return rank',
        status: 'review',
        note: returnPct >= 40
          ? 'Around the benchmark midpoint.'
          : returnPct >= 25
            ? 'Tracking below the benchmark midpoint.'
            : 'Well below the benchmark midpoint.',
      }
    }
    return {
      topic: 'return', label: 'Return rank',
      status: 'ok',
      note: returnPct >= 75 ? 'Well above the benchmark median.' : 'Above the benchmark median.',
    }
  })()

  const items: RankReviewItem[] = [profileItem, wealthItem, returnItem]
  const needsAttention = items.some((i) => i.status !== 'ok')
  return needsAttention ? items : null
}

import type { RankHint } from '@/lib/utils/rank-next-hint'

export type RankExplanationSet = {
  showNarrative: boolean
  showInsight:   boolean
  showNextHint:  boolean
}

/**
 * Determines which explanation blocks to surface on the rank page,
 * showing at most two at a time in a deterministic priority order.
 *
 * Priority (first applicable rule wins):
 *  1. Profile incomplete → next-step hint (most urgent) + narrative for context.
 *     Insight is suppressed: gap analysis is less meaningful on a partial profile.
 *  2. Profile complete, gap detected → insight + narrative.
 *  3. Profile complete, no gap → narrative only.
 */
export function getRankExplanationSet(params: {
  narrativeSummary: string | null
  rankInsight:      string | null
  nextHint:         RankHint | null
}): RankExplanationSet {
  const { narrativeSummary, rankInsight, nextHint } = params

  if (nextHint !== null) {
    return {
      showNarrative: narrativeSummary !== null,
      showInsight:   false,
      showNextHint:  true,
    }
  }

  return {
    showNarrative: narrativeSummary !== null,
    showInsight:   rankInsight !== null,
    showNextHint:  false,
  }
}

import type { RankHint } from '@/lib/utils/rank-next-hint'

export type RankExplanationSet = {
  showNarrative:         boolean
  showInsight:           boolean  // rankInsight — major rank gap
  showNextHint:          boolean  // nextHint — missing critical input
  showGoalInsight:       boolean  // rankGoalInsight — goal bridge
  showAllocationInsight: boolean  // rankAllocationInsight — allocation bridge
}

/**
 * Determines which insight blocks to surface on the rank page,
 * showing at most two at a time in a deterministic priority order.
 *
 * Priority (first applicable rule wins; narrative always pairs as context):
 *  1. Profile incomplete  → nextHint + narrative.
 *     All gap/goal/allocation insights suppressed (partial profile makes them unreliable).
 *  2. Major rank gap      → rankInsight + narrative.
 *     Goal and allocation insights suppressed (gap is the most actionable signal).
 *  3. Goal-related        → rankGoalInsight + narrative.
 *     Allocation insight suppressed.
 *  4. Allocation-related  → rankAllocationInsight + narrative.
 *  5. No actionable insight → narrative only.
 */
export function getRankExplanationSet(params: {
  narrativeSummary:      string | null
  rankInsight:           string | null
  nextHint:              RankHint | null
  rankGoalInsight:       string | null
  rankAllocationInsight: string | null
}): RankExplanationSet {
  const { narrativeSummary, rankInsight, nextHint, rankGoalInsight, rankAllocationInsight } = params
  const hasNarrative = narrativeSummary !== null

  // Priority 1: missing critical input — completing the profile is most urgent.
  if (nextHint !== null) {
    return {
      showNarrative:         hasNarrative,
      showInsight:           false,
      showNextHint:          true,
      showGoalInsight:       false,
      showAllocationInsight: false,
    }
  }

  // Priority 2: major rank gap detected — strongest analytical signal available.
  if (rankInsight !== null) {
    return {
      showNarrative:         hasNarrative,
      showInsight:           true,
      showNextHint:          false,
      showGoalInsight:       false,
      showAllocationInsight: false,
    }
  }

  // Priority 3: goal-related insight — rank-to-goal bridge is next most relevant.
  if (rankGoalInsight !== null) {
    return {
      showNarrative:         hasNarrative,
      showInsight:           false,
      showNextHint:          false,
      showGoalInsight:       true,
      showAllocationInsight: false,
    }
  }

  // Priority 4: allocation-related insight.
  if (rankAllocationInsight !== null) {
    return {
      showNarrative:         hasNarrative,
      showInsight:           false,
      showNextHint:          false,
      showGoalInsight:       false,
      showAllocationInsight: true,
    }
  }

  // Priority 5: narrative only — no actionable insight available.
  return {
    showNarrative:         hasNarrative,
    showInsight:           false,
    showNextHint:          false,
    showGoalInsight:       false,
    showAllocationInsight: false,
  }
}

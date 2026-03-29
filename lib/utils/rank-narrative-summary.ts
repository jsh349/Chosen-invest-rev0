import type { RankResult } from '@/lib/types/rank'
import { indexRanks } from '@/lib/utils/rank-index'
import { RANK_GAP_THRESHOLD } from '@/lib/utils/rank-insight'

/**
 * Generates a short deterministic narrative summary (1–2 sentences) that
 * combines available rank signals into a readable overview.
 *
 * Rules (first matching condition wins for the opening sentence):
 *   - No data at all        → neutral prompt to complete profile
 *   - Overall ≥ 75          → "compares favorably"
 *   - Overall 50–74         → "above the benchmark median"
 *   - Overall 40–49         → "near the benchmark median"
 *   - Overall < 40          → "below the benchmark median"
 *
 * A second sentence is appended (at most one) when:
 *   - Return rank is ≥ 20 pts below overall  → note about return standing
 *   - Return rank is ≥ 20 pts above overall  → note about return strength
 *   - Profile is incomplete and no return gap → prompt to complete profile
 *
 * Always returns a non-empty string.
 */
export function getRankNarrativeSummary(ranks: RankResult[]): string {
  const { overall, ageBased, ageGender, ret } = indexRanks(ranks)

  const overallPct = overall?.percentile ?? null
  const retPct     = ret?.percentile     ?? null

  const profileIncomplete = !!(
    ageBased?.missingField  ||
    ageGender?.missingField ||
    ret?.missingField
  )

  // No overall data — nothing meaningful to say yet
  if (overallPct === null) {
    return profileIncomplete
      ? 'Benchmark comparisons are not yet available. Add profile details to unlock rank comparisons.'
      : 'Overall wealth rank is unavailable with current portfolio data.'
  }

  // Opening sentence based on overall percentile
  let opening: string
  if (overallPct >= 75) {
    opening = 'Your overall asset position compares favorably against the reference group.'
  } else if (overallPct >= 50) {
    opening = 'Your overall asset position is above the benchmark median.'
  } else if (overallPct >= 40) {
    opening = 'Your overall asset position is near the benchmark median.'
  } else {
    opening = 'Your overall asset position is below the benchmark median.'
  }

  // Optional second sentence — return gap takes priority over profile note
  let second = ''
  if (retPct !== null && overallPct - retPct >= RANK_GAP_THRESHOLD) {
    second = ' Your investment return rank is notably lower than your wealth rank.'
  } else if (retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD) {
    second = ' Your investment return rank is notably stronger than your wealth rank.'
  } else if (profileIncomplete) {
    second = ' More detailed comparisons will be available when profile inputs are completed.'
  }

  return opening + second
}

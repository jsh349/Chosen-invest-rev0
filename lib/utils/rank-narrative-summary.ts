import type { RankResult } from '@/lib/types/rank'
import { indexRanks } from '@/lib/utils/rank-index'
import { RANK_GAP_THRESHOLD } from '@/lib/utils/rank-insight'

/**
 * Generates a short deterministic narrative summary (1–2 sentences) that
 * combines available rank signals into a readable overview.
 *
 * Rules (first matching condition wins for the opening sentence):
 *   - No data at all        → neutral prompt to complete profile
 *   - Overall ≥ 75          → "well above the benchmark median"
 *   - Overall 50–74         → "above the benchmark median"
 *   - Overall 40–49         → "near the benchmark median"
 *   - Overall 25–39         → "below the benchmark median"
 *   - Overall < 25          → "well below the benchmark median"
 *
 * Tiers mirror getRankInterpretation so summary and detail surfaces use
 * recognisably related language for the same rank state.
 *
 * A second sentence is appended (at most one) when:
 *   - Return rank is ≥ 20 pts below overall  → note about return standing
 *   - Return rank is ≥ 20 pts above overall  → note about return strength
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
      ? 'Rank comparisons are not yet available — add profile details to get started.'
      : 'Overall wealth rank is unavailable with current portfolio data.'
  }

  // Opening sentence based on overall percentile.
  // Wording anchors to getRankInterpretation tiers so summary and detail surfaces
  // use recognisably related language for the same rank state.
  let opening: string
  if (overallPct >= 75) {
    opening = 'Your overall assets rank well above the benchmark median.'
  } else if (overallPct >= 50) {
    opening = 'Your overall assets rank above the benchmark median.'
  } else if (overallPct >= 40) {
    opening = 'Your overall assets rank near the benchmark median.'
  } else if (overallPct >= 25) {
    opening = 'Your overall assets rank below the benchmark median.'
  } else {
    opening = 'Your overall assets rank well below the benchmark median.'
  }

  // Optional second sentence — return gap takes priority; profile note is fallback.
  // Priority order: wealth > return gap → return > wealth gap → profile incomplete.
  let second = ''
  if (retPct !== null && overallPct - retPct >= RANK_GAP_THRESHOLD) {
    second = ' Your return rank is notably lower than your wealth rank.'
  } else if (retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD) {
    second = ' Your return rank is notably stronger than your wealth rank.'
  } else if (profileIncomplete) {
    // Aligns narrative with the profile-completion hint shown in the explanation block:
    // both acknowledge that the current view is based on partial profile inputs.
    second = ' Some comparisons are unavailable based on current profile inputs.'
  }

  return opening + second
}

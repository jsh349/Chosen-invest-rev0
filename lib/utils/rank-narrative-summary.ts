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
 *   - Overall 40–49         → "just below the benchmark median"
 *   - Overall 25–39         → "below the benchmark median"
 *   - Overall < 25          → "well below the benchmark median"
 *
 * Tiers mirror getRankInterpretation so summary and detail surfaces use
 * recognisably related language for the same rank state.
 *
 * When isLowConfidence is true (fallback / invalid benchmark source), the two
 * extreme bands drop "well" — matching the same restraint applied in
 * getRankInterpretation so both surfaces stay in sync.
 *
 * A second sentence is appended (at most one) when:
 *   - Return rank is ≥ 20 pts below overall  → note about return standing
 *   - Return rank is ≥ 20 pts above overall  → note about return strength
 *
 * Always returns a non-empty string.
 */
export function getRankNarrativeSummary(
  ranks: RankResult[],
  { isLowConfidence = false }: { isLowConfidence?: boolean } = {},
): string {
  const { overall, ageBased, ageGender, ret } = indexRanks(ranks)

  const overallPct = overall?.percentile ?? null
  const retPct     = ret?.percentile     ?? null

  // Granular missing-field flags used for specific second-sentence variants.
  const missingReturn  = !!ret?.missingField
  const missingAge     = !!ageBased?.missingField
  // missingGender is only true when age IS present but gender is not.
  const missingGender  = !missingAge && !!ageGender?.missingField
  const profileIncomplete = missingReturn || missingAge || missingGender

  // No overall data — nothing meaningful to say yet
  if (overallPct === null) {
    return profileIncomplete
      ? 'Rank comparisons are not yet available — add profile details to get started.'
      : 'Overall wealth rank is unavailable with current portfolio data.'
  }

  // Opening sentence based on overall percentile.
  // Normal mode uses "midpoint" for middle-distribution bands; low-confidence reverts to "median".
  let opening: string
  if (overallPct >= 75) {
    opening = isLowConfidence
      ? 'Your overall assets rank above the benchmark median.'
      : 'Your overall assets rank well above the benchmark median.'
  } else if (overallPct >= 50) {
    opening = isLowConfidence
      ? 'Your overall assets rank above the benchmark median.'
      : 'Your overall assets rank above the benchmark midpoint.'
  } else if (overallPct >= 40) {
    opening = 'Your overall assets rank just below the benchmark median.'
  } else {
    // 25–39 and < 25 both use "midpoint" in normal mode; "median" in low confidence.
    opening = isLowConfidence
      ? 'Your overall assets rank below the benchmark median.'
      : 'Your overall assets rank below the benchmark midpoint.'
  }

  // Optional second sentence — first matching condition wins.
  // Priority: gap detection > both-strong > specific missing > generic fallback.
  const bothStrong = overallPct >= 75 && retPct !== null && retPct >= 75
  const downGap    = retPct !== null && overallPct - retPct >= RANK_GAP_THRESHOLD
  const upGap      = retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD

  let second = ''
  if (downGap) {
    second = bothStrong
      ? ' Your return rank is notably lower than your wealth rank.'
      : ' Your return rank is weaker than your wealth rank.'
  } else if (upGap) {
    second = ' Your return rank is stronger than your wealth rank.'
  } else if (bothStrong) {
    second = ' Both wealth and return ranks compare favorably.'
  } else if (missingReturn && !missingAge && !missingGender) {
    second = ' Add a return estimate to complete your comparison.'
  } else if (missingAge && !missingReturn) {
    second = ' Add a birth year to complete your comparison.'
  } else if (missingGender) {
    second = ' Add your gender to complete your comparison.'
  } else if (profileIncomplete) {
    second = ' Some comparisons are unavailable based on current profile inputs.'
  }

  return opening + second
}

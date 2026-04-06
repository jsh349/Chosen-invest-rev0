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
 * A second sentence is appended (at most one, evaluated in priority order):
 *   1. Return ≥ 20 pts below overall    → return rank lower than wealth rank
 *   2. Return ≥ 20 pts above overall    → return rank stronger than wealth rank
 *   3. Both overall ≥ 75 and return ≥ 75 → both compare favorably
 *   4. Only return estimate missing     → specific prompt to add return estimate
 *   5. Only age missing (return present) → specific prompt to add birth year
 *   6. Only gender missing              → specific prompt to add gender
 *   7. Multiple inputs missing          → generic prompt to complete profile
 *
 * Always returns a non-empty string.
 */
export function getRankNarrativeSummary(ranks: RankResult[]): string {
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
      ? 'Benchmark comparisons are not yet available — complete your profile to unlock them.'
      : 'Overall wealth rank is unavailable with current portfolio data.'
  }

  // Opening sentence based on overall percentile tier
  let opening: string
  if (overallPct >= 75) {
    opening = 'Your overall asset position compares favorably against the reference group.'
  } else if (overallPct >= 50) {
    opening = 'Your overall asset position is above the benchmark midpoint.'
  } else if (overallPct >= 40) {
    opening = 'Your overall asset position is near the benchmark midpoint.'
  } else {
    opening = 'Your overall asset position is below the benchmark midpoint.'
  }

  // Optional second sentence — evaluated in priority order, first match wins.
  let second = ''
  if (retPct !== null && overallPct - retPct >= RANK_GAP_THRESHOLD) {
    // Wealth significantly ahead of return
    second = ' Your investment return rank is notably lower than your wealth rank.'
  } else if (retPct !== null && retPct - overallPct >= RANK_GAP_THRESHOLD) {
    // Return significantly ahead of wealth
    second = ' Your investment return rank is notably stronger than your wealth rank.'
  } else if (overallPct >= 75 && retPct !== null && retPct >= 75) {
    // Both wealth and return rank strongly — worth noting explicitly
    second = ' Both wealth and return ranks compare favorably against the reference group.'
  } else if (missingReturn && !missingAge) {
    // Return estimate is the only missing input
    second = ' Adding a return estimate will unlock investment rank comparison.'
  } else if (missingAge && !missingReturn) {
    // Birth year is missing but return is available
    second = ' Adding birth year will enable age-based rank comparison.'
  } else if (missingGender) {
    // Age is set; only gender is missing
    second = ' Adding gender will enable a more specific age and gender comparison.'
  } else if (profileIncomplete) {
    // Multiple inputs missing — generic fallback
    second = ' More detailed comparisons will be available when profile inputs are completed.'
  }

  return opening + second
}

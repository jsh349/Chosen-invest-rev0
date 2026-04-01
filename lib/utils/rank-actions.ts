import type { RankResult } from '@/lib/types/rank'
import { ROUTES } from '@/lib/constants/routes'
import { indexRanks } from '@/lib/utils/rank-index'

export type RankAction = {
  label: string
  href: string
}

/**
 * Returns up to two contextual action links derived from rank outputs.
 * Rules are evaluated in priority order; result is capped at 2.
 *
 * @param hasGoals         Pass true when the user already has at least one goal set.
 *                         Prevents the "Set a financial goal" action from showing
 *                         when it is no longer relevant.
 * @param isLowConfidence  Pass true when the benchmark source is fallback or invalid.
 *                         Suppresses Rule 2 (portfolio review) — acting on a rank
 *                         position that may shift once the source is restored implies
 *                         more confidence than the data warrants.
 */
export function getRankActions(
  ranks: RankResult[],
  { hasGoals = false, isLowConfidence = false }: { hasGoals?: boolean; isLowConfidence?: boolean } = {},
): RankAction[] {
  const actions: RankAction[] = []

  const { overall, ageBased, ageGender, ret } = indexRanks(ranks)

  const overallPct        = overall?.percentile ?? null
  const profileIncomplete = !!(ageBased?.missingField || ageGender?.missingField)
  const returnMissing     = !!(ret?.missingField)

  // Rule 1: profile incomplete (age / gender) → complete in Settings
  if (overallPct !== null && profileIncomplete) {
    actions.push({ label: 'Complete profile for full ranking', href: ROUTES.settings })
  }

  // Rule 2: wealth rank below the 75th percentile → review portfolio.
  // Gated on !profileIncomplete: portfolio review is only a meaningful signal
  // when the rank is based on a complete profile (age + gender adjusted). An
  // unadjusted rank may shift significantly once demographics are added — acting
  // on it before the profile is complete implies more confidence than is warranted.
  // Also gated on !isLowConfidence: when the benchmark source is fallback/invalid,
  // the rank position itself may shift once the source is restored — suggesting
  // portfolio action on that signal overstates the current confidence level.
  if (actions.length < 2 && overallPct !== null && overallPct < 75 && !profileIncomplete && !isLowConfidence) {
    actions.push({ label: 'Adjust portfolio allocation', href: ROUTES.portfolioList })
  }

  // Rule 3: return estimate missing and not already linking to Settings.
  // Evaluated before goals (Rule 4) to match checklist priority order:
  // data completeness (age → gender → return) before contextual actions (goals).
  if (
    actions.length < 2 &&
    returnMissing &&
    !actions.some((a) => a.href === ROUTES.settings)
  ) {
    actions.push({ label: 'Add return estimate for investment rank', href: ROUTES.settings })
  }

  // Rule 4: overall rank available but no goals set
  if (actions.length < 2 && overallPct !== null && !hasGoals) {
    actions.push({ label: 'Set a financial goal', href: ROUTES.goals })
  }

  return actions.slice(0, 2)
}

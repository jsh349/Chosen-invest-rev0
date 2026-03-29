import type { RankResult } from '@/lib/types/rank'
import { ROUTES } from '@/lib/constants/routes'

export type RankAction = {
  label: string
  href: string
}

/**
 * Returns up to two contextual action links derived from rank outputs.
 * Rules are evaluated in order; duplicates are avoided by capping at 2.
 *
 * Intentionally does NOT duplicate the per-row "Set X in Settings" links
 * already shown inside each RankRow — these are higher-level navigations.
 */
export function getRankActions(ranks: RankResult[]): RankAction[] {
  const actions: RankAction[] = []

  const overall   = ranks.find((r) => r.type === 'overall_wealth')
  const ageBased  = ranks.find((r) => r.type === 'age_based')
  const ageGender = ranks.find((r) => r.type === 'age_gender')

  const overallPct      = overall?.percentile ?? null
  const profileIncomplete = !!(ageBased?.missingField || ageGender?.missingField)

  // Rule 1: wealth rank available but profile is incomplete across age / gender ranks
  if (overallPct !== null && profileIncomplete) {
    actions.push({ label: 'Complete profile for full ranking', href: ROUTES.settings })
  }

  // Rule 2: wealth rank below the 75th percentile → suggest reviewing portfolio
  if (overallPct !== null && overallPct < 75) {
    actions.push({ label: 'Review portfolio composition', href: ROUTES.portfolioList })
  }

  return actions.slice(0, 2)
}

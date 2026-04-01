import type { RankResult } from '@/lib/types/rank'
import type { RankHint } from '@/lib/utils/rank-next-hint'
import { getPrimaryRank } from '@/lib/utils/rank-priority'
import { getRankInsight } from '@/lib/utils/rank-insight'
import { getRankInterpretation } from '@/lib/utils/rank-interpretation'
import { ROUTES } from '@/lib/constants/routes'

/**
 * The four content slots of a compact rank report, in canonical display order.
 *
 * Slot selection rules (each slot picks the highest-value single item):
 *   highlight      — highest-priority rank that has a real percentile (RANK_PRIORITY_ORDER)
 *   explanation    — rank-type-specific contextual message (highlight.message)
 *   comparisonNote — getRankInsight cross-rank gap analysis; null = slot omitted
 *   nextAction     — caller-supplied next-step hint; null = slot omitted
 */
export type RankReportContent = {
  highlight:      RankResult
  explanation:    string
  comparisonNote: string | null
  nextAction:     RankHint | null
}

/**
 * Pure composition function — converts rank data into a RankReportContent
 * object using the fixed slot order above.
 *
 * Returns null when no rank has a real percentile (nothing to show).
 * Deterministic: same inputs always produce the same output.
 *
 * Lives here (not in the UI component) so any surface can import the
 * composition logic without depending on the renderer.
 *
 * @param isLowConfidence When true (fallback / invalid benchmark source):
 *   Hints that imply a reliable outcome ("to unlock ...") are suppressed.
 *   These hints should have been generated with isLowConfidence = true by
 *   the caller (getPrimaryRankNextAction); this is a defensive safety gate
 *   for cases where the caller cannot pass the flag.
 */
export function composeRankReport(
  ranks: RankResult[],
  nextHint: RankHint | null | undefined,
  { isLowConfidence = false }: { isLowConfidence?: boolean } = {},
): RankReportContent | null {
  const highlight = getPrimaryRank(ranks)
  if (!highlight || highlight.percentile === null) return null

  // Only surface profile-completeness actions (Settings) in compact reports.
  // Portfolio/goals actions need the surrounding context of the full rank page
  // to be actionable — showing them here without that context is low confidence.
  //
  // Additional gate: when isLowConfidence is true, suppress Settings hints that
  // still carry "unlock" framing — these imply a reliable rank improvement that
  // the fallback source cannot deliver. Callers should ideally pass a hint
  // computed with isLowConfidence = true; this prevents a mismatch when they don't.
  const rawAction = nextHint?.href === ROUTES.settings ? nextHint : null
  const nextAction =
    rawAction !== null && isLowConfidence && rawAction.text.includes('unlock')
      ? null
      : rawAction

  // comparisonNote (slot 3) is suppressed when nextAction (slot 4) is present.
  // When a profile-completeness action is already shown, getRankInsight's profile-gap
  // notes (Rules 3 & 4 — "add birth year/gender in Settings") would duplicate the same
  // remediation in two adjacent slots. Gap-analysis notes (Rules 1 & 2) are also
  // premature when the profile is incomplete — ranks will shift once gaps are filled.
  const comparisonNote = nextAction !== null ? null : getRankInsight(ranks)

  return {
    highlight,
    // Use the short interpretation (no redundant percentile) rather than
    // highlight.message — the percentile is already displayed prominently
    // in Slot 1, so the explanation slot should add interpretation only.
    explanation: getRankInterpretation(highlight.percentile!, isLowConfidence),
    comparisonNote,
    nextAction,
  }
}

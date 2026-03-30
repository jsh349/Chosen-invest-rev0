import type { RankResult } from '@/lib/types/rank'
import type { RankHint } from '@/lib/utils/rank-next-hint'
import { getPrimaryRank } from '@/lib/utils/rank-priority'
import { getRankInsight } from '@/lib/utils/rank-insight'

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
 */
export function composeRankReport(
  ranks: RankResult[],
  nextHint: RankHint | null | undefined,
): RankReportContent | null {
  const highlight = getPrimaryRank(ranks)
  if (!highlight || highlight.percentile === null) return null

  return {
    highlight,
    explanation:    highlight.message,
    comparisonNote: getRankInsight(ranks),
    nextAction:     nextHint ?? null,
  }
}

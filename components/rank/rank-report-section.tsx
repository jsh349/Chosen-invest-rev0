'use client'

import Link from 'next/link'
import type { RankResult } from '@/lib/types/rank'
import type { RankHint } from '@/lib/utils/rank-next-hint'
import { getPrimaryRank } from '@/lib/utils/rank-priority'
import { getRankInterpretation } from '@/lib/utils/rank-interpretation'
import { getRankInsight } from '@/lib/utils/rank-insight'
import { cn } from '@/lib/utils/cn'

type Props = {
  ranks: RankResult[]
  /** Pre-computed next-step hint — pass null when all profile fields are filled. */
  nextHint?: RankHint | null
}

/**
 * The four content slots of a compact rank report, in canonical display order.
 *
 * Slot selection rules (each slot picks the highest-value single item):
 *   highlight      — highest-priority rank that has a real percentile (RANK_PRIORITY_ORDER)
 *   explanation    — getRankInterpretation applied to highlight.percentile
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
 */
export function composeRankReport(
  ranks: RankResult[],
  nextHint: RankHint | null | undefined,
): RankReportContent | null {
  const highlight = getPrimaryRank(ranks)
  if (!highlight || highlight.percentile === null) return null

  return {
    highlight,
    explanation:    getRankInterpretation(highlight.percentile),
    comparisonNote: getRankInsight(ranks),
    nextAction:     nextHint ?? null,
  }
}

function topPctLabel(percentile: number): string {
  const top = 100 - percentile
  return top === 0 ? '<1%' : `${top}%`
}

function percentileColor(percentile: number): string {
  if (percentile >= 75) return 'text-emerald-400'
  if (percentile >= 50) return 'text-brand-400'
  if (percentile >= 30) return 'text-amber-400'
  return 'text-gray-400'
}

/**
 * Renders a RankReportContent in canonical slot order.
 * Slots 3 and 4 (comparisonNote, nextAction) are omitted when null.
 * Returns null when no rank data is available.
 */
export function RankReportSection({ ranks, nextHint }: Props) {
  const report = composeRankReport(ranks, nextHint)
  if (!report) return null

  const { highlight, explanation, comparisonNote, nextAction } = report

  return (
    <div
      role="region"
      aria-label="Rank Report"
      className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Report</p>

      {/* Slot 1 — primary rank highlight */}
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-wide text-gray-600">{highlight.label}</p>
        <p className={cn('text-2xl font-bold tabular-nums leading-none', percentileColor(highlight.percentile!))}>
          Top {topPctLabel(highlight.percentile!)}
        </p>
        <p className="text-xs tabular-nums text-gray-600">{highlight.percentile}th percentile</p>
      </div>

      {/* Slot 2 — short explanation */}
      <p className="text-xs text-gray-400 leading-relaxed">{explanation}</p>

      {/* Slot 3 — comparison note (omitted when null) */}
      {comparisonNote && (
        <p className="border-t border-surface-border pt-2 text-xs text-gray-500 leading-relaxed">
          {comparisonNote}
        </p>
      )}

      {/* Slot 4 — next action (omitted when null) */}
      {nextAction && (
        <div className="border-t border-surface-border pt-2">
          <Link
            href={nextAction.href}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {nextAction.text}
          </Link>
        </div>
      )}

      {/* Footer — benchmark framing */}
      <p className="border-t border-surface-border pt-2 text-[10px] text-gray-600">
        Benchmark-based estimate · not financial advice
      </p>
    </div>
  )
}

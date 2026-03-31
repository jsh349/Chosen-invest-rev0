'use client'

import Link from 'next/link'
import type { RankResult } from '@/lib/types/rank'
import type { RankHint } from '@/lib/utils/rank-next-hint'
import { topPctLabel, percentileColor } from '@/lib/utils/rank-format'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'
// Composition logic lives in a utility so any surface can import it
// without depending on this UI component. Re-exported here for convenience.
import { composeRankReport } from '@/lib/utils/rank-report-composer'
export { composeRankReport } from '@/lib/utils/rank-report-composer'
export type { RankReportContent } from '@/lib/utils/rank-report-composer'

type Props = {
  ranks: RankResult[]
  /** Pre-computed next-step hint — pass null when all profile fields are filled. */
  nextHint?: RankHint | null
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
      <p className="text-[10px] text-gray-600">local benchmark</p>

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
        <p className="border-t border-surface-border pt-2 text-xs text-gray-400 leading-relaxed">
          {comparisonNote}
        </p>
      )}

      {/* Slot 4 — next action (omitted when null).
          Layout matches the detail surface: prose text + short link label,
          rather than the full sentence as link text. composeRankReport ensures
          nextAction.href is always ROUTES.settings here. */}
      {nextAction && (
        <div className="border-t border-surface-border pt-2 flex items-start justify-between gap-3">
          <p className="text-xs text-gray-400 leading-relaxed">{nextAction.text}</p>
          <Link
            href={nextAction.href}
            className="shrink-0 text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            Settings →
          </Link>
        </div>
      )}

      {/* Footer — benchmark framing + detail link */}
      <div className="border-t border-surface-border pt-2 flex items-center justify-between gap-3">
        <p className="text-[10px] text-gray-600">
          Estimate · not financial advice · Chosen Invest
        </p>
        <Link
          href={ROUTES.rank}
          className="shrink-0 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
        >
          View rank details →
        </Link>
      </div>
    </div>
  )
}

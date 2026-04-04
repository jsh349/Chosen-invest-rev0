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
  /**
   * Optional compact source/fallback note shown before the footer.
   * Pass the text from getRankConfidenceNote() when the benchmark source
   * is degraded (fallback, partial, or invalid). Null → slot is clean.
   * Mirrors the same prop on RankShareCard for consistent source framing.
   */
  sourceNote?: string | null
  /**
   * When true, suppresses Settings hints that still carry "unlock" framing —
   * those imply a reliable rank improvement the fallback source cannot deliver.
   * Should match the isLowConfidence value used when computing nextHint via
   * getPrimaryRankNextAction.
   */
  isLowConfidence?: boolean
  /** Comparison mode label shown in the card sub-header. Defaults to 'individual'. */
  mode?: 'individual' | 'household'
}

/**
 * Renders a RankReportContent in canonical slot order.
 * Slots 3 and 4 (comparisonNote, nextAction) are omitted when null.
 * Returns null when no rank data is available.
 */
export function RankReportSection({ ranks, nextHint, sourceNote = null, isLowConfidence = false, mode = 'individual' }: Props) {
  const report = composeRankReport(ranks, nextHint, { isLowConfidence })
  if (!report) return null

  const { highlight, explanation, comparisonNote, nextAction } = report

  // Partial coverage — mirrors the same note in RankShareCard for parity.
  const availableCount = ranks.filter((r) => r.percentile != null).length
  const isPartial = availableCount > 0 && availableCount < ranks.length

  return (
    <div
      role="region"
      aria-label="Rank Report"
      className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3"
    >
      {/* Title and mode on one baseline row — mode qualifies the title rather
          than claiming a standalone line between the section label and the data. */}
      <div className="flex items-baseline gap-2">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Report</p>
        <span className="text-[10px] capitalize text-gray-600">{mode}</span>
      </div>

      {/* Slot 1 — primary rank highlight */}
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-wide text-gray-500">{highlight.label}</p>
        <p className={cn('text-2xl font-bold tabular-nums leading-none', percentileColor(highlight.percentile!))}>
          Top {topPctLabel(highlight.percentile!)}
        </p>
      </div>

      {/* Slot 2 — short explanation */}
      <p className="text-xs text-gray-400 leading-relaxed">{explanation}</p>

      {/* Slot 3 — comparison note (omitted when null) */}
      {comparisonNote && (
        <p className="border-t border-surface-border pt-2 text-xs text-gray-500 leading-relaxed">
          {comparisonNote}
        </p>
      )}

      {/* Slot 4 — next action (omitted when null).
          Layout matches the detail surface: prose text + short link label,
          rather than the full sentence as link text. composeRankReport ensures
          nextAction.href is always ROUTES.settings here.
          When a sourceNote is active, it prefixes the action here rather than
          appearing in the footer trust block — trust context should precede the
          recommendation, not follow it. */}
      {nextAction && (
        <div className="border-t border-surface-border pt-3 space-y-2">
          {sourceNote && (
            <p className="text-[10px] text-gray-600">{sourceNote}</p>
          )}
          <div className="flex items-start justify-between gap-3">
            <p className={cn('text-xs leading-relaxed', isLowConfidence ? 'text-gray-600' : 'text-gray-500')}>
              {nextAction.text}
            </p>
            <Link
              href={nextAction.href}
              className={cn(
                'shrink-0 text-xs transition-colors',
                isLowConfidence
                  ? 'text-brand-400/60 hover:text-brand-400'
                  : 'text-brand-400/75 hover:text-brand-400',
              )}
            >
              Settings →
            </Link>
          </div>
        </div>
      )}

      {/* Trust framing — source/coverage note and disclaimer share one separator
          so the transition from "what this means" to "how strongly to trust it"
          reads as a single block rather than two orphaned lines.
          sourceNote is shown here only when nextAction is absent — when an action
          is present, sourceNote already appears above the action as trust context. */}
      <div className="border-t border-surface-border pt-2 space-y-1.5">
        {/* Coverage note is suppressed when nextAction is active — the action slot's
            specific "add X for rank Y" message already communicates profile incompleteness
            and is more actionable than the generic coverage count below it.
            When both sourceNote and isPartial coexist, the coverage count follows the
            source note as a single sentence; "some inputs are missing" is dropped because
            the source caveat already frames the reliability context. */}
        {!nextAction && (isPartial || sourceNote) && (
          <p className="text-[10px] text-gray-600">
            {sourceNote && isPartial
              ? `${sourceNote.replace(/\.$/, '')} — ${availableCount}/${ranks.length} ranks available.`
              : sourceNote
                ? sourceNote
                : `${availableCount}/${ranks.length} ranks — some inputs missing.`
            }
          </p>
        )}
        <div className="flex items-center justify-between gap-3">
          <p className="text-[10px] text-gray-600">
            Estimate · not financial advice · Chosen Invest
          </p>
          <Link
            href={ROUTES.rank}
            className="shrink-0 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
          >
            {isPartial ? 'View full ranking →' : 'View ranking →'}
          </Link>
        </div>
      </div>
    </div>
  )
}

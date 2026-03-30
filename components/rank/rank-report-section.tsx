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
 * Compact, reusable rank report section.
 *
 * Shows:
 *   1. Primary rank highlight (highest-priority rank with a real percentile)
 *   2. One interpretation line
 *   3. One comparison note (insight) when a meaningful gap is detected
 *   4. One next-step suggestion link when provided
 *
 * Returns null when no rank data is available — safe to render unconditionally.
 */
export function RankReportSection({ ranks, nextHint }: Props) {
  const primary = getPrimaryRank(ranks)
  if (!primary || primary.percentile === null) return null

  const interpretation = getRankInterpretation(primary.percentile)
  const comparisonNote = getRankInsight(ranks)

  return (
    <div
      role="region"
      aria-label="Rank Report"
      className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Report</p>

      {/* 1. Primary rank highlight */}
      <div className="space-y-0.5">
        <p className="text-[10px] uppercase tracking-wide text-gray-600">{primary.label}</p>
        <p className={cn('text-2xl font-bold tabular-nums leading-none', percentileColor(primary.percentile))}>
          Top {topPctLabel(primary.percentile)}
        </p>
        <p className="text-xs tabular-nums text-gray-600">{primary.percentile}th percentile</p>
      </div>

      {/* 2. Interpretation */}
      <p className="text-xs text-gray-400 leading-relaxed">{interpretation}</p>

      {/* 3. Comparison note */}
      {comparisonNote && (
        <p className="border-t border-surface-border pt-2 text-xs text-gray-500 leading-relaxed">
          {comparisonNote}
        </p>
      )}

      {/* 4. Next-step suggestion */}
      {nextHint && (
        <div className="border-t border-surface-border pt-2">
          <Link
            href={nextHint.href}
            className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
          >
            {nextHint.text}
          </Link>
        </div>
      )}
    </div>
  )
}

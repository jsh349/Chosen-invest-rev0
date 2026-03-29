'use client'

import { cn } from '@/lib/utils/cn'
import { getRankInterpretation } from '@/lib/utils/rank-interpretation'
import type { MonthlySummary } from '@/lib/utils/rank-monthly-summary'

interface PeriodicRankSummaryCardProps {
  monthlySummary: MonthlySummary | null
}

function deltaLabel(delta: number | null): string {
  if (delta === null) return 'No prior comparison'
  if (delta > 0)  return `+${delta} pt${delta === 1 ? '' : 's'} · improved`
  if (delta < 0)  return `${delta} pt${Math.abs(delta) === 1 ? '' : 's'} · lower`
  return 'Unchanged'
}

function deltaColor(delta: number | null): string {
  if (delta === null) return 'text-gray-600'
  if (delta > 0)  return 'text-emerald-400'
  if (delta < 0)  return 'text-red-400'
  return 'text-gray-500'
}

function rankColor(percentile: number): string {
  if (percentile >= 75) return 'text-emerald-400'
  if (percentile >= 50) return 'text-brand-400'
  if (percentile >= 30) return 'text-amber-400'
  return 'text-gray-400'
}

/**
 * Compact card summarising the most recent periodic rank position and trend.
 * Accepts a pre-computed MonthlySummary; renders a neutral fallback when null.
 */
export function PeriodicRankSummaryCard({ monthlySummary }: PeriodicRankSummaryCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-2">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        Period Summary
      </p>

      {monthlySummary === null ? (
        <p className="text-xs text-gray-600 leading-relaxed">
          No comparison data yet — return after your next visit to see how your rank has changed.
        </p>
      ) : (
        <>
          <div className="flex items-baseline gap-3 flex-wrap">
            {/* Current rank */}
            {monthlySummary.currentOverall !== null ? (
              <span className={cn('text-2xl font-bold tabular-nums tracking-tight', rankColor(monthlySummary.currentOverall))}>
                Top {100 - monthlySummary.currentOverall}%
              </span>
            ) : (
              <span className="text-2xl font-bold text-gray-600">—</span>
            )}

            {/* Delta badge */}
            <span className={cn('text-xs font-medium tabular-nums', deltaColor(monthlySummary.delta))}>
              {deltaLabel(monthlySummary.delta)}
            </span>
          </div>

          {/* Interpretation + note */}
          <p className="text-xs text-gray-500 leading-relaxed">
            {monthlySummary.currentOverall !== null
              ? getRankInterpretation(monthlySummary.currentOverall)
              : monthlySummary.note}
          </p>
        </>
      )}
    </div>
  )
}

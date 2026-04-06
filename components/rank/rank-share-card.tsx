'use client'

import { forwardRef } from 'react'
import type { RankResult } from '@/lib/types/rank'
import { cn } from '@/lib/utils/cn'

// Overall shown as hero; age + return shown as secondary rows
const HERO_TYPE      = 'overall_wealth'
const SECONDARY_TYPES = ['age_based', 'investment_return'] as const

type Props = {
  ranks: RankResult[]
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
 * Self-contained rank summary card.
 * Accepts a forwarded ref so a parent can target the node for future
 * image capture without importing an export library here.
 */
export const RankShareCard = forwardRef<HTMLDivElement, Props>(
  function RankShareCard({ ranks }, ref) {
    const hero      = ranks.find((r) => r.type === HERO_TYPE) ?? null
    const secondary = SECONDARY_TYPES
      .map((type) => ranks.find((r) => r.type === type))
      .filter((r): r is RankResult => r != null)

    const availableCount = [hero, ...secondary].filter(
      (r) => r != null && r.percentile != null,
    ).length
    const totalCount = 1 + secondary.length
    const isPartial  = availableCount > 0 && availableCount < totalCount

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    const hasAnyData = hero != null || secondary.length > 0

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Rank Summary"
        className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3 min-w-[280px]"
      >
        {/* Header */}
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Summary</p>
          <span className="text-[10px] text-gray-600">{dateStr}</span>
        </div>

        {!hasAnyData ? (
          <p className="py-3 text-center text-xs text-gray-600">No rank data available.</p>
        ) : (
          <>
            {/* Overall wealth — primary field */}
            {hero && (
              <div className="rounded-lg bg-surface-muted/50 px-4 py-3">
                <p className="text-[10px] text-gray-600 uppercase tracking-wide mb-1">{hero.label}</p>
                {hero.percentile != null ? (
                  <div className="flex items-baseline gap-2">
                    <span className={cn('text-2xl font-bold tabular-nums leading-none', percentileColor(hero.percentile))}>
                      Top {topPctLabel(hero.percentile)}
                    </span>
                    <span className="text-xs text-gray-600 tabular-nums">
                      {hero.percentile}th pct.
                    </span>
                  </div>
                ) : (
                  <span className="text-xs text-gray-600">—</span>
                )}
              </div>
            )}

            {/* Secondary ranks */}
            {secondary.length > 0 && (
              <div className="divide-y divide-surface-border border-t border-surface-border">
                {secondary.map((r) => (
                  <div key={r.type} className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    {r.percentile != null ? (
                      <span className={cn('text-xs font-semibold tabular-nums', percentileColor(r.percentile))}>
                        Top {topPctLabel(r.percentile)}
                      </span>
                    ) : (
                      <span className="text-xs text-gray-600">—</span>
                    )}
                  </div>
                ))}
              </div>
            )}

            {/* Partial data note */}
            {isPartial && (
              <p className="text-[10px] text-gray-600">
                {availableCount} of {totalCount} ranks available — complete your profile for full results.
              </p>
            )}
          </>
        )}

        {/* Disclaimer */}
        <p className="pt-1 text-[10px] text-gray-600 leading-relaxed border-t border-surface-border">
          Benchmark-based estimate · not financial advice · Chosen Invest
        </p>
      </div>
    )
  }
)

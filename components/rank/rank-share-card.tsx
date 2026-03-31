'use client'

import { forwardRef } from 'react'
import type { RankResult } from '@/lib/types/rank'
import { topPctLabel, percentileColor } from '@/lib/utils/rank-format'
import { cn } from '@/lib/utils/cn'
import { getPrimaryRank } from '@/lib/utils/rank-priority'

// All four types are candidates for secondary; the primary is excluded at runtime.
const SECONDARY_TYPES = ['overall_wealth', 'age_based', 'age_gender', 'investment_return'] as const

type Props = {
  ranks: RankResult[]
  mode?: 'individual' | 'household'
}


/**
 * Self-contained rank summary card.
 * Accepts a forwarded ref so a parent can target the node for future
 * image capture without importing an export library here.
 */
export const RankShareCard = forwardRef<HTMLDivElement, Props>(
  function RankShareCard({ ranks, mode = 'individual' }, ref) {
    const hero      = getPrimaryRank(ranks)
    const secondary = SECONDARY_TYPES
      .filter((type) => type !== hero?.type)
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
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Summary</p>
            <p className="mt-0.5 text-[10px] capitalize text-gray-600">{mode} · benchmark reference</p>
          </div>
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
                  <>
                    <div className="flex items-baseline gap-2">
                      <span className={cn('text-2xl font-bold tabular-nums leading-none', percentileColor(hero.percentile))}>
                        Top {topPctLabel(hero.percentile)}
                      </span>
                      <span className="text-xs text-gray-600 tabular-nums">
                        {hero.percentile}th pct.
                      </span>
                    </div>
                    <p className="mt-1.5 text-[11px] text-gray-500 leading-relaxed">
                      {hero.message}
                    </p>
                  </>
                ) : (
                  <span className="text-sm text-gray-600">—</span>
                )}
              </div>
            )}

            {/* Secondary ranks */}
            {secondary.length > 0 && (
              <div className="divide-y divide-surface-border border-t border-surface-border">
                {secondary.map((r) => (
                  <div key={r.type} className="flex items-start justify-between gap-3 py-2">
                    <div>
                      <span className="text-xs text-gray-500">{r.label}</span>
                      {r.message && (
                        <p className="text-[10px] text-gray-600 leading-snug mt-0.5">{r.message}</p>
                      )}
                    </div>
                    {r.percentile != null ? (
                      <span className={cn('shrink-0 text-sm font-semibold tabular-nums', percentileColor(r.percentile))}>
                        Top {topPctLabel(r.percentile)}
                      </span>
                    ) : (
                      <span className="shrink-0 text-xs text-gray-600">—</span>
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
        <div className="pt-1 border-t border-surface-border">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Benchmark-based estimate · not financial advice · Chosen Invest
          </p>
        </div>
      </div>
    )
  }
)

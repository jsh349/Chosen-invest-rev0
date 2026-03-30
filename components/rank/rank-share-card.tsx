'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import type { RankResult } from '@/lib/types/rank'
import { topPctLabel, percentileColor } from '@/lib/utils/rank-format'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'

// Overall shown as hero; age + return shown as secondary rows
const HERO_TYPE      = 'overall_wealth'
const SECONDARY_TYPES = ['age_based', 'investment_return'] as const

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
                  <div key={r.type} className="flex items-center justify-between py-2">
                    <span className="text-xs text-gray-500">{r.label}</span>
                    {r.percentile != null ? (
                      <span className={cn('text-sm font-semibold tabular-nums', percentileColor(r.percentile))}>
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

        {/* Disclaimer + link to full rank detail */}
        <div className="pt-1 border-t border-surface-border flex items-center justify-between gap-3">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Benchmark-based estimate · not financial advice · Chosen Invest
          </p>
          <Link
            href={ROUTES.rank}
            className="shrink-0 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
          >
            Full breakdown →
          </Link>
        </div>
      </div>
    )
  }
)

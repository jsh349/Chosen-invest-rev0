'use client'

import { forwardRef } from 'react'
import Link from 'next/link'
import type { RankResult } from '@/lib/types/rank'
import { topPctLabel, percentileColor } from '@/lib/utils/rank-format'
import { getRankInterpretation } from '@/lib/utils/rank-interpretation'
import { cn } from '@/lib/utils/cn'
import { getPrimaryRank } from '@/lib/utils/rank-priority'
import { ROUTES } from '@/lib/constants/routes'

// All four types are candidates for secondary; the primary is excluded at runtime.
const SECONDARY_TYPES = ['overall_wealth', 'age_based', 'age_gender', 'investment_return'] as const

type Props = {
  ranks: RankResult[]
  mode?: 'individual' | 'household'
  /**
   * Optional compact source/fallback note shown in the card footer.
   * Pass the text from getRankConfidenceNote() when the benchmark source
   * is degraded (fallback, partial, or invalid). Null → footer is clean.
   */
  sourceNote?: string | null
}


/**
 * Self-contained rank summary card.
 * Accepts a forwarded ref so a parent can target the node for future
 * image capture without importing an export library here.
 */
export const RankShareCard = forwardRef<HTMLDivElement, Props>(
  function RankShareCard({ ranks, mode = 'individual', sourceNote = null }, ref) {
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
            <p className="mt-0.5 text-[10px] capitalize text-gray-600">{mode} · local benchmark</p>
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
                      {getRankInterpretation(hero.percentile!)}
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
                    <span className="text-xs text-gray-500">{r.label}</span>
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

            {/* Combined coverage + source note — merged into one compact line when
                both are present to avoid two adjacent low-key notes.
                Distinction is preserved: partial-profile signal first, source signal second. */}
            {(isPartial || sourceNote) && (
              <p className="text-[10px] text-gray-600">
                {[
                  isPartial ? `${availableCount} of ${totalCount} ranks available — some inputs are missing.` : null,
                  sourceNote ?? null,
                ].filter(Boolean).join(' · ')}
              </p>
            )}
          </>
        )}

        {/* Disclaimer + optional review hint */}
        <div className="pt-1 border-t border-surface-border flex items-center justify-between gap-3">
          <p className="text-[10px] text-gray-600 leading-relaxed">
            Estimate · not financial advice · Chosen Invest
          </p>
          {/* Show a detail link when review adds value: incomplete profile or
              primary rank below the median. Not shown when everything is strong
              and complete — no additional review context to offer. */}
          {(isPartial || (hero?.percentile != null && hero.percentile < 50)) && (
            <Link
              href={ROUTES.rank}
              className="shrink-0 text-[10px] text-brand-400 hover:text-brand-300 transition-colors"
            >
              {isPartial ? 'View full ranking →' : 'Review in detail →'}
            </Link>
          )}
        </div>
      </div>
    )
  }
)

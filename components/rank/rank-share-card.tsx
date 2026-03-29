'use client'

import { forwardRef } from 'react'
import type { RankResult } from '@/lib/types/rank'

// The three ranks shown in the share card — age+gender omitted (optional profile data)
const SHARE_TYPES = ['overall_wealth', 'age_based', 'investment_return'] as const

type Props = {
  ranks: RankResult[]
}

function topPctLabel(percentile: number): string {
  const top = 100 - percentile
  return top === 0 ? '<1%' : `${top}%`
}

function ShareRow({ result }: { result: RankResult }) {
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-gray-400">{result.label}</span>
      {result.percentile != null ? (
        <span className="text-sm font-semibold text-white tabular-nums">
          Top {topPctLabel(result.percentile)}
        </span>
      ) : (
        <span className="text-xs text-gray-600">—</span>
      )}
    </div>
  )
}

/**
 * Self-contained rank summary card.
 * Accepts a forwarded ref so a parent can target the node for future
 * image capture without importing an export library here.
 */
export const RankShareCard = forwardRef<HTMLDivElement, Props>(
  function RankShareCard({ ranks }, ref) {
    const displayed = SHARE_TYPES
      .map((type) => ranks.find((r) => r.type === type))
      .filter((r): r is RankResult => r != null)

    const dateStr = new Date().toLocaleDateString('en-US', {
      month: 'short', day: 'numeric', year: 'numeric',
    })

    return (
      <div
        ref={ref}
        role="region"
        aria-label="Rank Summary"
        className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-2 min-w-[280px]"
      >
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Summary</p>
          <span className="text-[10px] text-gray-600">{dateStr}</span>
        </div>

        {displayed.length === 0 ? (
          <p className="py-3 text-center text-xs text-gray-600">No rank data available.</p>
        ) : (
          <div className="divide-y divide-surface-border">
            {displayed.map((r) => <ShareRow key={r.type} result={r} />)}
          </div>
        )}

        <p className="pt-1 text-[10px] text-gray-600 leading-relaxed">
          Benchmark-based estimate · not financial advice · Chosen Invest
        </p>
      </div>
    )
  }
)

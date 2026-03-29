'use client'

import { cn } from '@/lib/utils/cn'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import type { RankResult } from '@/lib/types/rank'

interface RankOverviewCardProps {
  rank: RankResult
  ageRank: RankResult
  ageGenderRank: RankResult
  returnRank: RankResult
  totalValue: number
}

function PercentileBar({ percentile, tall }: { percentile: number; tall?: boolean }) {
  const width = `${Math.min(100, Math.max(0, percentile))}%`
  const color =
    percentile >= 75
      ? 'bg-emerald-500'
      : percentile >= 50
        ? 'bg-brand-500'
        : percentile >= 30
          ? 'bg-amber-400'
          : 'bg-gray-500'
  const h = tall ? 'h-3' : 'h-1.5'
  return (
    <div className={cn('relative w-full rounded-full bg-surface-muted', h)}>
      <div
        className={cn('rounded-full transition-all', h, color)}
        style={{ width }}
      />
    </div>
  )
}

function topPctColor(topPct: number): string {
  if (topPct <= 25) return 'text-emerald-400'
  if (topPct <= 50) return 'text-brand-400'
  return 'text-amber-400'
}

function RankTile({ result }: { result: RankResult }) {
  const hasPct = result.percentile != null
  const topPct = hasPct ? 100 - result.percentile! : null

  return (
    <div className="rounded-lg border border-surface-border bg-surface p-4 space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {result.label}
      </p>
      {topPct != null ? (
        <p className={cn('text-2xl font-bold tracking-tight', topPctColor(topPct))}>
          Top {topPct}%
        </p>
      ) : (
        <p className="text-2xl font-bold text-gray-700">—</p>
      )}
      {hasPct ? (
        <PercentileBar percentile={result.percentile!} />
      ) : (
        <div className="h-1.5 w-full rounded-full bg-surface-muted" />
      )}
      <p className="text-[11px] leading-relaxed text-gray-400">{result.message}</p>
    </div>
  )
}

export function RankOverviewCard({ rank, ageRank, ageGenderRank, returnRank, totalValue }: RankOverviewCardProps) {
  const overallTop = rank.percentile != null ? 100 - rank.percentile : null
  const { compact } = useFormatCurrency()

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-6">
      {/* Hero: Overall Wealth Rank */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            Overall Wealth Rank
          </p>
          {overallTop != null ? (
            <p className={cn('text-5xl font-extrabold tracking-tight', topPctColor(overallTop))}>
              Top {overallTop}%
            </p>
          ) : (
            <p className="text-4xl font-bold text-gray-600">—</p>
          )}
          <p className="text-sm text-gray-500">
            {compact(totalValue)} total assets
          </p>
        </div>
        <div className="w-full sm:w-64 space-y-2">
          {rank.percentile != null && (
            <PercentileBar percentile={rank.percentile} tall />
          )}
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>0%</span>
            <span>50%</span>
            <span>100%</span>
          </div>
          <p className="text-xs text-gray-400">{rank.message}</p>
        </div>
      </div>

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Sub-ranks grid */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <RankTile result={ageRank} />
        <RankTile result={ageGenderRank} />
        <RankTile result={returnRank} />
      </div>

      {/* Footer */}
      <p className="text-[10px] text-gray-600 text-center">
        Based on reference benchmark ranges. Not financial advice.
      </p>
    </div>
  )
}

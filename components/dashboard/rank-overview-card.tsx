import { cn } from '@/lib/utils/cn'
import type { RankResult } from '@/lib/types/rank'

interface RankOverviewCardProps {
  rank: RankResult
  ageRank: RankResult
  totalValue: number
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
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
  const h = tall ? 'h-3' : 'h-2'
  return (
    <div className={cn('relative w-full rounded-full bg-surface-muted', h)}>
      <div
        className={cn('rounded-full transition-all', h, color)}
        style={{ width }}
      />
      <div className="mt-1.5 flex justify-between text-[10px] text-gray-600">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

function topPctColor(topPct: number): string {
  if (topPct <= 10) return 'text-emerald-400'
  if (topPct <= 25) return 'text-emerald-400'
  if (topPct <= 50) return 'text-brand-400'
  return 'text-amber-400'
}

export function RankOverviewCard({ rank, ageRank, totalValue }: RankOverviewCardProps) {
  const overallTop = rank.percentile != null ? 100 - rank.percentile : null
  const ageTop = ageRank.percentile != null ? 100 - ageRank.percentile : null

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-6">
      {/* Hero: Overall Wealth Rank */}
      <div className="text-center space-y-3">
        <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
          Your Wealth Rank
        </p>
        {overallTop != null ? (
          <p className={cn('text-5xl font-extrabold tracking-tight', topPctColor(overallTop))}>
            Top {overallTop}%
          </p>
        ) : (
          <p className="text-4xl font-bold text-gray-600">—</p>
        )}
        <p className="text-sm text-gray-400">
          {formatCurrency(totalValue)} total assets
        </p>
      </div>

      {/* Overall bar */}
      {rank.percentile != null && (
        <PercentileBar percentile={rank.percentile} tall />
      )}
      <p className="text-sm leading-relaxed text-gray-400 text-center">{rank.message}</p>

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Age-Based Rank — compact secondary section */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-base font-semibold text-white">{ageRank.label}</p>
          {ageTop != null ? (
            <span className={cn('text-lg font-bold', topPctColor(ageTop))}>
              Top {ageTop}%
            </span>
          ) : (
            <span className="text-sm text-gray-600">—</span>
          )}
        </div>
        {ageRank.percentile != null ? (
          <PercentileBar percentile={ageRank.percentile} />
        ) : (
          <div className="h-2 w-full rounded-full bg-surface-muted" />
        )}
        <p className="text-xs leading-relaxed text-gray-400">{ageRank.message}</p>
      </div>
    </div>
  )
}

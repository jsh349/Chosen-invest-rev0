import { cn } from '@/lib/utils/cn'
import type { RankResult } from '@/lib/types/rank'

interface RankOverviewCardProps {
  rank: RankResult
  totalValue: number
}

function formatCurrency(value: number): string {
  if (value >= 1_000_000) return `$${(value / 1_000_000).toFixed(1)}M`
  if (value >= 1_000) return `$${(value / 1_000).toFixed(0)}K`
  return `$${value.toFixed(0)}`
}

function PercentileBar({ percentile }: { percentile: number }) {
  const width = `${Math.min(100, Math.max(0, percentile))}%`
  const color =
    percentile >= 75
      ? 'bg-emerald-500'
      : percentile >= 50
        ? 'bg-brand-500'
        : percentile >= 30
          ? 'bg-amber-400'
          : 'bg-gray-500'
  return (
    <div className="relative h-2 w-full rounded-full bg-surface-muted">
      <div
        className={cn('h-2 rounded-full transition-all', color)}
        style={{ width }}
      />
      {/* Marker labels */}
      <div className="mt-1 flex justify-between text-[10px] text-gray-600">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

export function RankOverviewCard({ rank, totalValue }: RankOverviewCardProps) {
  const topPct = rank.percentile != null ? 100 - rank.percentile : null

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-4">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Overall Wealth Rank
        </h3>
        <p className="mt-0.5 text-xs text-gray-600">
          Based on local benchmark data
        </p>
      </div>

      {/* Main stat */}
      <div className="flex items-baseline gap-3">
        <span className="text-3xl font-bold text-white">
          {topPct != null ? `Top ${topPct}%` : '—'}
        </span>
        <span className="text-sm text-gray-500">
          {formatCurrency(totalValue)} total assets
        </span>
      </div>

      {/* Percentile bar */}
      {rank.percentile != null && (
        <PercentileBar percentile={rank.percentile} />
      )}

      {/* Message */}
      <p className="text-xs leading-relaxed text-gray-400">{rank.message}</p>
    </div>
  )
}

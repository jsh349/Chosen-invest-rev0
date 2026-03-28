import { cn } from '@/lib/utils/cn'
import type { RankResult } from '@/lib/types/rank'

interface RankOverviewCardProps {
  rank: RankResult
  ageRank: RankResult
  ageGenderRank: RankResult
  returnRank: RankResult
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

function SubRankRow({ result }: { result: RankResult }) {
  const hasPct = result.percentile != null
  const topPct = hasPct ? 100 - result.percentile! : null

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-base font-semibold text-white">{result.label}</p>
        {topPct != null ? (
          <span className={cn('text-lg font-bold', topPctColor(topPct))}>
            Top {topPct}%
          </span>
        ) : (
          <span className="text-sm text-gray-600">—</span>
        )}
      </div>
      {hasPct ? (
        <PercentileBar percentile={result.percentile!} />
      ) : (
        <div className="h-2 w-full rounded-full bg-surface-muted" />
      )}
      <p className="text-xs leading-relaxed text-gray-400">{result.message}</p>
    </div>
  )
}

export function RankOverviewCard({ rank, ageRank, ageGenderRank, returnRank, totalValue }: RankOverviewCardProps) {
  const overallTop = rank.percentile != null ? 100 - rank.percentile : null

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

      {/* Age-Based Rank */}
      <SubRankRow result={ageRank} />

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Age + Gender Rank */}
      <SubRankRow result={ageGenderRank} />

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Investment Return Rank */}
      <SubRankRow result={returnRank} />

      {/* Disclaimer */}
      <p className="text-[10px] text-gray-600 text-center pt-1">
        Rankings based on local benchmark estimates. Not financial advice.
      </p>
    </div>
  )
}

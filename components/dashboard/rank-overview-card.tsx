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
      <div className="mt-1 flex justify-between text-[10px] text-gray-600">
        <span>0%</span>
        <span>50%</span>
        <span>100%</span>
      </div>
    </div>
  )
}

function RankSection({ result, subtitle }: { result: RankResult; subtitle?: string }) {
  const hasPct = result.percentile != null
  const topPct = hasPct ? 100 - result.percentile! : null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{result.label}</p>
        {hasPct ? (
          <span className="text-xs font-semibold text-brand-400">
            Top {topPct}%
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </div>
      {subtitle && <p className="text-xs text-gray-500">{subtitle}</p>}
      {hasPct ? (
        <PercentileBar percentile={result.percentile!} />
      ) : (
        <div className="h-2 w-full rounded-full bg-surface-muted" />
      )}
      <p className="text-xs leading-relaxed text-gray-400">{result.message}</p>
    </div>
  )
}

export function RankOverviewCard({ rank, ageRank, totalValue }: RankOverviewCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-5">
      {/* Header */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Wealth Rank
        </h3>
        <p className="mt-0.5 text-xs text-gray-600">
          {formatCurrency(totalValue)} total assets — compared to local benchmarks
        </p>
      </div>

      {/* Overall Wealth */}
      <RankSection result={rank} />

      {/* Divider */}
      <div className="border-t border-surface-border" />

      {/* Age-Based */}
      <RankSection result={ageRank} />
    </div>
  )
}

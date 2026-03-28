import { cn } from '@/lib/utils/cn'
import type { RankResult } from '@/lib/types/rank'

interface RankOverviewCardProps {
  ranks: RankResult[]
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
    <div className="h-1.5 w-full rounded-full bg-surface-muted">
      <div
        className={cn('h-1.5 rounded-full transition-all', color)}
        style={{ width }}
      />
    </div>
  )
}

function RankItem({ rank }: { rank: RankResult }) {
  const hasPct = rank.percentile != null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium text-white">{rank.label}</p>
        {hasPct ? (
          <span className="text-xs font-semibold text-brand-400">
            {rank.percentile}th
          </span>
        ) : (
          <span className="text-xs text-gray-600">—</span>
        )}
      </div>
      {hasPct ? (
        <PercentileBar percentile={rank.percentile!} />
      ) : (
        <div className="h-1.5 w-full rounded-full bg-surface-muted" />
      )}
      <p className="text-xs text-gray-400">{rank.message}</p>
    </div>
  )
}

export function RankOverviewCard({ ranks }: RankOverviewCardProps) {
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-5 space-y-1">
      <div className="mb-4">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Wealth Rank
        </h3>
        <p className="mt-0.5 text-xs text-gray-600">
          How you compare — based on local benchmark data
        </p>
      </div>
      <div className="space-y-4">
        {ranks.map((r) => (
          <RankItem key={r.type} rank={r} />
        ))}
      </div>
    </div>
  )
}

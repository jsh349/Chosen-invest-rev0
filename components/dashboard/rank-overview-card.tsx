'use client'

import Link from 'next/link'
import { cn } from '@/lib/utils/cn'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { percentileColor } from '@/lib/utils/rank-format'
import { ROUTES } from '@/lib/constants/routes'
import type { RankResult } from '@/lib/types/rank'
import { getPrimaryRank } from '@/lib/utils/rank-priority'

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

function RankTile({ result }: { result: RankResult }) {
  const hasPct = result.percentile != null
  const topPct = hasPct ? 100 - result.percentile! : null

  return (
    <div className="rounded-lg border border-surface-border bg-surface p-4 space-y-2.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {result.label}
      </p>
      {topPct != null ? (
        <p className={cn('text-2xl font-bold tracking-tight', percentileColor(100 - topPct))}>
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
      <p className={cn('text-[11px] leading-relaxed', hasPct ? 'text-gray-400' : 'text-gray-500')}>{result.message}</p>
    </div>
  )
}

export function RankOverviewCard({ rank, ageRank, ageGenderRank, returnRank, totalValue }: RankOverviewCardProps) {
  const primary = getPrimaryRank([rank, ageRank, ageGenderRank, returnRank])
  const heroTop = primary?.percentile != null ? 100 - primary.percentile : null
  const { compact } = useFormatCurrency()

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card p-6 space-y-6">
      {/* Hero: highest-priority rank with a real percentile */}
      <div className="flex flex-col items-center gap-4 sm:flex-row sm:items-center sm:gap-8">
        <div className="flex-1 text-center sm:text-left space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-gray-500">
            {primary?.label ?? 'Overall Wealth Rank'}
          </p>
          {heroTop != null ? (
            <p className={cn('text-5xl font-extrabold tracking-tight', percentileColor(100 - heroTop))}>
              Top {heroTop}%
            </p>
          ) : (
            <p className="text-4xl font-bold text-gray-600">—</p>
          )}
          <p className="text-sm text-gray-500">
            {compact(totalValue)} total assets
          </p>
        </div>
        <div className="w-full sm:w-64 space-y-2">
          {primary?.percentile != null && (
            <PercentileBar percentile={primary.percentile} tall />
          )}
          <div className="flex justify-between text-[10px] text-gray-600">
            <span>0th</span>
            <span>50th</span>
            <span>100th</span>
          </div>
          <p className="text-xs text-gray-400">{primary?.message}</p>
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
      <div className="flex items-center justify-between gap-4">
        <p className="text-[10px] text-gray-600">
          Estimate · not financial advice · Chosen Invest
        </p>
        <Link
          href={ROUTES.rank}
          className="shrink-0 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          Full comparison report →
        </Link>
      </div>
    </div>
  )
}

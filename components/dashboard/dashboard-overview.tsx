'use client'

import type { PortfolioSummary } from '@/lib/types/dashboard'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { Card } from '@/components/ui/card'

interface DashboardOverviewProps {
  summary: PortfolioSummary
}

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  const { totalAssetValue, assetCount, categoryBreakdown, largestAsset, hasMixedCurrencies } = summary
  const topCategory = categoryBreakdown[0]
  const { fmt } = useFormatCurrency()

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Total Assets</p>
        <p className="text-2xl font-bold text-white">
          {fmt(totalAssetValue)}
        </p>
        {hasMixedCurrencies
          ? <p className="text-xs text-yellow-500/80">Multi-currency — total not normalized</p>
          : <p className="text-xs text-gray-500">Across {assetCount} positions</p>
        }
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Asset Count</p>
        <p className="text-2xl font-bold text-white">{assetCount}</p>
        <p className="text-xs text-gray-500">
          {categoryBreakdown.length} categor{categoryBreakdown.length === 1 ? 'y' : 'ies'}
        </p>
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Largest Category</p>
        <p className="text-2xl font-bold text-white">
          {topCategory?.label ?? '—'}
        </p>
        <p className="text-xs text-gray-500">
          {topCategory ? `by value · ${topCategory.percentage.toFixed(0)}% of portfolio` : 'No data yet'}
        </p>
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Largest Asset</p>
        <p className="truncate text-2xl font-bold text-white">
          {largestAsset ? fmt(largestAsset.value) : '—'}
        </p>
        <p className="truncate text-xs text-gray-500">
          {largestAsset?.name ?? 'No data yet'}
        </p>
      </Card>
    </div>
  )
}

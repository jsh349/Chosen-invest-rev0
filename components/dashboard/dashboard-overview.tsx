import type { PortfolioSummary } from '@/lib/types/dashboard'
import { formatCurrency } from '@/lib/utils/currency'
import { Card } from '@/components/ui/card'

interface DashboardOverviewProps {
  summary: PortfolioSummary
}

export function DashboardOverview({ summary }: DashboardOverviewProps) {
  const { totalAssetValue, assetCount, categoryBreakdown } = summary
  const topCategory = categoryBreakdown[0]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Total Assets</p>
        <p className="text-2xl font-bold text-white">
          {formatCurrency(totalAssetValue)}
        </p>
        <p className="text-xs text-gray-500">Across {assetCount} positions</p>
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Asset Count</p>
        <p className="text-2xl font-bold text-white">{assetCount}</p>
        <p className="text-xs text-gray-500">
          {categoryBreakdown.length} categor{categoryBreakdown.length === 1 ? 'y' : 'ies'}
        </p>
      </Card>

      <Card className="flex flex-col gap-1">
        <p className="text-xs uppercase tracking-wide text-gray-500">Top Category</p>
        <p className="text-2xl font-bold text-white">
          {topCategory?.label ?? '—'}
        </p>
        <p className="text-xs text-gray-500">
          {topCategory ? `${topCategory.percentage.toFixed(0)}% of portfolio` : 'No data yet'}
        </p>
      </Card>
    </div>
  )
}

'use client'

import Link from 'next/link'
import { PlusCircle, BarChart2 } from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { AllocationChartCard } from '@/components/dashboard/allocation-chart-card'
import { AISummaryCard } from '@/components/dashboard/ai-summary-card'
import { HealthCardsGrid } from '@/components/dashboard/health-cards-grid'
import { PortfolioStatusCard } from '@/components/dashboard/portfolio-status-card'
import { GoalsSummaryCard } from '@/components/dashboard/goals-summary-card'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { NetWorthTrendCard } from '@/components/dashboard/net-worth-trend-card'
import { TransactionSummaryCard } from '@/components/dashboard/transaction-summary-card'
import { TaxOpportunityCard } from '@/components/dashboard/tax-opportunity-card'
import { CashFlowInsightCard } from '@/components/dashboard/cash-flow-insight-card'
import { useAssets } from '@/lib/store/assets-store'
import { useGoals } from '@/lib/store/goals-store'
import { useTransactions } from '@/lib/store/transactions-store'
import { buildMockTrend } from '@/lib/mock/trend'
import { ROUTES } from '@/lib/constants/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

function EmptyState() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-card">
        <BarChart2 className="h-6 w-6 text-gray-500" />
      </div>
      <h2 className="mb-2 text-lg font-semibold text-white">No assets yet</h2>
      <p className="mb-6 max-w-xs text-sm text-gray-500">
        Add your assets to see your portfolio summary, allocation breakdown, and health signals.
      </p>
      <Link href={ROUTES.portfolioInput} className={buttonVariants({ size: 'lg' })}>
        <PlusCircle className="h-4 w-4" />
        Add Your First Asset
      </Link>
    </div>
  )
}

export default function DashboardPage() {
  const { assets, hasCustomAssets, isLoaded } = useAssets()
  const { hasGoals } = useGoals()
  const { transactions } = useTransactions()

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  if (!hasCustomAssets) {
    return <EmptyState />
  }

  const summary = buildPortfolioSummary('local_user', assets)
  const healthCards = generateHealthCards(summary)

  const netCashFlow = transactions.length > 0
    ? transactions.reduce((sum, t) => sum + t.amount, 0)
    : null
  const aiAnalysis = generateAISummary(summary, { hasGoals, netCashFlow })

  const trendData = buildMockTrend(summary.totalAssetValue)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Your portfolio overview and financial health signals
          </p>
        </div>
        <Link
          href={ROUTES.portfolioInput}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
        >
          <PlusCircle className="h-4 w-4" />
          Edit Assets
        </Link>
      </div>

      <DashboardOverview summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AllocationChartCard slices={summary.categoryBreakdown} />
        <div className="flex flex-col gap-6">
          <PortfolioStatusCard summary={summary} />
          <AISummaryCard analysis={aiAnalysis} />
        </div>
      </div>

      <NetWorthTrendCard data={trendData} isMock />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Financial Health
        </h2>
        <HealthCardsGrid cards={healthCards} />
      </div>

      <GoalsSummaryCard />

      <TransactionSummaryCard />

      <CashFlowInsightCard />

      <TaxOpportunityCard assets={assets} />
    </div>
  )
}

'use client'

import Link from 'next/link'
import { PlusCircle } from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { AllocationChartCard } from '@/components/dashboard/allocation-chart-card'
import { AISummaryCard } from '@/components/dashboard/ai-summary-card'
import { HealthCardsGrid } from '@/components/dashboard/health-cards-grid'
import { PortfolioStatusCard } from '@/components/dashboard/portfolio-status-card'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { NetWorthTrendCard } from '@/components/dashboard/net-worth-trend-card'
import { useAssets } from '@/lib/store/assets-store'
import { MOCK_ASSETS } from '@/lib/mock/assets'
import { buildMockTrend } from '@/lib/mock/trend'
import { ROUTES } from '@/lib/constants/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

export default function DashboardPage() {
  const { assets, hasCustomAssets, isLoaded } = useAssets()

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const activeAssets = hasCustomAssets ? assets : MOCK_ASSETS
  const isDemoMode = !hasCustomAssets

  const summary = buildPortfolioSummary('local_user', activeAssets)
  const healthCards = generateHealthCards(summary)
  const aiAnalysis = generateAISummary(summary)
  const trendData = buildMockTrend(summary.totalAssetValue)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isDemoMode
              ? 'Demo data — add your own assets to see your real picture'
              : 'Your portfolio overview and financial health signals'}
          </p>
        </div>
        <Link
          href={ROUTES.portfolioInput}
          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
        >
          <PlusCircle className="h-4 w-4" />
          {hasCustomAssets ? 'Edit Assets' : 'Add Assets'}
        </Link>
      </div>

      {isDemoMode && (
        <div className="flex items-center justify-between rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3">
          <p className="text-sm text-amber-400">
            Showing demo data. Add your own assets to see your real dashboard.
          </p>
          <Link
            href={ROUTES.portfolioInput}
            className={buttonVariants({ size: 'sm' })}
          >
            Get Started
          </Link>
        </div>
      )}

      <DashboardOverview summary={summary} />

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AllocationChartCard slices={summary.categoryBreakdown} />
        <div className="flex flex-col gap-6">
          <PortfolioStatusCard summary={summary} />
          <AISummaryCard analysis={aiAnalysis} />
        </div>
      </div>

      <NetWorthTrendCard data={trendData} isMock={isDemoMode} />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Financial Health
        </h2>
        <HealthCardsGrid cards={healthCards} />
      </div>
    </div>
  )
}

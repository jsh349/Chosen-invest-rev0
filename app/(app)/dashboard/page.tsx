'use client'

import { useState, useMemo } from 'react'
import Link from 'next/link'
import { PlusCircle, BarChart2, SlidersHorizontal, Trophy } from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { AllocationChartCard } from '@/components/dashboard/allocation-chart-card'
import { AISummaryCard } from '@/components/dashboard/ai-summary-card'
import { HealthCardsGrid } from '@/components/dashboard/health-cards-grid'
import { PortfolioStatusCard } from '@/components/dashboard/portfolio-status-card'
import { GoalsSummaryCard } from '@/components/dashboard/goals-summary-card'
import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { buildAdvisorContext } from '@/features/ai/advisor-context'
import { NetWorthTrendCard } from '@/components/dashboard/net-worth-trend-card'
import { TransactionSummaryCard } from '@/components/dashboard/transaction-summary-card'
import { TaxOpportunityCard } from '@/components/dashboard/tax-opportunity-card'
import { CashFlowInsightCard } from '@/components/dashboard/cash-flow-insight-card'
import { RankOverviewCard } from '@/components/dashboard/rank-overview-card'
import { computeOverallWealthRank, computeAgeBasedRank, computeAgeGenderRank, computeReturnRank } from '@/features/dashboard/rank'
import { getCurrencySymbol } from '@/lib/utils/currency'
import { useAssets } from '@/lib/store/assets-store'
import { useGoals } from '@/lib/store/goals-store'
import { useTransactions } from '@/lib/store/transactions-store'
import { useDashboardPrefs, CARD_LABELS, type DashboardCardKey } from '@/lib/store/dashboard-prefs-store'
import { buildMockTrend } from '@/lib/mock/trend'
import { ROUTES } from '@/lib/constants/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSettings } from '@/lib/store/settings-store'

const CARD_KEYS = Object.keys(CARD_LABELS) as DashboardCardKey[]

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
      <div className="mt-8 flex items-start gap-3 rounded-xl border border-surface-border bg-surface-card px-4 py-3 text-left max-w-xs">
        <Trophy className="mt-0.5 h-4 w-4 shrink-0 text-brand-400" />
        <p className="text-xs text-gray-400 leading-relaxed">
          Once your portfolio is set up, you can compare your wealth position against benchmark ranges using the{' '}
          <Link href={ROUTES.rank} className="text-brand-400 hover:text-brand-300 transition-colors">
            Wealth Rank
          </Link>{' '}
          feature.
        </p>
      </div>
    </div>
  )
}

export default function DashboardPage() {
  const { assets, hasCustomAssets, isLoaded } = useAssets()
  const { goals, isLoaded: goalsLoaded } = useGoals()
  const { transactions, isLoaded: txLoaded } = useTransactions()
  const { prefs, isLoaded: prefsLoaded, toggle } = useDashboardPrefs()
  const { settings, isLoaded: settingsLoaded } = useSettings()
  const [showPrefs, setShowPrefs] = useState(false)

  // All hooks must run unconditionally before any early return (Rules of Hooks).
  // These computations are safe with empty arrays while data is loading.
  const baseCtx = useMemo(
    () => buildAdvisorContext(assets, goals, transactions),
    [assets, goals, transactions]
  )
  const summary = baseCtx.portfolio
  const healthCards = useMemo(() => generateHealthCards(summary), [summary])
  const trendData = useMemo(() => buildMockTrend(summary.totalAssetValue), [summary.totalAssetValue])
  const userAge = useMemo(
    () => settings.birthYear ? new Date().getFullYear() - settings.birthYear : undefined,
    [settings.birthYear]
  )
  const overallRank = useMemo(() => computeOverallWealthRank(summary.totalAssetValue), [summary.totalAssetValue])
  const ageRank = useMemo(() => computeAgeBasedRank(summary.totalAssetValue, userAge), [summary.totalAssetValue, userAge])
  const ageGenderRank = useMemo(() => computeAgeGenderRank(summary.totalAssetValue, userAge, settings.gender), [summary.totalAssetValue, userAge, settings.gender])
  const returnRank = useMemo(() => computeReturnRank(settings.annualReturnPct), [settings.annualReturnPct])
  const aiAnalysis = useMemo(
    () => generateAISummary({
      ...baseCtx,
      rankSummary: {
        overallPercentile: overallRank.percentile,
        agePercentile: ageRank.percentile,
        returnPercentile: returnRank.percentile,
      },
      currencySymbol: getCurrencySymbol(settings.currency),
      showCents: settings.showCents,
    }),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [baseCtx, overallRank.percentile, ageRank.percentile, returnRank.percentile, settings.currency, settings.showCents]
  )

  if (!isLoaded || !prefsLoaded || !goalsLoaded || !txLoaded || !settingsLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  if (!hasCustomAssets) {
    return <EmptyState />
  }

  const show = (key: DashboardCardKey) => prefs[key]

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Dashboard</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            Your portfolio overview and financial health signals
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowPrefs((v) => !v)}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
            aria-label="Customize dashboard"
          >
            <SlidersHorizontal className="h-4 w-4" />
            Customize
          </button>
          <Link
            href={ROUTES.portfolioInput}
            className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-2')}
          >
            <PlusCircle className="h-4 w-4" />
            Edit Assets
          </Link>
        </div>
      </div>

      {/* Compact preferences panel */}
      {showPrefs && (
        <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Visible Cards</p>
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
            {CARD_KEYS.map((key) => (
              <label key={key} className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={prefs[key]}
                  onChange={() => toggle(key)}
                  className="h-4 w-4 rounded border-surface-border accent-brand-500"
                />
                <span className="text-xs text-gray-300">{CARD_LABELS[key]}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      <DashboardOverview summary={summary} />

      {show('rank') && <RankOverviewCard rank={overallRank} ageRank={ageRank} ageGenderRank={ageGenderRank} returnRank={returnRank} totalValue={summary.totalAssetValue} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {show('allocation') && <AllocationChartCard slices={summary.categoryBreakdown} />}
        <div className="flex flex-col gap-6">
          {show('portfolioStatus') && <PortfolioStatusCard summary={summary} />}
          {show('advisor') && <AISummaryCard analysis={aiAnalysis} />}
        </div>
      </div>

      <NetWorthTrendCard data={trendData} isMock />

      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Financial Health
        </h2>
        <HealthCardsGrid cards={healthCards} />
      </div>

      {show('goals') && <GoalsSummaryCard />}
      {show('transactions') && <TransactionSummaryCard />}
      {show('cashFlowInsight') && <CashFlowInsightCard />}
      {show('taxOpportunity') && <TaxOpportunityCard assets={assets} />}
    </div>
  )
}

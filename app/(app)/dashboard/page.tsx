'use client'

import { useState, useMemo, useEffect, Suspense, lazy } from 'react'
import Link from 'next/link'
import { PlusCircle, BarChart2, SlidersHorizontal, Trophy, Info } from 'lucide-react'
import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
// Lazy-loaded so the AI section is code-split and wrapped in a Suspense
// boundary — one slow or failing AI render cannot block the rest of the page.
const AISummaryCard = lazy(() => import('@/components/dashboard/ai-summary-card'))
import { HealthCardsGrid } from '@/components/dashboard/health-cards-grid'
import { PortfolioStatusCard } from '@/components/dashboard/portfolio-status-card'
import { GoalsSummaryCard } from '@/components/dashboard/goals-summary-card'
import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { buildAdvisorContext } from '@/features/ai/advisor-context'
// ssr: false — chart cards use DOM-dependent rendering paths and are
// conditionally visible. Dynamic loading defers their JS chunks to client,
// so hidden cards never contribute to initial parse cost.
import dynamic from 'next/dynamic'
const AllocationChartCard = dynamic(
  () => import('@/components/dashboard/allocation-chart-card').then((m) => ({ default: m.AllocationChartCard })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-5 animate-pulse">
        <div className="mb-4 h-4 w-28 rounded bg-surface-border" />
        <div className="space-y-3">
          <div className="h-3 w-full rounded bg-surface-border" />
          <div className="h-3 w-4/5 rounded bg-surface-border" />
          <div className="h-3 w-3/5 rounded bg-surface-border" />
        </div>
      </div>
    ),
  },
)
const NetWorthTrendCard = dynamic(
  () => import('@/components/dashboard/net-worth-trend-card').then((m) => ({ default: m.NetWorthTrendCard })),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-2xl border border-surface-border bg-surface-card p-5 animate-pulse">
        <div className="mb-4 h-4 w-36 rounded bg-surface-border" />
        <div className="h-32 rounded bg-surface-border" />
      </div>
    ),
  },
)
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
import '@/lib/mock/guard'
import { buildMockTrend } from '@/lib/mock/trend'
import { ROUTES } from '@/lib/constants/routes'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useSettings } from '@/lib/store/settings-store'
import { useCurrentUserId } from '@/lib/hooks/use-current-user-id'

const CARD_KEYS = Object.keys(CARD_LABELS) as DashboardCardKey[]

// Shown while AISummaryCard's lazy chunk is loading or while the AI
// computation suspends in a future async integration.
function AISummarySkeleton() {
  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-5 animate-pulse">
      <div className="mb-4 h-4 w-28 rounded bg-surface-border" />
      <div className="space-y-2">
        <div className="h-3 w-full rounded bg-surface-border" />
        <div className="h-3 w-4/5 rounded bg-surface-border" />
        <div className="h-3 w-3/5 rounded bg-surface-border" />
      </div>
    </div>
  )
}

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
  const { assets, hasCustomAssets, isLoaded, isLoadError } = useAssets()
  const { goals, isLoaded: goalsLoaded, isLoadError: goalsLoadError } = useGoals()
  const { transactions, isLoaded: txLoaded, isLoadError: txLoadError } = useTransactions()
  const { prefs, isLoaded: prefsLoaded, toggle } = useDashboardPrefs()
  const { settings, isLoaded: settingsLoaded } = useSettings()
  const currentUserId = useCurrentUserId()
  const [showPrefs, setShowPrefs] = useState(false)

  // All hooks must run unconditionally before any early return (Rules of Hooks).
  // These computations are safe with empty arrays while data is loading.
  const baseCtx = useMemo(
    () => buildAdvisorContext(assets, goals, transactions, currentUserId),
    [assets, goals, transactions, currentUserId]
  )
  const summary = baseCtx.portfolio
  const trendData = useMemo(() => buildMockTrend(summary.totalAssetValue), [summary.totalAssetValue])
  const userAge = useMemo(
    () => settings.birthYear ? new Date().getFullYear() - settings.birthYear : undefined,
    [settings.birthYear]
  )
  const overallRank = useMemo(() => computeOverallWealthRank(summary.totalAssetValue), [summary.totalAssetValue])
  const ageRank = useMemo(() => computeAgeBasedRank(summary.totalAssetValue, userAge), [summary.totalAssetValue, userAge])
  const ageGenderRank = useMemo(() => computeAgeGenderRank(summary.totalAssetValue, userAge, settings.gender), [summary.totalAssetValue, userAge, settings.gender])
  const returnRank = useMemo(() => computeReturnRank(settings.annualReturnPct), [settings.annualReturnPct])

  // Health cards and AI summary are co-derived from the same portfolio snapshot
  // in a single useMemo. This guarantees both surfaces always reflect the same
  // input data: a change to portfolio, rank, or settings triggers a single
  // atomic re-computation of both rather than two independent re-renders that
  // could briefly be out of sync.
  const { healthCards, computedAiAnalysis } = useMemo(() => {
    const cards = generateHealthCards(summary)
    let analysis
    try {
      analysis = generateAISummary({
        ...baseCtx,
        rankSummary: {
          overallPercentile: overallRank.percentile,
          agePercentile: ageRank.percentile,
          returnPercentile: returnRank.percentile,
        },
        currencySymbol: getCurrencySymbol(settings.currency),
        showCents: settings.showCents,
      })
    } catch {
      analysis = {
        userId: baseCtx.portfolio.userId,
        summaryText: 'Your summary is temporarily unavailable. Your portfolio data is still accessible above.',
        keyPoints: [],
        suggestedActions: [{ label: 'View portfolio details', href: ROUTES.portfolioList }],
        inputSnapshot: { totalValue: summary.totalAssetValue, assetCount: summary.assetCount, topCategory: summary.categoryBreakdown[0]?.label ?? '' },
        generatedAt: new Date().toISOString(),
      }
    }
    return { healthCards: cards, computedAiAnalysis: analysis }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [baseCtx, overallRank.percentile, ageRank.percentile, returnRank.percentile, settings.currency, settings.showCents])

  // Defer the AI summary render to a useEffect so health cards and the rest of
  // the dashboard paint first. The skeleton shows for one frame, then the effect
  // fires and the AI card appears. When generateAISummary becomes truly async
  // (real Gemini call), make this effect async — the skeleton stays until resolved.
  const [aiAnalysis, setAiAnalysis] = useState<typeof computedAiAnalysis | null>(null)
  useEffect(() => {
    setAiAnalysis(computedAiAnalysis)
  }, [computedAiAnalysis])

  if (!isLoaded || !prefsLoaded || !goalsLoaded || !txLoaded || !settingsLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  if (isLoadError || goalsLoadError || txLoadError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
        <p className="text-sm font-medium text-gray-400">Failed to load your data</p>
        <p className="mt-1 text-xs text-gray-600">Check your connection and try refreshing the page.</p>
      </div>
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

      {/* Preview disclosure — data is stored locally, not yet synced to cloud */}
      <div className="flex items-start gap-2 rounded-lg border border-yellow-900/40 bg-yellow-950/30 px-3 py-2.5 text-xs text-yellow-300/80">
        <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-yellow-400/70" />
        <span>
          <strong className="font-medium text-yellow-200/90">Preview mode</strong>
          {' '}— your data is saved in this browser only and is not yet synced to the cloud.
          Values shown are based on the assets you have entered.
        </span>
      </div>

      <DashboardOverview summary={summary} />

      {show('rank') && <RankOverviewCard rank={overallRank} ageRank={ageRank} ageGenderRank={ageGenderRank} returnRank={returnRank} totalValue={summary.totalAssetValue} />}

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {show('allocation') && <AllocationChartCard slices={summary.categoryBreakdown} />}
        <div className="flex flex-col gap-6">
          {show('portfolioStatus') && <PortfolioStatusCard summary={summary} />}
          {show('advisor') && (
            // aiAnalysis is null on the first render frame (deferred via useEffect)
            // so the skeleton shows while health cards and other sections paint first.
            <Suspense fallback={<AISummarySkeleton />}>
              {aiAnalysis ? (
                <AISummaryCard analysis={aiAnalysis} />
              ) : (
                <AISummarySkeleton />
              )}
            </Suspense>
          )}
        </div>
      </div>

      <NetWorthTrendCard data={trendData} isMock />

      <div>
        <div className="mb-3 flex items-baseline justify-between gap-4">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            Financial Health
          </h2>
          <span className="text-xs text-gray-600 shrink-0">
            Simplified signals · not financial advice
          </span>
        </div>
        <HealthCardsGrid cards={healthCards} />
      </div>

      {show('goals') && <GoalsSummaryCard />}
      {show('transactions') && <TransactionSummaryCard />}
      {show('cashFlowInsight') && <CashFlowInsightCard />}
      {show('taxOpportunity') && <TaxOpportunityCard assets={assets} />}
    </div>
  )
}

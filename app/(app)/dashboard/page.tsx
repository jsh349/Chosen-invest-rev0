import { DashboardOverview } from '@/components/dashboard/dashboard-overview'
import { AllocationChartCard } from '@/components/dashboard/allocation-chart-card'
import { AISummaryCard } from '@/components/dashboard/ai-summary-card'
import { HealthCardsGrid } from '@/components/dashboard/health-cards-grid'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { MOCK_ASSETS } from '@/lib/mock/assets'
import { MOCK_USER } from '@/lib/mock/user'

export default function DashboardPage() {
  const summary = buildPortfolioSummary(MOCK_USER.id, MOCK_ASSETS)
  const healthCards = generateHealthCards(summary)
  const aiAnalysis = generateAISummary(summary)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Dashboard</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Your portfolio overview and financial health signals
        </p>
      </div>

      {/* Overview metrics */}
      <DashboardOverview summary={summary} />

      {/* Chart + AI side by side on large screens */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <AllocationChartCard slices={summary.categoryBreakdown} />
        <AISummaryCard analysis={aiAnalysis} />
      </div>

      {/* Health cards */}
      <div>
        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
          Financial Health
        </h2>
        <HealthCardsGrid cards={healthCards} />
      </div>
    </div>
  )
}

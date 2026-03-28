import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { FinancialHealthCard, HealthStatus } from '@/lib/types/health-card'

function statusFromScore(score: number): HealthStatus {
  if (score >= 70) return 'good'
  if (score >= 50) return 'warning'
  return 'attention'
}

export function generateHealthCards(summary: PortfolioSummary): FinancialHealthCard[] {
  const now = new Date().toISOString()
  const { categoryBreakdown, totalAssetValue, assetCount } = summary

  // Diversification: number of categories
  const categoryCount = categoryBreakdown.length
  const diversificationScore = Math.min(100, categoryCount * 16)
  const diversificationMessage =
    categoryCount >= 5
      ? `Assets spread across ${categoryCount} categories. Solid foundation.`
      : categoryCount >= 3
      ? `${categoryCount} asset categories — consider broadening exposure.`
      : `Only ${categoryCount} category. Portfolio needs more diversification.`

  // Concentration: largest single category %
  const topSlice = categoryBreakdown[0]
  const topPct = topSlice?.percentage ?? 0
  const concentrationScore = topPct > 60 ? 30 : topPct > 40 ? 55 : 80
  const concentrationMessage =
    !topSlice
      ? 'Add assets to see concentration analysis.'
      : topPct > 60
      ? `${topSlice.label} is ${topPct.toFixed(0)}% of total. High concentration risk.`
      : topPct > 40
      ? `${topSlice.label} is ${topPct.toFixed(0)}% of total. Single-asset dominance to watch.`
      : 'No single category dominates. Concentration looks healthy.'

  // Liquidity: cash %
  const cashSlice = categoryBreakdown.find((s) => s.category === 'cash')
  const cashPct = cashSlice?.percentage ?? 0
  const liquidityScore = cashPct >= 10 ? 80 : cashPct >= 5 ? 55 : 35
  const liquidityMessage =
    cashPct >= 10
      ? `Cash is ${cashPct.toFixed(0)}% of portfolio. Good liquidity buffer.`
      : cashPct >= 5
      ? `Cash is ${cashPct.toFixed(0)}%. Consider building a stronger emergency fund.`
      : `Cash is under 5%. Low liquidity could be a risk in an emergency.`

  // Balance: mix of stable + growth
  const hasRetirement = categoryBreakdown.some((s) => s.category === 'retirement')
  const hasGrowth = categoryBreakdown.some(
    (s) => s.category === 'stock' || s.category === 'etf'
  )
  const balanceScore = hasRetirement && hasGrowth ? 80 : hasGrowth || hasRetirement ? 60 : 40
  const balanceMessage =
    hasRetirement && hasGrowth
      ? 'Mix of growth assets and stable holdings looks healthy.'
      : hasGrowth
      ? 'Good growth exposure. Adding retirement savings would improve long-term balance.'
      : hasRetirement
      ? 'Retirement savings present. Adding growth assets would improve returns.'
      : 'Portfolio lacks both growth and retirement assets. Review allocation priorities.'

  return [
    {
      key: 'diversification',
      title: 'Diversification',
      status: statusFromScore(diversificationScore),
      message: diversificationMessage,
      score: diversificationScore,
      generatedAt: now,
    },
    {
      key: 'concentration',
      title: 'Concentration Risk',
      status: statusFromScore(concentrationScore),
      message: concentrationMessage,
      score: concentrationScore,
      generatedAt: now,
    },
    {
      key: 'liquidity',
      title: 'Liquidity',
      status: statusFromScore(liquidityScore),
      message: liquidityMessage,
      score: liquidityScore,
      generatedAt: now,
    },
    {
      key: 'balance',
      title: 'Growth Balance',
      status: statusFromScore(balanceScore),
      message: balanceMessage,
      score: balanceScore,
      generatedAt: now,
    },
  ]
}

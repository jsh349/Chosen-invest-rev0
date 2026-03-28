import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { AIAnalysisResult } from '@/lib/types/dashboard'

export function generateAISummary(summary: PortfolioSummary): AIAnalysisResult {
  const { categoryBreakdown, totalAssetValue, assetCount, userId } = summary
  const topCategory = categoryBreakdown[0]
  const topPct = topCategory?.percentage ?? 0

  const lines: string[] = []
  const keyPoints: string[] = []

  // Opening
  if (assetCount === 0) {
    lines.push('No assets recorded yet. Add your portfolio to receive a personalized summary.')
    return {
      userId,
      summaryText: lines.join(' '),
      keyPoints: [],
      inputSnapshot: { totalValue: 0, assetCount: 0, topCategory: '' },
      generatedAt: new Date().toISOString(),
    }
  }

  // Main overview
  lines.push(
    `Your portfolio holds ${assetCount} asset${assetCount > 1 ? 's' : ''} with a total value of $${(totalAssetValue / 1000).toFixed(0)}K.`
  )

  // Top category commentary
  if (topCategory) {
    if (topPct > 60) {
      lines.push(
        `${topCategory.label} is your dominant position at ${topPct.toFixed(0)}%, which introduces concentration risk.`
      )
      keyPoints.push(`High ${topCategory.label} concentration — review exposure`)
    } else if (topPct > 35) {
      lines.push(
        `${topCategory.label} is your largest holding at ${topPct.toFixed(0)}%, providing a meaningful anchor to your portfolio.`
      )
      keyPoints.push(`${topCategory.label} anchors your portfolio`)
    } else {
      lines.push('No single asset class dominates — your allocation is well spread.')
      keyPoints.push('Well-spread allocation')
    }
  }

  // Retirement signal
  const hasRetirement = categoryBreakdown.some((s) => s.category === 'retirement')
  if (hasRetirement) {
    const ret = categoryBreakdown.find((s) => s.category === 'retirement')!
    lines.push(`Retirement savings are present at ${ret.percentage.toFixed(0)}% — a strong long-term foundation.`)
    keyPoints.push(`Retirement at ${ret.percentage.toFixed(0)}% — solid base`)
  } else {
    lines.push('No retirement assets detected. Adding retirement savings can significantly improve long-term security.')
    keyPoints.push('No retirement savings — consider adding')
  }

  // Cash signal
  const cashSlice = categoryBreakdown.find((s) => s.category === 'cash')
  if (cashSlice && cashSlice.percentage >= 10) {
    keyPoints.push('Good cash liquidity buffer')
  } else if (!cashSlice || cashSlice.percentage < 5) {
    lines.push('Cash reserves are low. A larger liquidity buffer would improve your ability to handle unexpected expenses.')
    keyPoints.push('Low cash — consider building emergency fund')
  }

  // Closing
  lines.push('Review your allocation regularly as your goals and circumstances evolve.')

  return {
    userId,
    summaryText: lines.join(' '),
    keyPoints,
    inputSnapshot: {
      totalValue: totalAssetValue,
      assetCount,
      topCategory: topCategory?.label ?? '',
    },
    generatedAt: new Date().toISOString(),
  }
}

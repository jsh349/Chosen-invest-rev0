import type { PortfolioSummary, AIAnalysisResult, SuggestedAction } from '@/lib/types/dashboard'

export type AISummaryContext = {
  hasGoals: boolean
  netCashFlow: number | null  // null = no transaction data
}

export function generateAISummary(
  summary: PortfolioSummary,
  context: AISummaryContext = { hasGoals: false, netCashFlow: null },
): AIAnalysisResult {
  const { categoryBreakdown, totalAssetValue, assetCount, userId } = summary
  const { hasGoals, netCashFlow } = context
  const topCategory = categoryBreakdown[0]
  const topPct = topCategory?.percentage ?? 0

  const lines: string[] = []
  const keyPoints: string[] = []
  const actions: SuggestedAction[] = []

  // Opening — no assets
  if (assetCount === 0) {
    lines.push('No assets recorded yet. Add your portfolio to receive a personalized summary.')
    return {
      userId,
      summaryText: lines.join(' '),
      keyPoints: ['Start by adding your assets in the Portfolio section'],
      suggestedActions: [{ label: 'Add your first asset', href: '/portfolio/input' }],
      inputSnapshot: { totalValue: 0, assetCount: 0, topCategory: '' },
      generatedAt: new Date().toISOString(),
    }
  }

  // Only-cash portfolio
  if (categoryBreakdown.length === 1 && topCategory?.category === 'cash') {
    return {
      userId,
      summaryText: `Your portfolio is entirely in cash. While this provides safety, consider diversifying into investments, retirement, or other asset classes to build long-term growth.`,
      keyPoints: ['100% cash — consider broader asset planning', 'No growth or income assets detected'],
      suggestedActions: [{ label: 'Edit your assets', href: '/portfolio/input' }],
      inputSnapshot: { totalValue: totalAssetValue, assetCount, topCategory: topCategory.label },
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

  // Goal signal
  if (!hasGoals) {
    keyPoints.push('No goals set — consider adding financial goals to stay on track')
  } else {
    keyPoints.push('Financial goals are set — keep monitoring progress')
  }

  // Cash flow signal
  if (netCashFlow !== null) {
    if (netCashFlow < 0) {
      lines.push('Your recorded transactions show negative net cash flow this month. Review spending to ease pressure on your portfolio.')
      keyPoints.push('Negative cash flow this month — review expenses')
    } else if (netCashFlow > 0) {
      keyPoints.push('Positive cash flow this month — good position')
    }
  }

  // Closing
  lines.push('Review your allocation regularly as your goals and circumstances evolve.')

  // Suggested actions — up to 2, highest priority first
  if (!hasGoals) {
    actions.push({ label: 'Set your first goal', href: '/goals' })
  }
  if (netCashFlow !== null && netCashFlow < 0) {
    actions.push({ label: 'Review transactions', href: '/transactions' })
  }
  if (actions.length < 2 && topPct > 60) {
    actions.push({ label: 'Review portfolio allocation', href: '/portfolio/list' })
  }
  if (actions.length < 2) {
    actions.push({ label: 'View portfolio details', href: '/portfolio/list' })
  }

  return {
    userId,
    summaryText: lines.join(' '),
    keyPoints,
    suggestedActions: actions.slice(0, 2),
    inputSnapshot: {
      totalValue: totalAssetValue,
      assetCount,
      topCategory: topCategory?.label ?? '',
    },
    generatedAt: new Date().toISOString(),
  }
}

/**
 * Dashboard partial-failure resilience smoke test.
 *
 * The dashboard's useMemo co-derives health cards and AI summary from the same
 * portfolio snapshot. Health cards are computed first (outside the try/catch);
 * the AI summary is computed inside a try/catch with a safe fallback object.
 *
 * This test mirrors that exact pattern and verifies that when generateAISummary
 * throws (rate limit, network error, any exception), the health cards are
 * unaffected and the fallback AI summary is safe to render.
 */

import { generateHealthCards } from '@/features/dashboard/diagnosis'
import { generateAISummary } from '@/features/ai/summary-generator'
import { ROUTES } from '@/lib/constants/routes'
import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { AdvisorContext } from '@/features/ai/advisor-context'

jest.mock('@/features/ai/summary-generator')
const mockGenerateAISummary = generateAISummary as jest.MockedFunction<typeof generateAISummary>

function makePortfolioSummary(): PortfolioSummary {
  return {
    userId: 'test',
    totalAssetValue: 100_000,
    assetCount: 2,
    categoryBreakdown: [
      { category: 'stock', label: 'Stocks', value: 80_000, percentage: 80, color: '#10b981' },
      { category: 'cash',  label: 'Cash',   value: 20_000, percentage: 20, color: '#4f7df3' },
    ],
    largestAsset: { name: 'AAPL', value: 80_000 },
    generatedAt: new Date().toISOString(),
  }
}

function makeAdvisorContext(summary: PortfolioSummary): AdvisorContext {
  return {
    portfolio: summary,
    hasGoals: false,
    goalCount: 0,
    cashFlow: null,
  }
}

/**
 * Mirrors the dashboard page's useMemo logic exactly.
 * If this helper drifts from the real implementation, the tests below
 * will need to be updated to match.
 */
function computeDashboardData(summary: PortfolioSummary, ctx: AdvisorContext) {
  const cards = generateHealthCards(summary)
  let analysis
  try {
    analysis = generateAISummary(ctx)
  } catch {
    analysis = {
      userId: ctx.portfolio.userId,
      summaryText: 'Your summary is temporarily unavailable. Your portfolio data is still accessible above.',
      keyPoints: [] as string[],
      suggestedActions: [{ label: 'View portfolio details', href: ROUTES.portfolioList }],
      inputSnapshot: { totalValue: 0, assetCount: 0, topCategory: '' },
      generatedAt: new Date().toISOString(),
    }
  }
  return { healthCards: cards, aiAnalysis: analysis }
}

describe('dashboard partial-failure resilience', () => {
  afterEach(() => {
    jest.resetAllMocks()
  })

  it('health cards are unaffected when AI summary throws', () => {
    mockGenerateAISummary.mockImplementation(() => {
      throw new Error('AI service unavailable')
    })

    const summary = makePortfolioSummary()
    const ctx = makeAdvisorContext(summary)
    const { healthCards } = computeDashboardData(summary, ctx)

    // Health cards must still be computed and valid
    expect(healthCards.length).toBeGreaterThan(0)
    healthCards.forEach((card) => {
      expect(Number.isFinite(card.score)).toBe(true)
      expect(['good', 'warning', 'attention']).toContain(card.status)
    })
  })

  it('fallback AI summary is renderable when AI summary throws', () => {
    mockGenerateAISummary.mockImplementation(() => {
      throw new Error('Rate limit exceeded')
    })

    const summary = makePortfolioSummary()
    const ctx = makeAdvisorContext(summary)
    const { aiAnalysis } = computeDashboardData(summary, ctx)

    // Fallback must be safe to render — non-empty text and at least one action
    expect(typeof aiAnalysis.summaryText).toBe('string')
    expect(aiAnalysis.summaryText.length).toBeGreaterThan(0)
    expect(Array.isArray(aiAnalysis.suggestedActions)).toBe(true)
    expect(aiAnalysis.suggestedActions.length).toBeGreaterThan(0)
    expect(aiAnalysis.suggestedActions[0].href).toBeDefined()
  })

  it('both health cards and fallback AI summary are valid together when AI throws', () => {
    mockGenerateAISummary.mockImplementation(() => {
      throw new Error('Unexpected internal error')
    })

    const summary = makePortfolioSummary()
    const ctx = makeAdvisorContext(summary)
    const { healthCards, aiAnalysis } = computeDashboardData(summary, ctx)

    // Neither result may be null or empty — the dashboard must have something to render
    expect(healthCards.length).toBeGreaterThan(0)
    expect(aiAnalysis.summaryText).not.toBe('')
  })
})

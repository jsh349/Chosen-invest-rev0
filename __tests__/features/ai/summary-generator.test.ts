import { generateAISummary } from '@/features/ai/summary-generator'
import { ROUTES } from '@/lib/constants/routes'
import type { AdvisorContext } from '@/features/ai/advisor-context'

/** Build a minimal AdvisorContext for testing. The default is a concentrated portfolio. */
function makeCtx(overrides: Partial<AdvisorContext> = {}): AdvisorContext {
  return {
    portfolio: {
      userId: 'test',
      totalAssetValue: 100_000,
      assetCount: 2,
      categoryBreakdown: [
        // 80% stocks → topPct = 80 → triggers concentration branch
        { category: 'stock', label: 'Stocks', value: 80_000, percentage: 80, color: '#10b981' },
        { category: 'cash',  label: 'Cash',   value: 20_000, percentage: 20, color: '#4f7df3' },
      ],
      largestAsset: { name: 'AAPL', value: 80_000 },
      generatedAt: new Date().toISOString(),
    },
    hasGoals: true,
    goalCount: 1,
    cashFlow: null,
    ...overrides,
  }
}

describe('generateAISummary', () => {
  // Regression — concentrated portfolio produces two portfolioList actions with distinct labels
  // (Phase 70 bug: both had href=/portfolio/list, causing React duplicate-key warning.
  //  Fix: ai-summary-card.tsx uses key={action.label}; generator intentionally emits both.)
  it('concentrated portfolio (topPct>60, goals present, no cashFlow) produces two portfolioList actions', () => {
    // hasGoals=true → no goal action; cashFlow=null → no tx action; no rank
    // → both "Review portfolio allocation" and "View portfolio details" are added
    const result = generateAISummary(makeCtx())
    const portfolioListActions = result.suggestedActions.filter((a) => a.href === ROUTES.portfolioList)
    expect(portfolioListActions).toHaveLength(2)
    // Labels must be distinct so key={action.label} renders both without collisions
    const labels = portfolioListActions.map((a) => a.label)
    expect(new Set(labels).size).toBe(2)
  })

  it('returns max 2 suggested actions', () => {
    const result = generateAISummary(makeCtx())
    expect(result.suggestedActions.length).toBeLessThanOrEqual(2)
  })

  // Early-exit paths
  it('no-assets path returns portfolioInput action', () => {
    const ctx = makeCtx({
      portfolio: {
        userId: 'test', totalAssetValue: 0, assetCount: 0,
        categoryBreakdown: [], largestAsset: null, generatedAt: new Date().toISOString(),
      },
    })
    const result = generateAISummary(ctx)
    expect(result.suggestedActions[0].href).toBe(ROUTES.portfolioInput)
  })

  it('all-cash portfolio returns portfolioInput action', () => {
    const ctx = makeCtx({
      portfolio: {
        userId: 'test', totalAssetValue: 50_000, assetCount: 1,
        categoryBreakdown: [{ category: 'cash', label: 'Cash', value: 50_000, percentage: 100, color: '#4f7df3' }],
        largestAsset: { name: 'Savings', value: 50_000 },
        generatedAt: new Date().toISOString(),
      },
    })
    const result = generateAISummary(ctx)
    expect(result.suggestedActions[0].href).toBe(ROUTES.portfolioInput)
  })

  // Action priorities
  it('goal action takes first slot when no goals set', () => {
    const result = generateAISummary(makeCtx({ hasGoals: false, goalCount: 0 }))
    expect(result.suggestedActions[0].href).toBe(ROUTES.goals)
  })

  it('transaction action included for negative cash flow', () => {
    const result = generateAISummary(makeCtx({
      cashFlow: { income: 500, expenses: -1500, net: -1000 },
    }))
    expect(result.suggestedActions.some((a) => a.href === ROUTES.transactions)).toBe(true)
  })

  // Output shape
  it('result always contains required fields', () => {
    const result = generateAISummary(makeCtx())
    expect(typeof result.summaryText).toBe('string')
    expect(result.summaryText.length).toBeGreaterThan(0)
    expect(Array.isArray(result.keyPoints)).toBe(true)
    expect(Array.isArray(result.suggestedActions)).toBe(true)
    expect(typeof result.generatedAt).toBe('string')
  })
})

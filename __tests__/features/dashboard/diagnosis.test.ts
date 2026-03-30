import { generateHealthCards } from '@/features/dashboard/diagnosis'
import type { PortfolioSummary } from '@/lib/types/dashboard'

function makeEmptySummary(overrides: Partial<PortfolioSummary> = {}): PortfolioSummary {
  return {
    userId: 'test',
    totalAssetValue: 0,
    assetCount: 0,
    categoryBreakdown: [],
    largestAsset: null,
    generatedAt: new Date().toISOString(),
    ...overrides,
  }
}

describe('generateHealthCards — empty/zero-total guard', () => {
  it('returns 4 cards with score 0 when assetCount is 0', () => {
    const cards = generateHealthCards(makeEmptySummary())
    expect(cards).toHaveLength(4)
    cards.forEach((c) => {
      expect(c.score).toBe(0)
      expect(Number.isFinite(c.score)).toBe(true)
    })
  })

  it('returns no NaN or Infinity scores when totalAssetValue is 0', () => {
    const cards = generateHealthCards(makeEmptySummary({ assetCount: 2 }))
    cards.forEach((c) => {
      expect(Number.isNaN(c.score)).toBe(false)
      expect(Number.isFinite(c.score)).toBe(true)
    })
  })

  it('preserves correct diversification score for a normal portfolio', () => {
    const summary = makeEmptySummary({
      totalAssetValue: 100_000,
      assetCount: 3,
      categoryBreakdown: [
        { category: 'stock',      label: 'Stocks',     value: 50_000, percentage: 50, color: '#10b981' },
        { category: 'cash',       label: 'Cash',       value: 30_000, percentage: 30, color: '#4f7df3' },
        { category: 'retirement', label: 'Retirement', value: 20_000, percentage: 20, color: '#f59e0b' },
      ],
    })
    const cards = generateHealthCards(summary)
    const div = cards.find((c) => c.key === 'diversification')
    // 3 categories × 16 = 48 → score 48 (below 50 → 'attention')
    expect(div?.score).toBe(48)
    expect(div?.status).toBe('attention')
  })
})

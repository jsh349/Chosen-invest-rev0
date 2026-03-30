import { generateHealthCards } from '@/features/dashboard/diagnosis'
import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { AllocationSlice } from '@/lib/types/dashboard'

function makeSummary(
  slices: Array<{ category: string; label: string; value: number; percentage: number }>,
  total?: number
): PortfolioSummary {
  const totalAssetValue = total ?? slices.reduce((s, sl) => s + sl.value, 0)
  const categoryBreakdown: AllocationSlice[] = slices.map((sl) => ({
    ...sl,
    color: '#888888',
  }))
  return {
    userId: 'test',
    totalAssetValue,
    assetCount: slices.length,
    categoryBreakdown,
    largestAsset: slices.length ? { name: slices[0].label, value: slices[0].value } : null,
    generatedAt: new Date().toISOString(),
  }
}

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

// ── DIVERSIFICATION ─────────────────────────────────────────────────────────
// Score = min(100, categoryCount × 16)
// ≥5 categories → ≥80 (good) | 4 → 64 (warning) | ≤3 → ≤48 (attention)
describe('generateHealthCards — diversification', () => {
  it('score 0 / attention for 0 categories (empty guard)', () => {
    const cards = generateHealthCards(makeEmptySummary())
    const d = cards.find((c) => c.key === 'diversification')!
    expect(d.score).toBe(0)
    expect(d.status).toBe('attention')
  })

  it('score 16 / attention for 1 category', () => {
    const summary = makeSummary([{ category: 'cash', label: 'Cash', value: 100, percentage: 100 }])
    const d = generateHealthCards(summary).find((c) => c.key === 'diversification')!
    expect(d.score).toBe(16)
    expect(d.status).toBe('attention')
  })

  it('score 48 / attention for 3 categories', () => {
    const summary = makeSummary([
      { category: 'cash',       label: 'Cash',       value: 40, percentage: 40 },
      { category: 'stock',      label: 'Stocks',     value: 40, percentage: 40 },
      { category: 'retirement', label: 'Retirement', value: 20, percentage: 20 },
    ])
    const d = generateHealthCards(summary).find((c) => c.key === 'diversification')!
    expect(d.score).toBe(48)
    expect(d.status).toBe('attention')
  })

  it('score 64 / warning for 4 categories', () => {
    const summary = makeSummary([
      { category: 'cash',       label: 'Cash',       value: 25, percentage: 25 },
      { category: 'stock',      label: 'Stocks',     value: 25, percentage: 25 },
      { category: 'etf',        label: 'ETF',        value: 25, percentage: 25 },
      { category: 'retirement', label: 'Retirement', value: 25, percentage: 25 },
    ])
    const d = generateHealthCards(summary).find((c) => c.key === 'diversification')!
    expect(d.score).toBe(64)
    expect(d.status).toBe('warning')
  })

  it('score 80 / good for 5 categories', () => {
    const summary = makeSummary([
      { category: 'cash',        label: 'Cash',        value: 20, percentage: 20 },
      { category: 'stock',       label: 'Stocks',      value: 20, percentage: 20 },
      { category: 'etf',         label: 'ETF',         value: 20, percentage: 20 },
      { category: 'retirement',  label: 'Retirement',  value: 20, percentage: 20 },
      { category: 'real_estate', label: 'Real Estate', value: 20, percentage: 20 },
    ])
    const d = generateHealthCards(summary).find((c) => c.key === 'diversification')!
    expect(d.score).toBe(80)
    expect(d.status).toBe('good')
  })
})

// ── CONCENTRATION RISK ───────────────────────────────────────────────────────
// topPct >60% → 30 (attention) | >40% → 55 (warning) | ≤40% → 80 (good)
describe('generateHealthCards — concentration', () => {
  it('score 30 / attention when top category is >60%', () => {
    const summary = makeSummary([
      { category: 'stock', label: 'Stocks', value: 70, percentage: 70 },
      { category: 'cash',  label: 'Cash',   value: 30, percentage: 30 },
    ])
    const c = generateHealthCards(summary).find((c) => c.key === 'concentration')!
    expect(c.score).toBe(30)
    expect(c.status).toBe('attention')
  })

  it('score 55 / warning when top category is 41–60%', () => {
    const summary = makeSummary([
      { category: 'stock', label: 'Stocks', value: 50, percentage: 50 },
      { category: 'cash',  label: 'Cash',   value: 50, percentage: 50 },
    ])
    const c = generateHealthCards(summary).find((c) => c.key === 'concentration')!
    expect(c.score).toBe(55)
    expect(c.status).toBe('warning')
  })

  it('score 80 / good when top category is ≤40%', () => {
    const summary = makeSummary([
      { category: 'stock', label: 'Stocks', value: 40, percentage: 40 },
      { category: 'cash',  label: 'Cash',   value: 35, percentage: 35 },
      { category: 'etf',   label: 'ETF',    value: 25, percentage: 25 },
    ])
    const c = generateHealthCards(summary).find((c) => c.key === 'concentration')!
    expect(c.score).toBe(80)
    expect(c.status).toBe('good')
  })
})

// ── LIQUIDITY ────────────────────────────────────────────────────────────────
// cashPct ≥10% → 80 (good) | ≥5% → 55 (warning) | <5% → 35 (attention)
describe('generateHealthCards — liquidity', () => {
  it('score 80 / good when cash ≥10%', () => {
    const summary = makeSummary([
      { category: 'cash',  label: 'Cash',   value: 15, percentage: 15 },
      { category: 'stock', label: 'Stocks', value: 85, percentage: 85 },
    ])
    const l = generateHealthCards(summary).find((c) => c.key === 'liquidity')!
    expect(l.score).toBe(80)
    expect(l.status).toBe('good')
  })

  it('score 55 / warning when cash is 5–9%', () => {
    const summary = makeSummary([
      { category: 'cash',  label: 'Cash',   value: 7, percentage: 7 },
      { category: 'stock', label: 'Stocks', value: 93, percentage: 93 },
    ])
    const l = generateHealthCards(summary).find((c) => c.key === 'liquidity')!
    expect(l.score).toBe(55)
    expect(l.status).toBe('warning')
  })

  it('score 35 / attention when cash <5%', () => {
    const summary = makeSummary([
      { category: 'cash',  label: 'Cash',   value: 3, percentage: 3 },
      { category: 'stock', label: 'Stocks', value: 97, percentage: 97 },
    ])
    const l = generateHealthCards(summary).find((c) => c.key === 'liquidity')!
    expect(l.score).toBe(35)
    expect(l.status).toBe('attention')
  })

  it('score 35 / attention when no cash category present', () => {
    const summary = makeSummary([
      { category: 'stock', label: 'Stocks', value: 100, percentage: 100 },
    ])
    const l = generateHealthCards(summary).find((c) => c.key === 'liquidity')!
    expect(l.score).toBe(35)
    expect(l.status).toBe('attention')
  })
})

// ── GROWTH BALANCE ───────────────────────────────────────────────────────────
// both retirement+growth → 80 (good) | one only → 60 (warning) | neither → 40 (attention)
describe('generateHealthCards — growth balance', () => {
  it('score 80 / good when both retirement and growth assets present', () => {
    const summary = makeSummary([
      { category: 'retirement', label: 'Retirement', value: 50, percentage: 50 },
      { category: 'stock',      label: 'Stocks',     value: 50, percentage: 50 },
    ])
    const b = generateHealthCards(summary).find((c) => c.key === 'balance')!
    expect(b.score).toBe(80)
    expect(b.status).toBe('good')
  })

  it('score 80 / good when retirement + etf (etf counts as growth)', () => {
    const summary = makeSummary([
      { category: 'retirement', label: 'Retirement', value: 50, percentage: 50 },
      { category: 'etf',        label: 'ETF',        value: 50, percentage: 50 },
    ])
    const b = generateHealthCards(summary).find((c) => c.key === 'balance')!
    expect(b.score).toBe(80)
    expect(b.status).toBe('good')
  })

  it('score 60 / warning when only growth (no retirement)', () => {
    const summary = makeSummary([
      { category: 'stock', label: 'Stocks', value: 80, percentage: 80 },
      { category: 'cash',  label: 'Cash',   value: 20, percentage: 20 },
    ])
    const b = generateHealthCards(summary).find((c) => c.key === 'balance')!
    expect(b.score).toBe(60)
    expect(b.status).toBe('warning')
  })

  it('score 60 / warning when only retirement (no growth)', () => {
    const summary = makeSummary([
      { category: 'retirement', label: 'Retirement', value: 80, percentage: 80 },
      { category: 'cash',       label: 'Cash',       value: 20, percentage: 20 },
    ])
    const b = generateHealthCards(summary).find((c) => c.key === 'balance')!
    expect(b.score).toBe(60)
    expect(b.status).toBe('warning')
  })

  it('score 40 / attention when neither retirement nor growth', () => {
    const summary = makeSummary([
      { category: 'cash', label: 'Cash', value: 100, percentage: 100 },
    ])
    const b = generateHealthCards(summary).find((c) => c.key === 'balance')!
    expect(b.score).toBe(40)
    expect(b.status).toBe('attention')
  })
})

// ── EMPTY / ZERO-TOTAL GUARD ─────────────────────────────────────────────────
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

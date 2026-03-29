import { getRankAllocationInsight } from '@/lib/utils/rank-allocation-insight'
import type { RankResult } from '@/lib/types/rank'
import type { AllocationSlice } from '@/lib/types/dashboard'

// ---------------------------------------------------------------------------
// Minimal builders
// ---------------------------------------------------------------------------

function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}
function ret(pct: number | null): RankResult {
  return { type: 'investment_return', label: 'Return', percentile: pct, message: '' }
}

function slice(category: string, percentage: number, label = category): AllocationSlice {
  return { category: category as AllocationSlice['category'], label, value: percentage, percentage, color: '#000' }
}

// ---------------------------------------------------------------------------
// Null / guard cases
// ---------------------------------------------------------------------------

describe('getRankAllocationInsight — null cases', () => {
  it('returns null when categoryBreakdown is empty', () => {
    expect(getRankAllocationInsight([overall(80)], [])).toBeNull()
  })

  it('returns null when no ranks are available (all null percentiles)', () => {
    expect(getRankAllocationInsight([], [slice('stock', 80)])).toBeNull()
  })

  it('returns null when no rule conditions are met', () => {
    // overall 60 (not strong enough), return 60 (not weak/strong), single category
    const ranks = [overall(60), ret(60)]
    const alloc  = [slice('stock', 60)]
    expect(getRankAllocationInsight(ranks, alloc)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Rule 1 — strong wealth rank + concentrated allocation
// ---------------------------------------------------------------------------

describe('Rule 1: strong wealth rank + concentrated allocation', () => {
  it('fires when overall >= 75 and top category >= 70%', () => {
    const insight = getRankAllocationInsight([overall(80)], [slice('real_estate', 75, 'Real Estate')])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Wealth rank is strong')
    expect(insight).toContain('Real Estate')
  })

  it('fires exactly at the boundary (overall=75, top=70)', () => {
    const insight = getRankAllocationInsight([overall(75)], [slice('cash', 70, 'Cash & Savings')])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Wealth rank is strong')
  })

  it('does NOT fire when overall is 74', () => {
    const insight = getRankAllocationInsight([overall(74)], [slice('cash', 80)])
    expect(insight).toBeNull()
  })

  it('does NOT fire when top category is below 70%', () => {
    const insight = getRankAllocationInsight(
      [overall(80)],
      [slice('stock', 69), slice('cash', 31)],
    )
    expect(insight).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Rule 2 — weak return rank + single category
// ---------------------------------------------------------------------------

describe('Rule 2: weak return rank + single category', () => {
  it('fires when return < 40 and only one category', () => {
    const insight = getRankAllocationInsight([overall(60), ret(30)], [slice('cash', 100, 'Cash & Savings')])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Return rank is below the benchmark median')
    expect(insight).toContain('single category')
  })

  it('fires exactly at return = 39', () => {
    const insight = getRankAllocationInsight([ret(39)], [slice('cash', 100)])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Return rank is below')
  })

  it('does NOT fire when return = 40', () => {
    const insight = getRankAllocationInsight([ret(40)], [slice('cash', 100)])
    expect(insight).toBeNull()
  })

  it('does NOT fire when there are multiple categories', () => {
    const insight = getRankAllocationInsight(
      [ret(30)],
      [slice('cash', 60), slice('stock', 40)],
    )
    expect(insight).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Rule 3 — strong return rank + volatile + concentrated
// ---------------------------------------------------------------------------

describe('Rule 3: strong return rank + volatile concentrated category', () => {
  it('fires for crypto at 75% concentration and return >= 75', () => {
    const insight = getRankAllocationInsight([ret(80)], [slice('crypto', 75, 'Crypto')])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Return rank is strong')
    expect(insight).toContain('Crypto')
  })

  it('fires for stock at 70% concentration and return = 75', () => {
    const insight = getRankAllocationInsight([ret(75)], [slice('stock', 70, 'Stocks')])
    expect(insight).not.toBeNull()
    expect(insight).toContain('Stocks')
  })

  it('does NOT fire for non-volatile categories (e.g. real_estate)', () => {
    const insight = getRankAllocationInsight([ret(80)], [slice('real_estate', 80, 'Real Estate')])
    expect(insight).toBeNull()
  })

  it('does NOT fire when concentration is below threshold', () => {
    const insight = getRankAllocationInsight(
      [ret(80)],
      [slice('crypto', 69, 'Crypto'), slice('cash', 31)],
    )
    expect(insight).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Priority — Rule 1 wins over Rule 3 when both could apply
// ---------------------------------------------------------------------------

describe('rule priority', () => {
  it('Rule 1 wins over Rule 3 when overall is also strong and volatile category is concentrated', () => {
    // overall=80 (Rule 1 condition met), return=80 + crypto 80% (Rule 3 condition met)
    const insight = getRankAllocationInsight(
      [overall(80), ret(80)],
      [slice('crypto', 80, 'Crypto')],
    )
    // Rule 1 fires first
    expect(insight).toContain('Wealth rank is strong')
    expect(insight).not.toContain('Return rank is strong')
  })
})

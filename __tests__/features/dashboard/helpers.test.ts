import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import type { Asset } from '@/lib/types/asset'

function makeAsset(overrides: Partial<Asset> = {}): Asset {
  return {
    id:        overrides.id        ?? 'asset_001',
    userId:    overrides.userId    ?? 'user_test',
    name:      overrides.name      ?? 'Test Asset',
    category:  overrides.category  ?? 'cash',
    value:     overrides.value     ?? 1000,
    currency:  overrides.currency  ?? 'USD',
    createdAt: overrides.createdAt ?? '2026-01-01T00:00:00Z',
    updatedAt: overrides.updatedAt ?? '2026-01-01T00:00:00Z',
  }
}

function assertNoFloatAnomalies(summary: ReturnType<typeof buildPortfolioSummary>) {
  expect(Number.isNaN(summary.totalAssetValue)).toBe(false)
  expect(Number.isFinite(summary.totalAssetValue)).toBe(true)
  for (const slice of summary.categoryBreakdown) {
    expect(Number.isNaN(slice.percentage)).toBe(false)
    expect(Number.isFinite(slice.percentage)).toBe(true)
    expect(slice.percentage).toBeGreaterThanOrEqual(0)
    expect(slice.percentage).toBeLessThanOrEqual(100)
  }
}

// ── EMPTY PORTFOLIO ───────────────────────────────────────────────────────────
describe('buildPortfolioSummary — empty portfolio', () => {
  const summary = buildPortfolioSummary('user_test', [])

  it('totalAssetValue is 0', () => expect(summary.totalAssetValue).toBe(0))
  it('assetCount is 0', () => expect(summary.assetCount).toBe(0))
  it('categoryBreakdown is empty', () => expect(summary.categoryBreakdown).toHaveLength(0))
  it('largestAsset is null', () => expect(summary.largestAsset).toBeNull())
  it('no NaN or Infinity anywhere', () => assertNoFloatAnomalies(summary))
  it('generatedAt is a valid ISO string', () =>
    expect(() => new Date(summary.generatedAt)).not.toThrow())
})

// ── ZERO-TOTAL PORTFOLIO ──────────────────────────────────────────────────────
// Assets exist but all values are 0. totalAssetValue = 0.
// The highest risk here: toPercentage(0, 0) must not produce NaN.
describe('buildPortfolioSummary — zero-total portfolio (all values 0)', () => {
  const assets = [
    makeAsset({ id: 'a1', category: 'cash',  value: 0 }),
    makeAsset({ id: 'a2', category: 'stock', value: 0 }),
  ]
  const summary = buildPortfolioSummary('user_test', assets)

  it('totalAssetValue is 0', () => expect(summary.totalAssetValue).toBe(0))
  it('assetCount is 2', () => expect(summary.assetCount).toBe(2))
  it('categoryBreakdown has 2 slices', () => expect(summary.categoryBreakdown).toHaveLength(2))
  it('no NaN or Infinity in any percentage', () => assertNoFloatAnomalies(summary))
  it('all percentages are 0', () =>
    summary.categoryBreakdown.forEach((s) => expect(s.percentage).toBe(0)))
  // largestAsset: reduce picks a.value(0) > top?.value(-1) → first asset wins
  it('largestAsset is defined (value 0)', () =>
    expect(summary.largestAsset).not.toBeNull())
})

// ── SINGLE-ASSET PORTFOLIO ────────────────────────────────────────────────────
// One asset should produce exactly 100% allocation for its category.
describe('buildPortfolioSummary — single-asset portfolio', () => {
  const asset = makeAsset({ id: 'a1', category: 'stock', value: 50_000 })
  const summary = buildPortfolioSummary('user_test', [asset])

  it('totalAssetValue equals the asset value', () =>
    expect(summary.totalAssetValue).toBe(50_000))
  it('assetCount is 1', () => expect(summary.assetCount).toBe(1))
  it('categoryBreakdown has 1 slice', () =>
    expect(summary.categoryBreakdown).toHaveLength(1))
  it('single slice percentage is exactly 100', () =>
    expect(summary.categoryBreakdown[0].percentage).toBe(100))
  it('largestAsset matches the asset', () => {
    expect(summary.largestAsset?.name).toBe(asset.name)
    expect(summary.largestAsset?.value).toBe(asset.value)
  })
  it('no NaN or Infinity', () => assertNoFloatAnomalies(summary))
})

// ── NORMAL PORTFOLIO — spot check ─────────────────────────────────────────────
describe('buildPortfolioSummary — normal portfolio', () => {
  const assets = [
    makeAsset({ id: 'a1', category: 'stock', value: 60_000 }),
    makeAsset({ id: 'a2', category: 'cash',  value: 40_000 }),
  ]
  const summary = buildPortfolioSummary('user_test', assets)

  it('totalAssetValue is correct', () => expect(summary.totalAssetValue).toBe(100_000))
  it('stock slice is 60%', () => {
    const stock = summary.categoryBreakdown.find((s) => s.category === 'stock')
    expect(stock?.percentage).toBe(60)
  })
  it('cash slice is 40%', () => {
    const cash = summary.categoryBreakdown.find((s) => s.category === 'cash')
    expect(cash?.percentage).toBe(40)
  })
  it('breakdown is sorted by value descending', () =>
    expect(summary.categoryBreakdown[0].category).toBe('stock'))
  it('largestAsset is the stock asset', () =>
    expect(summary.largestAsset?.value).toBe(60_000))
})

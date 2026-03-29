import { buildMonthlySummary } from '@/lib/utils/rank-monthly-summary'
import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

function snap(overrides: Partial<RankSnapshot> & { savedAt: string }): RankSnapshot {
  return {
    id: Math.random().toString(36).slice(2),
    totalAssetValue: 100_000,
    overallPercentile: 60,
    agePercentile: null,
    returnPercentile: null,
    ...overrides,
  }
}

describe('buildMonthlySummary', () => {
  it('returns null for empty snapshots', () => {
    expect(buildMonthlySummary([])).toBeNull()
  })

  // Single snapshot → first-visit note
  it('returns first-visit note when only one snapshot exists', () => {
    const result = buildMonthlySummary([snap({ savedAt: '2026-03-10T12:00:00Z' })])
    expect(result).not.toBeNull()
    expect(result!.delta).toBeNull()
    expect(result!.note).toContain('First recorded visit')
  })

  it('single snapshot carries currentOverall', () => {
    const result = buildMonthlySummary([snap({ savedAt: '2026-03-10T12:00:00Z', overallPercentile: 72 })])
    expect(result!.currentOverall).toBe(72)
  })

  // Same-month snapshots → falls back to snapshots[1]
  it('compares against snapshots[1] when all snapshots share the same month', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-20T00:00:00Z', overallPercentile: 70 }),
      snap({ savedAt: '2026-03-10T00:00:00Z', overallPercentile: 60 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBe(10) // 70 - 60
    expect(result!.note).toContain('improved by 10')
  })

  // Cross-month comparison — picks the most recent snapshot from a prior month
  it('prefers a cross-month snapshot over snapshots[1]', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-20T00:00:00Z', overallPercentile: 65 }),
      snap({ savedAt: '2026-03-05T00:00:00Z', overallPercentile: 50 }), // same month
      snap({ savedAt: '2026-02-28T00:00:00Z', overallPercentile: 60 }), // prior month ← should be used
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBe(5) // 65 - 60
    expect(result!.note).toContain('improved by 5')
  })

  // Delta directions
  it('notes "improved" when delta is positive', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: 80 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 70 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBe(10)
    expect(result!.note).toContain('improved by 10')
  })

  it('notes "declined" when delta is negative', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: 55 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 65 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBe(-10)
    expect(result!.note).toContain('declined by 10')
  })

  it('notes "unchanged" when delta is zero', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: 60 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 60 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBe(0)
    expect(result!.note).toContain('unchanged')
  })

  it('notes unavailable when either percentile is null', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: null }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 60 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.delta).toBeNull()
    expect(result!.note).toContain('unavailable')
  })

  // returnDelta
  it('returnDelta is null when no previous snapshot', () => {
    const result = buildMonthlySummary([snap({ savedAt: '2026-03-10T00:00:00Z', returnPercentile: 70 })])
    expect(result!.returnDelta).toBeNull()
  })

  it('returnDelta computes correctly from two snapshots', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', returnPercentile: 80 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', returnPercentile: 65 }),
    ]
    expect(buildMonthlySummary(snapshots)!.returnDelta).toBe(15)
  })

  it('returnDelta is null when either returnPercentile is null', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', returnPercentile: null }),
      snap({ savedAt: '2026-02-01T00:00:00Z', returnPercentile: 65 }),
    ]
    expect(buildMonthlySummary(snapshots)!.returnDelta).toBeNull()
  })

  // Plural vs singular point(s)
  it('uses singular "point" when delta === 1', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: 61 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 60 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.note).toMatch(/1 percentile point[^s]|1 percentile point$/)
  })

  it('uses plural "points" when delta !== 1', () => {
    const snapshots = [
      snap({ savedAt: '2026-03-01T00:00:00Z', overallPercentile: 62 }),
      snap({ savedAt: '2026-02-01T00:00:00Z', overallPercentile: 60 }),
    ]
    const result = buildMonthlySummary(snapshots)
    expect(result!.note).toContain('2 percentile points')
  })
})

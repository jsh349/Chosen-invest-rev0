import { buildMilestoneHistory } from '@/lib/utils/rank-milestone-history'
import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

function snap(
  savedAt: string,
  overallPercentile: number | null = null,
  agePercentile: number | null = null,
  returnPercentile: number | null = null,
): RankSnapshot {
  return {
    id: Math.random().toString(36).slice(2),
    totalAssetValue: 200_000,
    savedAt,
    overallPercentile,
    agePercentile,
    returnPercentile,
  }
}

describe('buildMilestoneHistory', () => {
  it('returns empty array for no snapshots', () => {
    expect(buildMilestoneHistory([])).toEqual([])
  })

  it('returns empty array when no badges are earned (all percentiles below thresholds)', () => {
    const result = buildMilestoneHistory([snap('2026-03-01T00:00:00Z', 40)])
    expect(result).toEqual([])
  })

  it('returns a single entry when one badge is earned', () => {
    const result = buildMilestoneHistory([snap('2026-03-01T00:00:00Z', 80)])
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('top_25_overall')
    expect(result[0].firstSeenAt).toBe('2026-03-01T00:00:00Z')
  })

  it('uses the oldest snapshot as firstSeenAt when the badge appears in multiple snapshots', () => {
    const snapshots = [
      snap('2026-03-20T00:00:00Z', 80), // newest — stored first
      snap('2026-02-10T00:00:00Z', 80), // oldest — should be firstSeenAt
    ]
    const result = buildMilestoneHistory(snapshots)
    expect(result[0].firstSeenAt).toBe('2026-02-10T00:00:00Z')
  })

  it('records separate entries for different badge ids', () => {
    const snapshots = [
      snap('2026-03-01T00:00:00Z', 80, 90), // earns top_25_overall + top_10_age
    ]
    const result = buildMilestoneHistory(snapshots)
    const ids = result.map((e) => e.id)
    expect(ids).toContain('top_25_overall')
    expect(ids).toContain('top_10_age')
  })

  it('sorts results most-recently-achieved first', () => {
    const snapshots = [
      snap('2026-03-15T00:00:00Z', 80, 90), // top_25_overall + top_10_age earned here
      snap('2026-02-01T00:00:00Z', 80, 40), // only top_25_overall earned here (older)
    ]
    const result = buildMilestoneHistory(snapshots)
    // top_10_age first appeared Mar 15 (more recent); top_25_overall first appeared Feb 01
    expect(result[0].id).toBe('top_10_age')
    expect(result[1].id).toBe('top_25_overall')
  })

  it('records firstSeenAt when a badge appears for the first time in a later snapshot', () => {
    const snapshots = [
      snap('2026-03-15T00:00:00Z', 92), // top_10_overall (new, higher tier)
      snap('2026-02-01T00:00:00Z', 80), // top_25_overall only
    ]
    const result = buildMilestoneHistory(snapshots)
    const top10 = result.find((e) => e.id === 'top_10_overall')
    const top25 = result.find((e) => e.id === 'top_25_overall')
    expect(top10?.firstSeenAt).toBe('2026-03-15T00:00:00Z')
    expect(top25?.firstSeenAt).toBe('2026-02-01T00:00:00Z')
  })

  it('does not mutate the input snapshots array order', () => {
    const snapshots = [
      snap('2026-03-01T00:00:00Z', 80),
      snap('2026-02-01T00:00:00Z', 80),
    ]
    const originalFirst = snapshots[0].savedAt
    buildMilestoneHistory(snapshots)
    expect(snapshots[0].savedAt).toBe(originalFirst)
  })
})

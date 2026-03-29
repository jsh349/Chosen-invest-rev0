import { getRankBadges } from '@/lib/utils/rank-badges'
import type { RankResult } from '@/lib/types/rank'

function r(type: RankResult['type'], pct: number | null): RankResult {
  return { type, label: '', percentile: pct, message: '' }
}

describe('getRankBadges', () => {
  it('returns empty array for empty ranks', () => {
    expect(getRankBadges([])).toEqual([])
  })

  it('returns empty array when all percentiles are null', () => {
    expect(getRankBadges([
      r('overall_wealth', null),
      r('age_based', null),
      r('investment_return', null),
    ])).toHaveLength(0)
  })

  // Overall wealth badges — only the highest tier should appear
  it('awards top_10_overall at 90', () => {
    const badges = getRankBadges([r('overall_wealth', 90)])
    expect(badges.map((b) => b.id)).toContain('top_10_overall')
    expect(badges.map((b) => b.id)).not.toContain('top_25_overall')
  })

  it('awards top_25_overall at 75–89', () => {
    const badges = getRankBadges([r('overall_wealth', 80)])
    expect(badges.map((b) => b.id)).toContain('top_25_overall')
    expect(badges.map((b) => b.id)).not.toContain('top_10_overall')
  })

  it('awards top_50_overall at 50–74', () => {
    const badges = getRankBadges([r('overall_wealth', 55)])
    expect(badges.map((b) => b.id)).toContain('top_50_overall')
  })

  it('no overall badge below 50th', () => {
    const badges = getRankBadges([r('overall_wealth', 40)])
    expect(badges.some((b) => b.id.includes('overall'))).toBe(false)
  })

  // Age-based badges
  it('awards top_10_age at 90', () => {
    const badges = getRankBadges([r('age_based', 90)])
    expect(badges.map((b) => b.id)).toContain('top_10_age')
  })

  it('awards top_25_age at 75–89', () => {
    const badges = getRankBadges([r('age_based', 78)])
    expect(badges.map((b) => b.id)).toContain('top_25_age')
  })

  it('no age badge below 75th', () => {
    const badges = getRankBadges([r('age_based', 70)])
    expect(badges.some((b) => b.id.includes('age'))).toBe(false)
  })

  // Return badge
  it('awards strong_return at 75', () => {
    const badges = getRankBadges([r('investment_return', 75)])
    expect(badges.map((b) => b.id)).toContain('strong_return')
  })

  it('no strong_return badge at 74', () => {
    const badges = getRankBadges([r('investment_return', 74)])
    expect(badges.map((b) => b.id)).not.toContain('strong_return')
  })

  // Multiple badges can be earned in one call
  it('can earn badges across multiple categories', () => {
    const badges = getRankBadges([
      r('overall_wealth', 92),
      r('age_based', 85),
      r('investment_return', 80),
    ])
    const ids = badges.map((b) => b.id)
    expect(ids).toContain('top_10_overall')
    expect(ids).toContain('top_25_age')
    expect(ids).toContain('strong_return')
  })
})

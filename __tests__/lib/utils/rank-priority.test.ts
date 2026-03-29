import { RANK_PRIORITY_ORDER, getPrimaryRank, sortRanksByPriority } from '@/lib/utils/rank-priority'
import type { RankResult } from '@/lib/types/rank'

function make(type: RankResult['type'], percentile: number | null): RankResult {
  return { type, label: type, percentile, message: '' }
}

const overall  = (pct: number | null) => make('overall_wealth',    pct)
const ageBased = (pct: number | null) => make('age_based',         pct)
const ageGender = (pct: number | null) => make('age_gender',       pct)
const ret      = (pct: number | null) => make('investment_return', pct)

// ---------------------------------------------------------------------------
// RANK_PRIORITY_ORDER
// ---------------------------------------------------------------------------
describe('RANK_PRIORITY_ORDER', () => {
  it('contains all four rank types', () => {
    expect(RANK_PRIORITY_ORDER).toContain('overall_wealth')
    expect(RANK_PRIORITY_ORDER).toContain('age_based')
    expect(RANK_PRIORITY_ORDER).toContain('age_gender')
    expect(RANK_PRIORITY_ORDER).toContain('investment_return')
    expect(RANK_PRIORITY_ORDER.length).toBe(4)
  })

  it('overall_wealth comes before age_based', () => {
    expect(RANK_PRIORITY_ORDER.indexOf('overall_wealth')).toBeLessThan(
      RANK_PRIORITY_ORDER.indexOf('age_based')
    )
  })

  it('age_based comes before age_gender', () => {
    expect(RANK_PRIORITY_ORDER.indexOf('age_based')).toBeLessThan(
      RANK_PRIORITY_ORDER.indexOf('age_gender')
    )
  })

  it('age_gender comes before investment_return', () => {
    expect(RANK_PRIORITY_ORDER.indexOf('age_gender')).toBeLessThan(
      RANK_PRIORITY_ORDER.indexOf('investment_return')
    )
  })
})

// ---------------------------------------------------------------------------
// getPrimaryRank
// ---------------------------------------------------------------------------
describe('getPrimaryRank', () => {
  it('returns null for empty array', () => {
    expect(getPrimaryRank([])).toBeNull()
  })

  it('returns null when all percentiles are null', () => {
    expect(getPrimaryRank([overall(null), ageBased(null), ageGender(null), ret(null)])).toBeNull()
  })

  it('returns overall when it has a percentile', () => {
    const result = getPrimaryRank([overall(70), ageBased(60), ageGender(55), ret(50)])
    expect(result?.type).toBe('overall_wealth')
  })

  it('returns age_based when overall is null', () => {
    const result = getPrimaryRank([overall(null), ageBased(60), ageGender(55), ret(50)])
    expect(result?.type).toBe('age_based')
  })

  it('returns age_gender when overall and age_based are null', () => {
    const result = getPrimaryRank([overall(null), ageBased(null), ageGender(55), ret(50)])
    expect(result?.type).toBe('age_gender')
  })

  it('returns investment_return when all wealth ranks are null', () => {
    const result = getPrimaryRank([overall(null), ageBased(null), ageGender(null), ret(50)])
    expect(result?.type).toBe('investment_return')
  })

  it('is not affected by input array ordering', () => {
    // Reversed order — overall still wins
    const result = getPrimaryRank([ret(50), ageGender(55), ageBased(60), overall(70)])
    expect(result?.type).toBe('overall_wealth')
  })

  it('returns the correct percentile value', () => {
    const result = getPrimaryRank([overall(72)])
    expect(result?.percentile).toBe(72)
  })
})

// ---------------------------------------------------------------------------
// sortRanksByPriority
// ---------------------------------------------------------------------------
describe('sortRanksByPriority', () => {
  it('returns empty array for empty input', () => {
    expect(sortRanksByPriority([])).toEqual([])
  })

  it('sorts a reversed input into priority order', () => {
    const input = [ret(50), ageGender(55), ageBased(60), overall(70)]
    const sorted = sortRanksByPriority(input)
    expect(sorted.map((r) => r.type)).toEqual([
      'overall_wealth',
      'age_based',
      'age_gender',
      'investment_return',
    ])
  })

  it('does not mutate the input array', () => {
    const input = [ret(50), overall(70)]
    const original = [...input]
    sortRanksByPriority(input)
    expect(input.map((r) => r.type)).toEqual(original.map((r) => r.type))
  })

  it('places ranks not in the priority list at the end', () => {
    const unknown = { type: 'custom' as RankResult['type'], label: 'Custom', percentile: 99, message: '' }
    const sorted = sortRanksByPriority([unknown, overall(70)])
    expect(sorted[0].type).toBe('overall_wealth')
    expect(sorted[1].type).toBe('custom')
  })

  it('handles a single-item array', () => {
    const sorted = sortRanksByPriority([ageBased(60)])
    expect(sorted).toHaveLength(1)
    expect(sorted[0].type).toBe('age_based')
  })
})

import { getRankActions } from '@/lib/utils/rank-actions'
import { ROUTES } from '@/lib/constants/routes'
import type { RankResult } from '@/lib/types/rank'

function makeRanks({
  overallPct = 80,
  ageMissing = false,
  genderMissing = false,
}: {
  overallPct?: number
  ageMissing?: boolean
  genderMissing?: boolean
} = {}): RankResult[] {
  return [
    { type: 'overall_wealth', label: 'Overall', percentile: overallPct, message: '' },
    ageMissing
      ? { type: 'age_based', label: 'Age', percentile: null, message: '', missingField: 'age' }
      : { type: 'age_based', label: 'Age', percentile: overallPct, message: '' },
    genderMissing
      ? { type: 'age_gender', label: 'Gender', percentile: null, message: '', missingField: 'gender' }
      : { type: 'age_gender', label: 'Gender', percentile: overallPct, message: '' },
    { type: 'investment_return', label: 'Return', percentile: overallPct, message: '' },
  ]
}

describe('getRankActions', () => {
  it('returns empty array for empty ranks', () => {
    expect(getRankActions([])).toEqual([])
  })

  it('returns no actions when profile is complete and wealth >= 75th', () => {
    expect(getRankActions(makeRanks({ overallPct: 80 }))).toHaveLength(0)
  })

  // Rule 1 — incomplete profile → settings link
  it('Rule 1: missing age produces settings action', () => {
    const actions = getRankActions(makeRanks({ ageMissing: true }))
    expect(actions.some((a) => a.href === ROUTES.settings)).toBe(true)
  })

  it('Rule 1: missing gender produces settings action', () => {
    const actions = getRankActions(makeRanks({ genderMissing: true }))
    expect(actions.some((a) => a.href === ROUTES.settings)).toBe(true)
  })

  // Rule 2 — wealth below 75th → portfolio link
  it('Rule 2: wealth at 74th produces portfolio action', () => {
    const actions = getRankActions(makeRanks({ overallPct: 74 }))
    expect(actions.some((a) => a.href === ROUTES.portfolioList)).toBe(true)
  })

  it('Rule 2: wealth at 75th produces no portfolio action', () => {
    const actions = getRankActions(makeRanks({ overallPct: 75 }))
    expect(actions.some((a) => a.href === ROUTES.portfolioList)).toBe(false)
  })

  // Cap
  it('result is capped at 2 actions', () => {
    // Both rules fire: incomplete profile + wealth below 75th
    const actions = getRankActions(makeRanks({ overallPct: 60, ageMissing: true }))
    expect(actions.length).toBeLessThanOrEqual(2)
  })
})

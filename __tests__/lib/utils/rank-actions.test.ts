import { getRankActions } from '@/lib/utils/rank-actions'
import { ROUTES } from '@/lib/constants/routes'
import type { RankResult } from '@/lib/types/rank'

function makeRanks({
  overallPct = 80,
  ageMissing = false,
  genderMissing = false,
  returnMissing = false,
}: {
  overallPct?: number
  ageMissing?: boolean
  genderMissing?: boolean
  returnMissing?: boolean
} = {}): RankResult[] {
  return [
    { type: 'overall_wealth', label: 'Overall', percentile: overallPct, message: '' },
    ageMissing
      ? { type: 'age_based', label: 'Age', percentile: null, message: '', missingField: 'birth year' }
      : { type: 'age_based', label: 'Age', percentile: overallPct, message: '' },
    genderMissing
      ? { type: 'age_gender', label: 'Gender', percentile: null, message: '', missingField: 'gender' }
      : { type: 'age_gender', label: 'Gender', percentile: overallPct, message: '' },
    returnMissing
      ? { type: 'investment_return', label: 'Return', percentile: null, message: '', missingField: 'annual return' }
      : { type: 'investment_return', label: 'Return', percentile: overallPct, message: '' },
  ]
}

describe('getRankActions', () => {
  it('returns empty array for empty ranks', () => {
    expect(getRankActions([])).toEqual([])
  })

  // Profile complete, wealth strong, return present, goals set → no actions needed
  it('returns no actions when profile complete, wealth >= 75th, return present, has goals', () => {
    expect(getRankActions(makeRanks({ overallPct: 80 }), { hasGoals: true })).toHaveLength(0)
  })

  // Rule 1 — incomplete profile (age/gender) → settings
  it('Rule 1: missing age produces settings action', () => {
    const actions = getRankActions(makeRanks({ ageMissing: true }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.settings)).toBe(true)
  })

  it('Rule 1: missing gender produces settings action', () => {
    const actions = getRankActions(makeRanks({ genderMissing: true }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.settings)).toBe(true)
  })

  // Rule 2 — wealth below 75th → portfolio
  it('Rule 2: wealth at 74th produces portfolio action', () => {
    const actions = getRankActions(makeRanks({ overallPct: 74 }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.portfolioList)).toBe(true)
  })

  it('Rule 2: wealth at 75th does NOT produce portfolio action', () => {
    const actions = getRankActions(makeRanks({ overallPct: 75 }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.portfolioList)).toBe(false)
  })

  // Rule 3 — return missing → settings (only when settings not already present)
  it('Rule 3: return missing adds settings action when not already present', () => {
    const actions = getRankActions(makeRanks({ overallPct: 80, returnMissing: true }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.settings)).toBe(true)
    expect(actions[0].label).toContain('return estimate')
  })

  it('Rule 3: does NOT add a second settings link when Rule 1 already added one', () => {
    // Rule 1 fires (ageMissing) → settings already in list; Rule 3 skips to avoid duplicate
    const actions = getRankActions(makeRanks({ ageMissing: true, returnMissing: true }), { hasGoals: true })
    const settingsLinks = actions.filter((a) => a.href === ROUTES.settings)
    expect(settingsLinks).toHaveLength(1)
  })

  // Rule 4 — no goals → goals page
  it('Rule 4: no goals produces goals action', () => {
    const actions = getRankActions(makeRanks({ overallPct: 80 }), { hasGoals: false })
    expect(actions.some((a) => a.href === ROUTES.goals)).toBe(true)
  })

  it('Rule 4: does NOT fire when goals are set', () => {
    const actions = getRankActions(makeRanks({ overallPct: 80 }), { hasGoals: true })
    expect(actions.some((a) => a.href === ROUTES.goals)).toBe(false)
  })

  it('Rule 4: default hasGoals is false (backward-compatible)', () => {
    // Calling without second arg → Rule 4 eligible if slots available
    const actions = getRankActions(makeRanks({ overallPct: 80 }))
    expect(actions.some((a) => a.href === ROUTES.goals)).toBe(true)
  })

  // Cap at 2
  it('result is capped at 2 even when all rules would fire', () => {
    const actions = getRankActions(
      makeRanks({ overallPct: 60, ageMissing: true, returnMissing: true }),
      { hasGoals: false },
    )
    expect(actions.length).toBeLessThanOrEqual(2)
  })
})

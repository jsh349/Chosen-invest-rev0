import { getRankChecklist } from '@/lib/utils/rank-checklist'
import type { RankResult } from '@/lib/types/rank'

function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}

const fullProfile = { hasAge: true, hasGender: true, hasReturn: true, hasGoals: true }
const emptyProfile = { hasAge: false, hasGender: false, hasReturn: false, hasGoals: false }

// ---------------------------------------------------------------------------
// Empty result cases
// ---------------------------------------------------------------------------

describe('getRankChecklist — empty result', () => {
  it('returns empty array when profile is complete and rank is strong', () => {
    const result = getRankChecklist(fullProfile, [overall(60)])
    expect(result).toHaveLength(0)
  })

  it('returns empty array when profile is complete and ranks array is empty', () => {
    const result = getRankChecklist(fullProfile, [])
    expect(result).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Individual conditions
// ---------------------------------------------------------------------------

describe('getRankChecklist — individual conditions', () => {
  it('adds birth year item when hasAge is false', () => {
    const result = getRankChecklist({ ...fullProfile, hasAge: false }, [])
    expect(result.some((i) => i.text.toLowerCase().includes('birth year'))).toBe(true)
  })

  it('adds gender item when hasGender is false', () => {
    const result = getRankChecklist({ ...fullProfile, hasGender: false }, [])
    expect(result.some((i) => i.text.toLowerCase().includes('gender'))).toBe(true)
  })

  it('adds return item when hasReturn is false', () => {
    const result = getRankChecklist({ ...fullProfile, hasReturn: false }, [])
    expect(result.some((i) => i.text.toLowerCase().includes('return'))).toBe(true)
  })

  it('adds goal item when hasGoals is false', () => {
    const result = getRankChecklist({ ...fullProfile, hasGoals: false }, [])
    expect(result.some((i) => i.text.toLowerCase().includes('goal'))).toBe(true)
  })

  it('adds allocation review when overall percentile < 40', () => {
    const result = getRankChecklist(fullProfile, [overall(30)])
    expect(result.some((i) => i.text.toLowerCase().includes('allocation'))).toBe(true)
  })

  it('does NOT add allocation review when overall percentile >= 40', () => {
    const result = getRankChecklist(fullProfile, [overall(40)])
    expect(result.some((i) => i.text.toLowerCase().includes('allocation'))).toBe(false)
  })

  it('does NOT add allocation review when overall percentile is null', () => {
    const result = getRankChecklist(fullProfile, [overall(null)])
    expect(result.some((i) => i.text.toLowerCase().includes('allocation'))).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// Priority order
// ---------------------------------------------------------------------------

describe('getRankChecklist — priority order', () => {
  it('returns items in order: age, gender, return, goals', () => {
    const result = getRankChecklist(emptyProfile, [overall(60)])
    expect(result[0].text.toLowerCase()).toContain('birth year')
    expect(result[1].text.toLowerCase()).toContain('gender')
    expect(result[2].text.toLowerCase()).toContain('return')
    expect(result[3].text.toLowerCase()).toContain('goal')
  })
})

// ---------------------------------------------------------------------------
// Cap at MAX_ITEMS = 4
// ---------------------------------------------------------------------------

describe('getRankChecklist — cap at 4', () => {
  it('returns at most 4 items even when all conditions are met', () => {
    // All 4 profile flags false + low rank = 5 potential items
    const result = getRankChecklist(emptyProfile, [overall(20)])
    expect(result.length).toBeLessThanOrEqual(4)
  })

  it('allocation review is excluded when cap is already reached by profile items', () => {
    // All 4 profile flags false fills the cap; allocation item should be absent
    const result = getRankChecklist(emptyProfile, [overall(20)])
    expect(result.some((i) => i.text.toLowerCase().includes('allocation'))).toBe(false)
  })

  it('allocation review IS included when fewer than 4 profile items fill the cap', () => {
    // Only hasGoals missing = 1 item; low rank should then appear
    const result = getRankChecklist({ hasAge: true, hasGender: true, hasReturn: true, hasGoals: false }, [overall(20)])
    expect(result.some((i) => i.text.toLowerCase().includes('goal'))).toBe(true)
    expect(result.some((i) => i.text.toLowerCase().includes('allocation'))).toBe(true)
    expect(result.length).toBe(2)
  })
})

// ---------------------------------------------------------------------------
// href values
// ---------------------------------------------------------------------------

describe('getRankChecklist — href values', () => {
  it('profile items link to settings', () => {
    const result = getRankChecklist({ hasAge: false, hasGender: false, hasReturn: false, hasGoals: true }, [])
    result.forEach((item) => expect(item.href).toBeTruthy())
  })

  it('goal item links to goals route', () => {
    const result = getRankChecklist({ ...fullProfile, hasGoals: false }, [])
    const goal = result.find((i) => i.text.toLowerCase().includes('goal'))
    expect(goal?.href).toBeTruthy()
    expect(goal?.href).toContain('goal')
  })
})

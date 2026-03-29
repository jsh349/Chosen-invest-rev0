import { getRankReviewSummary } from '@/lib/utils/rank-review-summary'
import type { RankResult } from '@/lib/types/rank'

function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}
function ret(pct: number | null, missing?: string): RankResult {
  return { type: 'investment_return', label: 'Return', percentile: pct, message: '', ...(missing && { missingField: missing }) }
}

const fullProfile = { hasAge: true, hasGender: true, hasReturn: true }
const noAge       = { hasAge: false, hasGender: false, hasReturn: false }
const noGender    = { hasAge: true,  hasGender: false, hasReturn: true  }
const noReturn    = { hasAge: true,  hasGender: true,  hasReturn: false }
const noGenderReturn = { hasAge: true, hasGender: false, hasReturn: false }

// ---------------------------------------------------------------------------
// Returns null when all items are ok
// ---------------------------------------------------------------------------
describe('returns null when nothing needs attention', () => {
  it('full profile + both ranks above median → null', () => {
    expect(getRankReviewSummary([overall(60), ret(55)], fullProfile)).toBeNull()
  })

  it('full profile + both ranks exactly at 50 → null', () => {
    expect(getRankReviewSummary([overall(50), ret(50)], fullProfile)).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Profile item
// ---------------------------------------------------------------------------
describe('profile item', () => {
  it('missing age → profile status is missing', () => {
    const result = getRankReviewSummary([overall(60)], noAge)!
    const profile = result.find((i) => i.topic === 'profile')!
    expect(profile.status).toBe('missing')
    expect(profile.note).toMatch(/birth year/i)
  })

  it('missing gender only → profile status is review', () => {
    const result = getRankReviewSummary([overall(60), ret(60)], noGender)!
    const profile = result.find((i) => i.topic === 'profile')!
    expect(profile.status).toBe('review')
    expect(profile.note).toMatch(/gender/i)
  })

  it('missing return only → profile status is review', () => {
    const result = getRankReviewSummary([overall(60)], noReturn)!
    const profile = result.find((i) => i.topic === 'profile')!
    expect(profile.status).toBe('review')
    expect(profile.note).toMatch(/return estimate/i)
  })

  it('missing gender and return → profile status is review with combined note', () => {
    const result = getRankReviewSummary([overall(60)], noGenderReturn)!
    const profile = result.find((i) => i.topic === 'profile')!
    expect(profile.status).toBe('review')
    expect(profile.note).toMatch(/gender/i)
    expect(profile.note).toMatch(/return/i)
  })

  it('all profile inputs set → profile status is ok', () => {
    // Only non-ok if wealth or return need review
    const result = getRankReviewSummary([overall(40), ret(60)], fullProfile)!
    const profile = result.find((i) => i.topic === 'profile')!
    expect(profile.status).toBe('ok')
  })
})

// ---------------------------------------------------------------------------
// Wealth item
// ---------------------------------------------------------------------------
describe('wealth item', () => {
  it('overall null → wealth status is missing', () => {
    const result = getRankReviewSummary([], fullProfile)!
    const wealth = result.find((i) => i.topic === 'wealth')!
    expect(wealth.status).toBe('missing')
  })

  it('overall < 50 → wealth status is review', () => {
    const result = getRankReviewSummary([overall(40), ret(60)], fullProfile)!
    const wealth = result.find((i) => i.topic === 'wealth')!
    expect(wealth.status).toBe('review')
    expect(wealth.note).toMatch(/below.*median/i)
  })

  it('overall = 49 → wealth status is review', () => {
    const result = getRankReviewSummary([overall(49), ret(60)], fullProfile)!
    const wealth = result.find((i) => i.topic === 'wealth')!
    expect(wealth.status).toBe('review')
  })

  it('overall = 50 → wealth status is ok', () => {
    const result = getRankReviewSummary([overall(50), ret(40)], fullProfile)!
    const wealth = result.find((i) => i.topic === 'wealth')!
    expect(wealth.status).toBe('ok')
  })

  it('overall >= 75 → wealth status is ok', () => {
    const result = getRankReviewSummary([overall(80), ret(40)], fullProfile)!
    const wealth = result.find((i) => i.topic === 'wealth')!
    expect(wealth.status).toBe('ok')
  })
})

// ---------------------------------------------------------------------------
// Return item
// ---------------------------------------------------------------------------
describe('return item', () => {
  it('return null (no estimate) → return status is missing', () => {
    const result = getRankReviewSummary([overall(60)], noReturn)!
    const retItem = result.find((i) => i.topic === 'return')!
    expect(retItem.status).toBe('missing')
    expect(retItem.note).toMatch(/no return estimate/i)
  })

  it('return < 50 → return status is review', () => {
    const result = getRankReviewSummary([overall(60), ret(30)], fullProfile)!
    const retItem = result.find((i) => i.topic === 'return')!
    expect(retItem.status).toBe('review')
    expect(retItem.note).toMatch(/below.*median/i)
  })

  it('return = 50 → return status is ok', () => {
    const result = getRankReviewSummary([overall(60), ret(50)], fullProfile)!
    // All ok → null
    expect(result).toBeNull()
  })

  it('return >= 75 → return status is ok', () => {
    const result = getRankReviewSummary([overall(60), ret(80)], fullProfile)
    expect(result).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// Structure
// ---------------------------------------------------------------------------
describe('structure', () => {
  it('always returns all 3 items when block is shown', () => {
    const result = getRankReviewSummary([overall(40)], fullProfile)!
    expect(result).toHaveLength(3)
    const topics = result.map((i) => i.topic)
    expect(topics).toContain('profile')
    expect(topics).toContain('wealth')
    expect(topics).toContain('return')
  })

  it('every item has label, status, note, topic', () => {
    const result = getRankReviewSummary([overall(40)], fullProfile)!
    for (const item of result) {
      expect(typeof item.label).toBe('string')
      expect(typeof item.note).toBe('string')
      expect(['ok', 'review', 'missing']).toContain(item.status)
      expect(['profile', 'wealth', 'return']).toContain(item.topic)
    }
  })
})

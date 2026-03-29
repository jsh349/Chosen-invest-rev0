import { getRankInputExplanation } from '@/lib/utils/rank-input-explanation'

describe('getRankInputExplanation', () => {
  // Full inputs — no explanation needed
  it('returns null when all three inputs are present', () => {
    expect(getRankInputExplanation({ hasAge: true, hasGender: true, hasReturn: true })).toBeNull()
  })

  // Assets only
  it('returns asset-only sentence when no optional inputs are set', () => {
    const result = getRankInputExplanation({ hasAge: false, hasGender: false, hasReturn: false })
    expect(result).toBe('Based on your asset total only.')
  })

  // Single optional input
  it('returns asset + age sentence', () => {
    const result = getRankInputExplanation({ hasAge: true, hasGender: false, hasReturn: false })
    expect(result).toBe('Based on your asset total and age.')
  })

  it('returns asset + gender sentence', () => {
    const result = getRankInputExplanation({ hasAge: false, hasGender: true, hasReturn: false })
    expect(result).toBe('Based on your asset total and gender.')
  })

  it('returns asset + return sentence', () => {
    const result = getRankInputExplanation({ hasAge: false, hasGender: false, hasReturn: true })
    expect(result).toBe('Based on your asset total and estimated return.')
  })

  // Two optional inputs
  it('returns asset + age + gender sentence', () => {
    const result = getRankInputExplanation({ hasAge: true, hasGender: true, hasReturn: false })
    expect(result).toBe('Based on your asset total, age, and gender.')
  })

  it('returns asset + age + return sentence', () => {
    const result = getRankInputExplanation({ hasAge: true, hasGender: false, hasReturn: true })
    expect(result).toBe('Based on your asset total, age, and estimated return.')
  })

  it('returns asset + gender + return sentence', () => {
    const result = getRankInputExplanation({ hasAge: false, hasGender: true, hasReturn: true })
    expect(result).toBe('Based on your asset total, gender, and estimated return.')
  })

  // Returned sentences are non-empty strings (not null) for all partial cases
  it('never returns an empty string', () => {
    const partialCases = [
      { hasAge: false, hasGender: false, hasReturn: false },
      { hasAge: true,  hasGender: false, hasReturn: false },
      { hasAge: false, hasGender: true,  hasReturn: false },
      { hasAge: false, hasGender: false, hasReturn: true  },
      { hasAge: true,  hasGender: true,  hasReturn: false },
      { hasAge: true,  hasGender: false, hasReturn: true  },
      { hasAge: false, hasGender: true,  hasReturn: true  },
    ]
    for (const flags of partialCases) {
      const result = getRankInputExplanation(flags)
      expect(typeof result).toBe('string')
      expect((result as string).length).toBeGreaterThan(0)
    }
  })
})

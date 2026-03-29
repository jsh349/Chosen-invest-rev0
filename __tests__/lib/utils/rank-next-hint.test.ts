import { getNextRankHint } from '@/lib/utils/rank-next-hint'

const ALL_PRESENT = { hasAge: true, hasGender: true, hasReturn: true }

describe('getNextRankHint', () => {
  it('returns null when all profile inputs are present', () => {
    expect(getNextRankHint(ALL_PRESENT)).toBeNull()
  })

  it('returns the age hint when birth year is missing (highest priority)', () => {
    const hint = getNextRankHint({ hasAge: false, hasGender: false, hasReturn: false })
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/birth year/i)
    expect(hint!.href).toBeTruthy()
  })

  it('returns the age hint even when gender and return are present', () => {
    const hint = getNextRankHint({ hasAge: false, hasGender: true, hasReturn: true })
    expect(hint!.text).toMatch(/birth year/i)
  })

  it('returns the gender hint when age is present but gender is missing', () => {
    const hint = getNextRankHint({ hasAge: true, hasGender: false, hasReturn: false })
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/gender/i)
  })

  it('returns the gender hint even when return is present', () => {
    const hint = getNextRankHint({ hasAge: true, hasGender: false, hasReturn: true })
    expect(hint!.text).toMatch(/gender/i)
  })

  it('returns the return hint when age and gender are present but return is missing', () => {
    const hint = getNextRankHint({ hasAge: true, hasGender: true, hasReturn: false })
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/return/i)
  })

  it('each hint includes a settings href', () => {
    const cases = [
      { hasAge: false, hasGender: false, hasReturn: false },
      { hasAge: true,  hasGender: false, hasReturn: false },
      { hasAge: true,  hasGender: true,  hasReturn: false },
    ]
    for (const profile of cases) {
      const hint = getNextRankHint(profile)
      expect(hint).not.toBeNull()
      expect(typeof hint!.href).toBe('string')
      expect(hint!.href.length).toBeGreaterThan(0)
    }
  })
})

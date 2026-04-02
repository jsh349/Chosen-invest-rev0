import { getNextRankHint, getPrimaryRankNextAction } from '@/lib/utils/rank-next-hint'
import type { RankResult } from '@/lib/types/rank'

function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}

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

// ---------------------------------------------------------------------------
// getPrimaryRankNextAction — confidence-sensitive wording
// ---------------------------------------------------------------------------

const fullProfile = { hasAge: true, hasGender: true, hasReturn: true, hasGoals: true }

describe('getPrimaryRankNextAction — confidence-sensitive wording', () => {
  it('uses strong wording for portfolio action in normal confidence', () => {
    const hint = getPrimaryRankNextAction({ ...fullProfile }, [overall(30)])
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/to improve your rank position/)
  })

  it('uses soft wording for portfolio action when isLowConfidence', () => {
    const hint = getPrimaryRankNextAction({ ...fullProfile }, [overall(30)], { isLowConfidence: true })
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/consider reviewing/i)
    expect(hint!.text).not.toMatch(/to improve your rank position/)
  })

  it('uses strong wording for goals action in normal confidence', () => {
    const hint = getPrimaryRankNextAction({ ...fullProfile, hasGoals: false }, [overall(80)])
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/to build on your wealth rank/)
  })

  it('uses soft wording for goals action when isLowConfidence', () => {
    const hint = getPrimaryRankNextAction({ ...fullProfile, hasGoals: false }, [overall(80)], { isLowConfidence: true })
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/consider setting/i)
    expect(hint!.text).not.toMatch(/to build on your wealth rank/)
  })

  it('profile-completion hints share the same route regardless of confidence level', () => {
    const highConf = getPrimaryRankNextAction({ ...fullProfile, hasAge: false }, [], { isLowConfidence: false })
    const lowConf  = getPrimaryRankNextAction({ ...fullProfile, hasAge: false }, [], { isLowConfidence: true })
    // Both route to Settings; wording is intentionally softened when isLowConfidence = true
    // (removes "unlock" framing since the added rank will also use fallback data)
    expect(highConf!.href).toBe(lowConf!.href)
    expect(lowConf!.text).not.toMatch(/unlock/)
    expect(highConf!.text).toMatch(/unlock/)
  })

  it('portfolio and goals hints preserve their route regardless of confidence', () => {
    const port = getPrimaryRankNextAction({ ...fullProfile }, [overall(30)], { isLowConfidence: true })
    const goal = getPrimaryRankNextAction({ ...fullProfile, hasGoals: false }, [overall(80)], { isLowConfidence: true })
    expect(port!.href).toContain('portfolio')
    expect(goal!.href).toContain('goal')
  })

  it('gender hint uses soft wording (no "peer") when isLowConfidence', () => {
    const hint = getPrimaryRankNextAction(
      { ...fullProfile, hasGender: false },
      [],
      { isLowConfidence: true },
    )
    expect(hint).not.toBeNull()
    expect(hint!.text).not.toMatch(/peer/)
    expect(hint!.text).toMatch(/age and gender comparison/)
  })

  it('gender hint uses peer framing in normal confidence', () => {
    const hint = getPrimaryRankNextAction(
      { ...fullProfile, hasGender: false },
      [],
      { isLowConfidence: false },
    )
    expect(hint).not.toBeNull()
    expect(hint!.text).toMatch(/peer/)
  })
})

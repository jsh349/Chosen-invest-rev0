import { getRankInterpretation } from '@/lib/utils/rank-interpretation'

describe('getRankInterpretation', () => {
  it('returns favorable copy at 75th percentile', () => {
    expect(getRankInterpretation(75)).toContain('favorably')
  })

  it('returns favorable copy at 90th percentile', () => {
    expect(getRankInterpretation(90)).toContain('favorably')
  })

  it('returns above-midpoint copy at 50th percentile', () => {
    expect(getRankInterpretation(50)).toContain('Above')
  })

  it('returns above-midpoint copy at 74th percentile', () => {
    expect(getRankInterpretation(74)).toContain('Above')
  })

  it('returns near-midpoint copy at 40th percentile', () => {
    expect(getRankInterpretation(40)).toContain('Near')
  })

  it('returns near-midpoint copy at 49th percentile', () => {
    expect(getRankInterpretation(49)).toContain('Near')
  })

  it('returns below-midpoint copy at 25th percentile', () => {
    expect(getRankInterpretation(25)).toContain('Below')
  })

  it('returns below-midpoint copy at 39th percentile', () => {
    expect(getRankInterpretation(39)).toContain('Below')
  })

  it('returns lower-range copy at 24th percentile', () => {
    expect(getRankInterpretation(24)).toContain('lower range')
  })

  it('returns lower-range copy at 0', () => {
    expect(getRankInterpretation(0)).toContain('lower range')
  })

  it('returns a non-empty string for every integer 0–100', () => {
    for (let i = 0; i <= 100; i++) {
      expect(getRankInterpretation(i).length).toBeGreaterThan(0)
    }
  })
})

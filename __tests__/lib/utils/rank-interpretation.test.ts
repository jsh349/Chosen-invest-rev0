import { getRankInterpretation } from '@/lib/utils/rank-interpretation'

describe('getRankInterpretation', () => {
  // Normal (non-fallback) — uses "benchmark median"
  it('returns well-above copy at 75th percentile', () => {
    expect(getRankInterpretation(75)).toContain('Well above')
    expect(getRankInterpretation(75)).toContain('benchmark median')
  })

  it('returns well-above copy at 90th percentile', () => {
    expect(getRankInterpretation(90)).toContain('Well above')
  })

  it('returns above-midpoint copy at 50th percentile', () => {
    expect(getRankInterpretation(50)).toContain('Above')
    expect(getRankInterpretation(50)).toContain('benchmark median')
  })

  it('returns above-midpoint copy at 74th percentile', () => {
    expect(getRankInterpretation(74)).toContain('Above')
  })

  it('returns just-below copy at 40th percentile', () => {
    expect(getRankInterpretation(40)).toContain('Just below')
    expect(getRankInterpretation(40)).toContain('benchmark median')
  })

  it('returns just-below copy at 49th percentile', () => {
    expect(getRankInterpretation(49)).toContain('Just below')
    expect(getRankInterpretation(49)).toContain('benchmark median')
  })

  it('returns below-midpoint copy at 25th percentile', () => {
    expect(getRankInterpretation(25)).toContain('Below')
  })

  it('returns below-midpoint copy at 39th percentile', () => {
    expect(getRankInterpretation(39)).toContain('Below')
  })

  it('returns well-below copy at 24th percentile', () => {
    expect(getRankInterpretation(24)).toContain('Well below')
  })

  it('returns well-below copy at 0', () => {
    expect(getRankInterpretation(0)).toContain('Well below')
  })

  it('returns a non-empty string for every integer 0–100', () => {
    for (let i = 0; i <= 100; i++) {
      expect(getRankInterpretation(i).length).toBeGreaterThan(0)
    }
  })

  // Low-confidence (fallback) — "benchmark median" is used consistently;
  // confidence level is communicated by getRankConfidenceNote, not the interpretation band.
  describe('isLowConfidence = true', () => {
    it('still uses benchmark median wording at 75th percentile', () => {
      const result = getRankInterpretation(75, true)
      expect(result).toContain('Well above')
      expect(result).toContain('benchmark median')
    })

    it('still uses benchmark median wording at 50th percentile', () => {
      const result = getRankInterpretation(50, true)
      expect(result).toContain('benchmark median')
    })

    it('still uses benchmark median wording at 0th percentile', () => {
      const result = getRankInterpretation(0, true)
      expect(result).toContain('Well below')
      expect(result).toContain('benchmark median')
    })

    it('returns a non-empty string for every integer 0–100 in low-confidence mode', () => {
      for (let i = 0; i <= 100; i++) {
        expect(getRankInterpretation(i, true).length).toBeGreaterThan(0)
      }
    })
  })
})

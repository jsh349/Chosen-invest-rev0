import { percentileBandLabel } from '@/lib/utils/percentile-label'

describe('percentileBandLabel', () => {
  // Tier boundaries — exact cutoff values
  it('returns Top 10% at 90', () => expect(percentileBandLabel(90)).toBe('Top 10%'))
  it('returns Top 10% at 100', () => expect(percentileBandLabel(100)).toBe('Top 10%'))
  it('returns Top 25% at 75', () => expect(percentileBandLabel(75)).toBe('Top 25%'))
  it('returns Top 25% at 89', () => expect(percentileBandLabel(89)).toBe('Top 25%'))
  it('returns Above median at 50', () => expect(percentileBandLabel(50)).toBe('Above median'))
  it('returns Above median at 74', () => expect(percentileBandLabel(74)).toBe('Above median'))
  it('returns Around median at 40', () => expect(percentileBandLabel(40)).toBe('Around median'))
  it('returns Around median at 49', () => expect(percentileBandLabel(49)).toBe('Around median'))
  it('returns Below median at 25', () => expect(percentileBandLabel(25)).toBe('Below median'))
  it('returns Below median at 39', () => expect(percentileBandLabel(39)).toBe('Below median'))
  it('returns Below lower quartile at 24', () => expect(percentileBandLabel(24)).toBe('Below lower quartile'))
  it('returns Below lower quartile at 0', () => expect(percentileBandLabel(0)).toBe('Below lower quartile'))
})

import { toPercentage } from '@/lib/utils/percentage'

describe('toPercentage', () => {
  it('returns 0 when total is 0 (division-by-zero guard)', () => {
    expect(toPercentage(0, 0)).toBe(0)
    expect(toPercentage(100, 0)).toBe(0)
  })

  it('returns correct percentage for a partial value', () => {
    expect(toPercentage(25, 100)).toBe(25)
    expect(toPercentage(1, 4)).toBe(25)
  })

  it('returns 100 when part equals total', () => {
    expect(toPercentage(200, 200)).toBe(100)
  })
})

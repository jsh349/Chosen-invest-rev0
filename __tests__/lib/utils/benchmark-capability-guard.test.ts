import { capabilityGuardedResult } from '@/lib/utils/benchmark-capability-guard'

describe('capabilityGuardedResult', () => {
  describe('when supported = true', () => {
    it('returns null (proceed with normal calculation)', () => {
      expect(capabilityGuardedResult(true, 'overall_wealth', 'Overall Wealth Rank')).toBeNull()
    })

    it('returns null for every rank type', () => {
      expect(capabilityGuardedResult(true, 'age_based',         'Age-Based Rank')).toBeNull()
      expect(capabilityGuardedResult(true, 'age_gender',        'Age + Gender Rank')).toBeNull()
      expect(capabilityGuardedResult(true, 'investment_return', 'Investment Return Rank')).toBeNull()
    })
  })

  describe('when supported = false', () => {
    it('returns a RankResult with null percentile', () => {
      const result = capabilityGuardedResult(false, 'overall_wealth', 'Overall Wealth Rank')
      expect(result).not.toBeNull()
      expect(result!.percentile).toBeNull()
    })

    it('preserves the given type and label', () => {
      const result = capabilityGuardedResult(false, 'age_based', 'Age-Based Rank')
      expect(result!.type).toBe('age_based')
      expect(result!.label).toBe('Age-Based Rank')
    })

    it('includes a non-empty message', () => {
      const result = capabilityGuardedResult(false, 'investment_return', 'Investment Return Rank')
      expect(typeof result!.message).toBe('string')
      expect(result!.message.length).toBeGreaterThan(0)
    })

    it('does not include a detail field', () => {
      const result = capabilityGuardedResult(false, 'age_gender', 'Age + Gender Rank')
      expect(result!.detail).toBeUndefined()
    })
  })
})

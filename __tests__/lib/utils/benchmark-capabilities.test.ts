import { getBenchmarkCapabilities } from '@/lib/utils/benchmark-capabilities'

describe('getBenchmarkCapabilities', () => {
  // --- default ---
  describe('default source', () => {
    const caps = getBenchmarkCapabilities('default')

    it('supports all four rank categories', () => {
      expect(caps.supportsWealth).toBe(true)
      expect(caps.supportsAge).toBe(true)
      expect(caps.supportsAgeGender).toBe(true)
      expect(caps.supportsReturn).toBe(true)
    })

    it('is not fallback-only', () => {
      expect(caps.isFallbackOnly).toBe(false)
    })
  })

  // --- curated ---
  describe('curated source', () => {
    const caps = getBenchmarkCapabilities('curated')

    it('supports all four rank categories', () => {
      expect(caps.supportsWealth).toBe(true)
      expect(caps.supportsAge).toBe(true)
      expect(caps.supportsAgeGender).toBe(true)
      expect(caps.supportsReturn).toBe(true)
    })

    it('is not fallback-only', () => {
      expect(caps.isFallbackOnly).toBe(false)
    })
  })

  // --- external stub ---
  describe('external source', () => {
    const caps = getBenchmarkCapabilities('external')

    it('supports all four rank categories', () => {
      expect(caps.supportsWealth).toBe(true)
      expect(caps.supportsAge).toBe(true)
      expect(caps.supportsAgeGender).toBe(true)
      expect(caps.supportsReturn).toBe(true)
    })

    it('is fallback-only (stub not yet connected)', () => {
      expect(caps.isFallbackOnly).toBe(true)
    })
  })

  // --- unknown / future source ---
  describe('unknown source ID', () => {
    const caps = getBenchmarkCapabilities('some_future_source')

    it('returns all capabilities as true (safe assumption)', () => {
      expect(caps.supportsWealth).toBe(true)
      expect(caps.supportsAge).toBe(true)
      expect(caps.supportsAgeGender).toBe(true)
      expect(caps.supportsReturn).toBe(true)
    })

    it('marks unknown source as fallback-only', () => {
      expect(caps.isFallbackOnly).toBe(true)
    })
  })
})

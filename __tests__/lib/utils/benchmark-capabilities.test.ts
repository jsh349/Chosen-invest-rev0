import { getBenchmarkCapabilities, getPartialCoverageNote } from '@/lib/utils/benchmark-capabilities'
import type { BenchmarkSourceCapabilities } from '@/lib/utils/benchmark-capabilities'

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

describe('getPartialCoverageNote', () => {
  const full: BenchmarkSourceCapabilities = {
    supportsWealth: true, supportsAge: true, supportsAgeGender: true, supportsReturn: true,
    isFallbackOnly: false,
  }

  it('returns null when all categories are supported', () => {
    expect(getPartialCoverageNote(full)).toBeNull()
  })

  it('returns null for fallback-only sources', () => {
    expect(getPartialCoverageNote({ ...full, supportsReturn: false, isFallbackOnly: true })).toBeNull()
  })

  it('lists a single missing category', () => {
    const note = getPartialCoverageNote({ ...full, supportsReturn: false })
    expect(note).toContain('investment return')
    expect(note).toMatch(/Not available from this source:/)
  })

  it('lists multiple missing categories', () => {
    const note = getPartialCoverageNote({ ...full, supportsAgeGender: false, supportsReturn: false })
    expect(note).toContain('age & gender')
    expect(note).toContain('investment return')
  })

  it('lists all missing categories when none are supported', () => {
    const note = getPartialCoverageNote({
      supportsWealth: false, supportsAge: false, supportsAgeGender: false, supportsReturn: false,
      isFallbackOnly: false,
    })
    expect(note).toContain('overall wealth')
    expect(note).toContain('age-based')
    expect(note).toContain('age & gender')
    expect(note).toContain('investment return')
  })
})

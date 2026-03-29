import { getBenchmarkHealthStatus } from '@/lib/utils/benchmark-health'
import type { BenchmarkSourceCapabilities } from '@/lib/utils/benchmark-capabilities'

const ALL_CAPS: BenchmarkSourceCapabilities = {
  supportsWealth:    true,
  supportsAge:       true,
  supportsAgeGender: true,
  supportsReturn:    true,
  isFallbackOnly:    false,
}

describe('getBenchmarkHealthStatus', () => {
  it('returns healthy when all capabilities are present and no fallback', () => {
    const result = getBenchmarkHealthStatus(ALL_CAPS, false)
    expect(result.status).toBe('healthy')
  })

  it('returns fallback when isUsingFallback is true, regardless of caps', () => {
    const result = getBenchmarkHealthStatus(ALL_CAPS, true)
    expect(result.status).toBe('fallback')
  })

  it('fallback takes priority over isFallbackOnly', () => {
    const stubCaps: BenchmarkSourceCapabilities = { ...ALL_CAPS, isFallbackOnly: true }
    const result = getBenchmarkHealthStatus(stubCaps, true)
    expect(result.status).toBe('fallback')
  })

  it('returns invalid when source is a stub (isFallbackOnly) and no fallback', () => {
    const stubCaps: BenchmarkSourceCapabilities = { ...ALL_CAPS, isFallbackOnly: true }
    const result = getBenchmarkHealthStatus(stubCaps, false)
    expect(result.status).toBe('invalid')
  })

  it('returns partial when supportsWealth is false', () => {
    const caps: BenchmarkSourceCapabilities = { ...ALL_CAPS, supportsWealth: false }
    const result = getBenchmarkHealthStatus(caps, false)
    expect(result.status).toBe('partial')
  })

  it('returns partial when supportsAge is false', () => {
    const caps: BenchmarkSourceCapabilities = { ...ALL_CAPS, supportsAge: false }
    const result = getBenchmarkHealthStatus(caps, false)
    expect(result.status).toBe('partial')
  })

  it('returns partial when supportsAgeGender is false', () => {
    const caps: BenchmarkSourceCapabilities = { ...ALL_CAPS, supportsAgeGender: false }
    const result = getBenchmarkHealthStatus(caps, false)
    expect(result.status).toBe('partial')
  })

  it('returns partial when supportsReturn is false', () => {
    const caps: BenchmarkSourceCapabilities = { ...ALL_CAPS, supportsReturn: false }
    const result = getBenchmarkHealthStatus(caps, false)
    expect(result.status).toBe('partial')
  })

  it('every result includes a non-empty note', () => {
    const cases: [BenchmarkSourceCapabilities, boolean][] = [
      [ALL_CAPS, false],
      [ALL_CAPS, true],
      [{ ...ALL_CAPS, isFallbackOnly: true }, false],
      [{ ...ALL_CAPS, supportsReturn: false }, false],
    ]
    for (const [caps, fallback] of cases) {
      const result = getBenchmarkHealthStatus(caps, fallback)
      expect(typeof result.note).toBe('string')
      expect(result.note.length).toBeGreaterThan(0)
    }
  })
})

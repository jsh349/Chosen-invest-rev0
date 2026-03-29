import {
  BENCHMARK_SOURCE_PRECEDENCE,
  isKnownSourceId,
  sourcePrecedenceRank,
} from '@/lib/utils/benchmark-source-precedence'

describe('BENCHMARK_SOURCE_PRECEDENCE', () => {
  it('lists curated before external', () => {
    const ci = BENCHMARK_SOURCE_PRECEDENCE.indexOf('curated')
    const ei = BENCHMARK_SOURCE_PRECEDENCE.indexOf('external')
    expect(ci).toBeLessThan(ei)
  })

  it('lists external before default', () => {
    const ei = BENCHMARK_SOURCE_PRECEDENCE.indexOf('external')
    const di = BENCHMARK_SOURCE_PRECEDENCE.indexOf('default')
    expect(ei).toBeLessThan(di)
  })

  it('ends with default as the final fallback', () => {
    const last = BENCHMARK_SOURCE_PRECEDENCE[BENCHMARK_SOURCE_PRECEDENCE.length - 1]
    expect(last).toBe('default')
  })
})

describe('isKnownSourceId', () => {
  it('returns true for "curated"', () => {
    expect(isKnownSourceId('curated')).toBe(true)
  })

  it('returns true for "external"', () => {
    expect(isKnownSourceId('external')).toBe(true)
  })

  it('returns true for "default"', () => {
    expect(isKnownSourceId('default')).toBe(true)
  })

  it('returns false for an unknown string', () => {
    expect(isKnownSourceId('legacy')).toBe(false)
  })

  it('returns false for an empty string', () => {
    expect(isKnownSourceId('')).toBe(false)
  })

  it('returns false for a partial match', () => {
    expect(isKnownSourceId('cur')).toBe(false)
  })
})

describe('sourcePrecedenceRank', () => {
  it('curated has a lower rank number than external', () => {
    expect(sourcePrecedenceRank('curated')).toBeLessThan(sourcePrecedenceRank('external'))
  })

  it('external has a lower rank number than default', () => {
    expect(sourcePrecedenceRank('external')).toBeLessThan(sourcePrecedenceRank('default'))
  })

  it('returns Infinity for an unknown id', () => {
    expect(sourcePrecedenceRank('unknown')).toBe(Infinity)
  })

  it('unknown id ranks lower than any known id', () => {
    const known = Math.max(
      sourcePrecedenceRank('curated'),
      sourcePrecedenceRank('external'),
      sourcePrecedenceRank('default'),
    )
    expect(sourcePrecedenceRank('anything_else')).toBeGreaterThan(known)
  })
})

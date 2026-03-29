import { validateBuckets, runBenchmarkQA } from '@/lib/utils/benchmark-qa'
import type { BenchmarkBucket } from '@/lib/types/rank'

function bucket(overrides: Partial<BenchmarkBucket> = {}): BenchmarkBucket {
  return { minValue: 0, maxValue: 100_000, percentile: 50, ...overrides }
}

describe('validateBuckets', () => {
  it('returns no issues for a clean bucket', () => {
    expect(validateBuckets('test', [bucket()])).toHaveLength(0)
  })

  it('returns no issues for Infinity boundaries', () => {
    expect(validateBuckets('test', [
      bucket({ minValue: 0, maxValue: 100_000 }),
      bucket({ minValue: 100_000, maxValue: Infinity }),
    ])).toHaveLength(0)
  })

  it('returns no issues for -Infinity lower bound', () => {
    expect(validateBuckets('test', [
      bucket({ minValue: -Infinity, maxValue: 0 }),
    ])).toHaveLength(0)
  })

  // Dataset-level
  it('flags empty array', () => {
    const issues = validateBuckets('test', [])
    expect(issues).toHaveLength(1)
    expect(issues[0].index).toBe(-1)
  })

  // percentile
  it('flags NaN percentile', () => {
    const issues = validateBuckets('test', [bucket({ percentile: NaN })])
    expect(issues.some((i) => i.message.includes('percentile'))).toBe(true)
  })

  it('flags percentile above 100', () => {
    const issues = validateBuckets('test', [bucket({ percentile: 101 })])
    expect(issues.some((i) => i.message.includes('101'))).toBe(true)
  })

  it('flags negative percentile', () => {
    const issues = validateBuckets('test', [bucket({ percentile: -1 })])
    expect(issues.some((i) => i.message.includes('-1'))).toBe(true)
  })

  it('accepts percentile at boundary values 0 and 100', () => {
    expect(validateBuckets('test', [bucket({ percentile: 0 })])).toHaveLength(0)
    expect(validateBuckets('test', [bucket({ percentile: 100 })])).toHaveLength(0)
  })

  // minValue / maxValue
  it('flags NaN minValue', () => {
    const issues = validateBuckets('test', [bucket({ minValue: NaN })])
    expect(issues.some((i) => i.message.includes('minValue'))).toBe(true)
  })

  it('flags NaN maxValue', () => {
    const issues = validateBuckets('test', [bucket({ maxValue: NaN })])
    expect(issues.some((i) => i.message.includes('maxValue'))).toBe(true)
  })

  it('flags maxValue <= minValue', () => {
    const issues = validateBuckets('test', [bucket({ minValue: 100, maxValue: 100 })])
    expect(issues.some((i) => i.message.includes('>'))).toBe(true)
  })

  it('flags maxValue < minValue', () => {
    const issues = validateBuckets('test', [bucket({ minValue: 200, maxValue: 100 })])
    expect(issues.some((i) => i.message.includes('>'))).toBe(true)
  })

  // ageRange
  it('accepts valid ageRange', () => {
    expect(validateBuckets('test', [bucket({ ageRange: [20, 29] })])).toHaveLength(0)
  })

  it('flags ageRange with lo > hi', () => {
    const issues = validateBuckets('test', [bucket({ ageRange: [40, 20] })])
    expect(issues.some((i) => i.message.includes('ageRange'))).toBe(true)
  })

  it('dataset name and index are present in issues', () => {
    const issues = validateBuckets('overallWealth', [bucket({ percentile: 999 })])
    expect(issues[0].dataset).toBe('overallWealth')
    expect(issues[0].index).toBe(0)
  })
})

describe('runBenchmarkQA', () => {
  it('returns 0 for all-clean datasets', () => {
    const count = runBenchmarkQA({
      test: [bucket(), bucket({ minValue: 100_000, maxValue: Infinity, percentile: 80 })],
    }, { silent: true })
    expect(count).toBe(0)
  })

  it('returns total issue count across datasets', () => {
    const count = runBenchmarkQA({
      a: [bucket({ percentile: NaN })],   // 1 issue
      b: [bucket({ maxValue: NaN })],     // 1 issue
    }, { silent: true })
    expect(count).toBe(2)
  })

  it('does not throw on empty input', () => {
    expect(() => runBenchmarkQA({}, { silent: true })).not.toThrow()
  })

  // Verify built-in benchmark data passes QA (regression: catches accidental data corruption)
  it('built-in benchmark datasets pass QA', () => {
    const {
      OVERALL_WEALTH_BUCKETS,
      AGE_BASED_BUCKETS,
      AGE_GENDER_BUCKETS,
      RETURN_BUCKETS,
    } = require('@/lib/mock/rank-benchmarks')
    const count = runBenchmarkQA({
      overallWealth: OVERALL_WEALTH_BUCKETS,
      ageBased:      AGE_BASED_BUCKETS,
      ageGender:     AGE_GENDER_BUCKETS,
      investmentReturn: RETURN_BUCKETS,
    }, { silent: true })
    expect(count).toBe(0)
  })
})

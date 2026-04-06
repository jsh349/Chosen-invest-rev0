import { checkBenchmarkCompatibility } from '@/lib/utils/benchmark-schema-guard'
import type { BenchmarkFile, BenchmarkRow } from '@/lib/types/benchmark-import'

// ── Fixtures ────────────────────────────────────────────────────────────────

const VALID_OW_ROW: BenchmarkRow    = { minValue: 0, maxValue: 100_000, percentile: 50 }
const VALID_AGE_ROW: BenchmarkRow   = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [30, 39] }
const VALID_AG_ROW: BenchmarkRow    = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [30, 39], gender: 'female' }
const VALID_IR_ROW: BenchmarkRow    = { minValue: 0, maxValue: 10, percentile: 50 }

function makeFile(overrides: Partial<BenchmarkFile> = {}): BenchmarkFile {
  return {
    version:          '1',
    source:           'Test Source',
    jurisdiction:     'US',
    currency:         'USD',
    vintageYear:      2022,
    overallWealth:    [VALID_OW_ROW],
    ageBased:         [VALID_AGE_ROW],
    ageGender:        [VALID_AG_ROW],
    investmentReturn: [VALID_IR_ROW],
    ...overrides,
  }
}

// ── Happy path ───────────────────────────────────────────────────────────────

describe('checkBenchmarkCompatibility — compatible files', () => {
  it('returns compatible for a fully valid file', () => {
    const result = checkBenchmarkCompatibility(makeFile())
    expect(result.compatible).toBe(true)
    expect(result.reasons).toHaveLength(0)
  })

  it('returns compatible when rows have extra optional fields', () => {
    const rowWithAll: BenchmarkRow = { minValue: 0, maxValue: 500_000, percentile: 75, ageRange: [40, 49], gender: 'male' }
    const result = checkBenchmarkCompatibility(makeFile({
      overallWealth: [rowWithAll],
      ageBased:      [rowWithAll],
      ageGender:     [rowWithAll],
    }))
    expect(result.compatible).toBe(true)
  })

  it('returns compatible when sections have multiple rows and only one qualifies', () => {
    const noAge: BenchmarkRow = { minValue: 0, maxValue: 50_000, percentile: 25 }
    const result = checkBenchmarkCompatibility(makeFile({
      ageBased:  [noAge, VALID_AGE_ROW],   // second row has ageRange
      ageGender: [noAge, VALID_AG_ROW],    // second row has ageRange + gender
    }))
    expect(result.compatible).toBe(true)
  })
})

// ── ageBased failures ────────────────────────────────────────────────────────

describe('checkBenchmarkCompatibility — ageBased section', () => {
  it('flags incompatibility when no ageBased row has ageRange', () => {
    const rowNoAge: BenchmarkRow = { minValue: 0, maxValue: 100_000, percentile: 50 }
    const result = checkBenchmarkCompatibility(makeFile({ ageBased: [rowNoAge] }))
    expect(result.compatible).toBe(false)
    expect(result.reasons.some((r) => r.includes('ageBased'))).toBe(true)
  })

  it('does not flag overallWealth or ageGender when only ageBased fails', () => {
    const rowNoAge: BenchmarkRow = { minValue: 0, maxValue: 100_000, percentile: 50 }
    const result = checkBenchmarkCompatibility(makeFile({ ageBased: [rowNoAge] }))
    expect(result.reasons.every((r) => r.includes('ageBased'))).toBe(true)
    expect(result.reasons).toHaveLength(1)
  })
})

// ── ageGender failures ───────────────────────────────────────────────────────

describe('checkBenchmarkCompatibility — ageGender section', () => {
  it('flags incompatibility when no ageGender row has gender', () => {
    const rowNoGender: BenchmarkRow = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [30, 39] }
    const result = checkBenchmarkCompatibility(makeFile({ ageGender: [rowNoGender] }))
    expect(result.compatible).toBe(false)
    expect(result.reasons.some((r) => r.includes('ageGender'))).toBe(true)
  })

  it('flags incompatibility when ageGender rows have gender but no ageRange', () => {
    const rowNoAge = { minValue: 0, maxValue: 100_000, percentile: 50, gender: 'male' } as BenchmarkRow
    const result = checkBenchmarkCompatibility(makeFile({ ageGender: [rowNoAge] }))
    expect(result.compatible).toBe(false)
    expect(result.reasons.some((r) => r.includes('ageGender'))).toBe(true)
  })
})

// ── overallWealth / investmentReturn failures ─────────────────────────────────

describe('checkBenchmarkCompatibility — overallWealth and investmentReturn', () => {
  it('flags incompatibility when all overallWealth rows fail normalization', () => {
    const badRow = { percentile: 0 } // percentile 0 is out of range 1–99
    const result = checkBenchmarkCompatibility(makeFile({ overallWealth: [badRow as BenchmarkRow] }))
    expect(result.compatible).toBe(false)
    expect(result.reasons.some((r) => r.includes('overallWealth'))).toBe(true)
  })

  it('flags incompatibility when all investmentReturn rows fail normalization', () => {
    const badRow = { percentile: 100 } // percentile 100 is out of range 1–99
    const result = checkBenchmarkCompatibility(makeFile({ investmentReturn: [badRow as BenchmarkRow] }))
    expect(result.compatible).toBe(false)
    expect(result.reasons.some((r) => r.includes('investmentReturn'))).toBe(true)
  })
})

// ── Multiple failures ────────────────────────────────────────────────────────

describe('checkBenchmarkCompatibility — multiple failures', () => {
  it('reports all failing sections, not just the first', () => {
    const noAgeRow: BenchmarkRow  = { minValue: 0, maxValue: 100_000, percentile: 50 }
    const result = checkBenchmarkCompatibility(makeFile({
      ageBased:  [noAgeRow],   // missing ageRange
      ageGender: [noAgeRow],   // missing ageRange + gender
    }))
    expect(result.compatible).toBe(false)
    expect(result.reasons).toHaveLength(2)
    expect(result.reasons.some((r) => r.includes('ageBased'))).toBe(true)
    expect(result.reasons.some((r) => r.includes('ageGender'))).toBe(true)
  })
})

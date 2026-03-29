import { previewBenchmarkFile } from '@/lib/utils/benchmark-preview'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const VALID_ROW = { minValue: 0, maxValue: null, percentile: 50 }
const AGE_ROW   = { ...VALID_ROW, ageRange: [30, 39] as [number, number] }
const GENDER_ROW = { ...VALID_ROW, ageRange: [30, 39] as [number, number], gender: 'male' as const }

const VALID_FILE: BenchmarkFile = {
  version:          '1',
  source:           'Test Source 2024',
  jurisdiction:     'US',
  currency:         'USD',
  vintageYear:      2024,
  overallWealth:    [VALID_ROW, { minValue: null, maxValue: 0, percentile: 10 }],
  ageBased:         [AGE_ROW],
  ageGender:        [GENDER_ROW],
  investmentReturn: [VALID_ROW],
}

// ---------------------------------------------------------------------------
// Valid input
// ---------------------------------------------------------------------------

describe('previewBenchmarkFile — valid input', () => {
  const summary = previewBenchmarkFile(VALID_FILE)

  it('isValid is true', () => {
    expect(summary.isValid).toBe(true)
  })

  it('schemaError is null', () => {
    expect(summary.schemaError).toBeNull()
  })

  it('sections is not null', () => {
    expect(summary.sections).not.toBeNull()
  })

  it('counts rows per section correctly', () => {
    expect(summary.sections!.overallWealth.rowCount).toBe(2)
    expect(summary.sections!.ageBased.rowCount).toBe(1)
    expect(summary.sections!.ageGender.rowCount).toBe(1)
    expect(summary.sections!.investmentReturn.rowCount).toBe(1)
  })

  it('totalRowCount equals sum of all section row counts', () => {
    expect(summary.totalRowCount).toBe(5)
  })

  it('totalIssueCount is 0 for a clean file', () => {
    expect(summary.totalIssueCount).toBe(0)
  })

  it('issueCount is 0 for every section', () => {
    expect(summary.sections!.overallWealth.issueCount).toBe(0)
    expect(summary.sections!.ageBased.issueCount).toBe(0)
    expect(summary.sections!.ageGender.issueCount).toBe(0)
    expect(summary.sections!.investmentReturn.issueCount).toBe(0)
  })

  it('unknownKeys is empty for a conforming file', () => {
    expect(summary.unknownKeys).toHaveLength(0)
  })
})

// ---------------------------------------------------------------------------
// Unknown keys
// ---------------------------------------------------------------------------

describe('previewBenchmarkFile — unknown keys', () => {
  it('reports extra top-level keys as unknownKeys', () => {
    const withExtra = { ...VALID_FILE, customField: 'hello', _meta: 42 }
    const summary = previewBenchmarkFile(withExtra)
    expect(summary.unknownKeys).toContain('customField')
    expect(summary.unknownKeys).toContain('_meta')
  })

  it('file is still valid even with unknown keys (schema check passes)', () => {
    const withExtra = { ...VALID_FILE, extra: true }
    const summary = previewBenchmarkFile(withExtra)
    expect(summary.isValid).toBe(true)
    expect(summary.unknownKeys).toEqual(['extra'])
  })
})

// ---------------------------------------------------------------------------
// Schema failures
// ---------------------------------------------------------------------------

describe('previewBenchmarkFile — schema failures', () => {
  it('returns isValid=false and schemaError for null input', () => {
    const summary = previewBenchmarkFile(null)
    expect(summary.isValid).toBe(false)
    expect(summary.schemaError).not.toBeNull()
  })

  it('returns isValid=false for wrong version', () => {
    const bad = { ...VALID_FILE, version: '2' as never }
    const summary = previewBenchmarkFile(bad)
    expect(summary.isValid).toBe(false)
    expect(summary.schemaError).toMatch(/version/i)
  })

  it('returns sections=null when schema fails', () => {
    const summary = previewBenchmarkFile({ version: '1' })
    expect(summary.sections).toBeNull()
  })

  it('returns totalRowCount=0 when schema fails', () => {
    const summary = previewBenchmarkFile('not an object')
    expect(summary.totalRowCount).toBe(0)
    expect(summary.totalIssueCount).toBe(0)
  })

  it('reports unknownKeys even when schema fails', () => {
    const bad = { version: '1', unknownField: true }
    const summary = previewBenchmarkFile(bad)
    expect(summary.isValid).toBe(false)
    expect(summary.unknownKeys).toContain('unknownField')
  })
})

// ---------------------------------------------------------------------------
// QA issues
// ---------------------------------------------------------------------------

describe('previewBenchmarkFile — QA issues', () => {
  it('isValid=false and totalIssueCount>0 when a row has an invalid percentile', () => {
    const badFile: BenchmarkFile = {
      ...VALID_FILE,
      overallWealth: [{ minValue: 0, maxValue: null, percentile: 999 }],
    }
    const summary = previewBenchmarkFile(badFile)
    expect(summary.isValid).toBe(false)
    expect(summary.totalIssueCount).toBeGreaterThan(0)
    expect(summary.sections!.overallWealth.issueCount).toBeGreaterThan(0)
  })

  it('counts issues per-section independently', () => {
    const badFile: BenchmarkFile = {
      ...VALID_FILE,
      ageBased: [{ minValue: 100, maxValue: 50, percentile: 50, ageRange: [30, 39] }],
    }
    const summary = previewBenchmarkFile(badFile)
    expect(summary.sections!.ageBased.issueCount).toBeGreaterThan(0)
    expect(summary.sections!.overallWealth.issueCount).toBe(0)
  })
})

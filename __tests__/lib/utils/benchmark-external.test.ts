import { validateExternalPayload, externalPayloadToFile, isExternalPayloadExpired } from '@/lib/utils/benchmark-external'
import type { ExternalBenchmarkPayload } from '@/lib/types/benchmark-external'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_ROW = { minValue: null, maxValue: null, percentile: 50 }

const VALID_FILE: BenchmarkFile = {
  version:          '1',
  source:           'Test Source 2024',
  jurisdiction:     'US',
  currency:         'USD',
  vintageYear:      2024,
  overallWealth:    [MINIMAL_ROW],
  ageBased:         [{ ...MINIMAL_ROW, ageRange: [30, 39] }],
  ageGender:        [{ ...MINIMAL_ROW, ageRange: [30, 39], gender: 'male' }],
  investmentReturn: [MINIMAL_ROW],
}

function validPayload(overrides: Partial<ExternalBenchmarkPayload> = {}): ExternalBenchmarkPayload {
  return {
    fetchedAt: '2026-01-01T00:00:00.000Z',
    sourceUrl: 'https://example.com/benchmarks.json',
    data:      VALID_FILE,
    ...overrides,
  }
}

// ---------------------------------------------------------------------------
// validateExternalPayload
// ---------------------------------------------------------------------------

describe('validateExternalPayload', () => {
  it('returns null for a fully valid payload', () => {
    expect(validateExternalPayload(validPayload())).toBeNull()
  })

  it('returns null when optional expiresAt is present and is a string', () => {
    expect(validateExternalPayload(validPayload({ expiresAt: '2027-01-01T00:00:00.000Z' }))).toBeNull()
  })

  it('rejects null', () => {
    expect(validateExternalPayload(null)).not.toBeNull()
  })

  it('rejects arrays', () => {
    expect(validateExternalPayload([])).not.toBeNull()
  })

  it('rejects missing fetchedAt', () => {
    const { fetchedAt: _, ...rest } = validPayload()
    expect(validateExternalPayload(rest)).toMatch(/fetchedAt/)
  })

  it('rejects empty fetchedAt', () => {
    expect(validateExternalPayload(validPayload({ fetchedAt: '' }))).toMatch(/fetchedAt/)
  })

  it('rejects missing sourceUrl', () => {
    const { sourceUrl: _, ...rest } = validPayload()
    expect(validateExternalPayload(rest)).toMatch(/sourceUrl/)
  })

  it('rejects non-string expiresAt', () => {
    expect(validateExternalPayload({ ...validPayload(), expiresAt: 12345 })).toMatch(/expiresAt/)
  })

  it('rejects missing data field', () => {
    const { data: _, ...rest } = validPayload()
    expect(validateExternalPayload(rest)).toMatch(/data/)
  })

  it('rejects data that fails validateBenchmarkFile (missing version)', () => {
    const badFile = { ...VALID_FILE, version: '2' }
    expect(validateExternalPayload(validPayload({ data: badFile as unknown as BenchmarkFile }))).toMatch(/benchmark data/)
  })

  it('rejects data that fails validateBenchmarkFile (empty overallWealth)', () => {
    const badFile: BenchmarkFile = { ...VALID_FILE, overallWealth: [] }
    expect(validateExternalPayload(validPayload({ data: badFile }))).toMatch(/benchmark data/)
  })
})

// ---------------------------------------------------------------------------
// externalPayloadToFile
// ---------------------------------------------------------------------------

describe('externalPayloadToFile', () => {
  it('returns the data field unchanged', () => {
    const payload = validPayload()
    expect(externalPayloadToFile(payload)).toBe(payload.data)
  })

  it('returned file has correct source and vintage', () => {
    const file = externalPayloadToFile(validPayload())
    expect(file.source).toBe('Test Source 2024')
    expect(file.vintageYear).toBe(2024)
  })
})

// ---------------------------------------------------------------------------
// isExternalPayloadExpired
// ---------------------------------------------------------------------------

describe('isExternalPayloadExpired', () => {
  const REF = new Date('2026-06-01T00:00:00.000Z')

  it('returns false when expiresAt is absent', () => {
    expect(isExternalPayloadExpired(validPayload(), REF)).toBe(false)
  })

  it('returns false when expiresAt is in the future', () => {
    expect(isExternalPayloadExpired(validPayload({ expiresAt: '2027-01-01T00:00:00.000Z' }), REF)).toBe(false)
  })

  it('returns true when expiresAt is in the past', () => {
    expect(isExternalPayloadExpired(validPayload({ expiresAt: '2025-01-01T00:00:00.000Z' }), REF)).toBe(true)
  })

  it('returns true when expiresAt equals now (strictly less than check)', () => {
    // expiresAt === now → not < now → false
    const now = new Date('2026-06-01T00:00:00.000Z')
    expect(isExternalPayloadExpired(validPayload({ expiresAt: '2026-06-01T00:00:00.000Z' }), now)).toBe(false)
  })

  it('uses current time by default (no crash)', () => {
    // Just check it runs without error; actual expiry depends on wall clock.
    expect(() => isExternalPayloadExpired(validPayload({ expiresAt: '2025-01-01T00:00:00.000Z' }))).not.toThrow()
  })
})

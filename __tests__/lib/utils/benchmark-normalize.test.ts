import { normalizeRow, normalizeRows } from '@/lib/utils/benchmark-normalize'

// ── normalizeRow ──────────────────────────────────────────────────────────

describe('normalizeRow', () => {
  // ── happy path ────────────────────────────────────────────────────────

  it('passes through a valid BenchmarkRow unchanged', () => {
    const row = { minValue: 0, maxValue: 50_000, percentile: 25 }
    expect(normalizeRow(row)).toEqual(row)
  })

  it('passes through a row with explicit null bounds', () => {
    const row = { minValue: null, maxValue: null, percentile: 50 }
    expect(normalizeRow(row)).toEqual(row)
  })

  it('preserves optional ageRange when valid', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [30, 39] }
    expect(normalizeRow(row)).toEqual(row)
  })

  it('preserves optional gender when valid (male)', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, gender: 'male' }
    expect(normalizeRow(row)?.gender).toBe('male')
  })

  it('preserves optional gender when valid (female)', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, gender: 'female' }
    expect(normalizeRow(row)?.gender).toBe('female')
  })

  // ── bound coercion ─────────────────────────────────────────────────────

  it('coerces undefined bounds to null', () => {
    const row = { minValue: undefined, maxValue: undefined, percentile: 50 }
    expect(normalizeRow(row)).toEqual({ minValue: null, maxValue: null, percentile: 50 })
  })

  it('coerces ±Infinity to null', () => {
    const row = { minValue: -Infinity, maxValue: Infinity, percentile: 50 }
    expect(normalizeRow(row)).toEqual({ minValue: null, maxValue: null, percentile: 50 })
  })

  it('coerces string "Infinity" / "-Infinity" to null', () => {
    const row = { minValue: '-Infinity', maxValue: 'Infinity', percentile: 50 }
    expect(normalizeRow(row)).toEqual({ minValue: null, maxValue: null, percentile: 50 })
  })

  it('coerces string "null" to null', () => {
    const row = { minValue: 'null', maxValue: 'null', percentile: 50 }
    expect(normalizeRow(row)).toEqual({ minValue: null, maxValue: null, percentile: 50 })
  })

  // ── percentile coercion ────────────────────────────────────────────────

  it('coerces numeric string percentile', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: '75' }
    expect(normalizeRow(row)?.percentile).toBe(75)
  })

  // ── ageRange coercion ──────────────────────────────────────────────────

  it('coerces ageRange with numeric-string elements', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: ['30', '39'] }
    expect(normalizeRow(row)?.ageRange).toEqual([30, 39])
  })

  // ── unknown field stripping ────────────────────────────────────────────

  it('strips unknown extra fields', () => {
    const row = { minValue: 0, maxValue: 50_000, percentile: 50, extraField: 'ignored' }
    const result = normalizeRow(row)
    expect(result).toEqual({ minValue: 0, maxValue: 50_000, percentile: 50 })
    expect(result).not.toHaveProperty('extraField')
  })

  // ── rejection cases ────────────────────────────────────────────────────

  it('returns null for non-object inputs', () => {
    expect(normalizeRow(null)).toBeNull()
    expect(normalizeRow(undefined)).toBeNull()
    expect(normalizeRow('string')).toBeNull()
    expect(normalizeRow(42)).toBeNull()
    expect(normalizeRow([1, 2, 3])).toBeNull()
  })

  it('returns null when percentile is missing', () => {
    expect(normalizeRow({ minValue: 0, maxValue: 100_000 })).toBeNull()
  })

  it('returns null when percentile is 0 (below minimum)', () => {
    expect(normalizeRow({ minValue: 0, maxValue: 100_000, percentile: 0 })).toBeNull()
  })

  it('returns null when percentile is 100 (above maximum)', () => {
    expect(normalizeRow({ minValue: 0, maxValue: 100_000, percentile: 100 })).toBeNull()
  })

  it('returns null when percentile is NaN', () => {
    expect(normalizeRow({ minValue: 0, maxValue: 100_000, percentile: NaN })).toBeNull()
  })

  it('returns null when percentile is a non-numeric string', () => {
    expect(normalizeRow({ minValue: 0, maxValue: 100_000, percentile: 'high' })).toBeNull()
  })

  it('returns null when minValue is an unrecognisable type', () => {
    expect(normalizeRow({ minValue: {}, maxValue: null, percentile: 50 })).toBeNull()
  })

  it('returns null when maxValue is an unrecognisable type', () => {
    expect(normalizeRow({ minValue: null, maxValue: {}, percentile: 50 })).toBeNull()
  })

  it('returns null when ageRange is present but has invalid lo > hi', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [50, 30] }
    expect(normalizeRow(row)).toBeNull()
  })

  it('returns null when ageRange is present but wrong length', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, ageRange: [30] }
    expect(normalizeRow(row)).toBeNull()
  })

  it('returns null when gender is present but unrecognised', () => {
    const row = { minValue: 0, maxValue: 100_000, percentile: 50, gender: 'other' }
    expect(normalizeRow(row)).toBeNull()
  })
})

// ── normalizeRows ─────────────────────────────────────────────────────────

describe('normalizeRows', () => {
  it('normalises an array of valid rows', () => {
    const rows = [
      { minValue: 0, maxValue: 50_000, percentile: 25 },
      { minValue: 50_000, maxValue: null, percentile: 75 },
    ]
    const result = normalizeRows(rows)
    expect(result).toHaveLength(2)
  })

  it('filters out invalid rows and keeps valid ones', () => {
    const rows = [
      { minValue: 0, maxValue: 50_000, percentile: 25 },
      { notARow: true },
      null,
    ]
    const result = normalizeRows(rows)
    expect(result).toHaveLength(1)
    expect(result![0].percentile).toBe(25)
  })

  it('returns null when all rows are invalid', () => {
    expect(normalizeRows([{ notARow: true }, null])).toBeNull()
  })

  it('returns null for an empty array', () => {
    expect(normalizeRows([])).toBeNull()
  })

  it('coerces each row independently', () => {
    const rows = [
      { minValue: '-Infinity', maxValue: '50000', percentile: '40' },
    ]
    const result = normalizeRows(rows)
    expect(result).toHaveLength(1)
    expect(result![0]).toEqual({ minValue: null, maxValue: 50_000, percentile: 40 })
  })
})

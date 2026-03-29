import type { BenchmarkRow } from '@/lib/types/benchmark-import'

// ── Private coercion helpers ───────────────────────────────────────────────

/** Coerces a value to a finite number, or returns null. */
function coerceNumber(v: unknown): number | null {
  if (typeof v === 'number' && isFinite(v) && !isNaN(v)) return v
  if (typeof v === 'string') {
    const n = parseFloat(v)
    if (!isNaN(n) && isFinite(n)) return n
  }
  return null
}

/**
 * Coerces a bound field to the JSON-safe BenchmarkRow convention:
 *   null   → no bound (caller supplies ±Infinity when converting to BenchmarkBucket)
 *   number → the finite value
 *
 * Tolerates: undefined, Infinity/-Infinity, string "null"/"Infinity"/"-Infinity"
 * — all treated as "no bound" (null).
 *
 * Returns `undefined` when the value is present but cannot be recognised,
 * so the caller can distinguish "unrecognisable" from "intentionally no bound".
 */
function coerceBound(v: unknown): number | null | undefined {
  if (v === null || v === undefined) return null
  if (v === Infinity || v === -Infinity) return null
  if (typeof v === 'string') {
    const lower = v.toLowerCase()
    if (lower === 'null' || lower === 'infinity' || lower === '-infinity') return null
    const n = parseFloat(v)
    if (!isNaN(n) && isFinite(n)) return n
  }
  if (typeof v === 'number' && !isNaN(v) && isFinite(v)) return v
  return undefined // unrecognisable — distinct from "no bound"
}

/** Coerces an ageRange to [number, number], or returns null if invalid. */
function coerceAgeRange(v: unknown): [number, number] | null {
  if (!Array.isArray(v) || v.length !== 2) return null
  const lo = coerceNumber(v[0])
  const hi = coerceNumber(v[1])
  if (lo === null || hi === null || lo > hi) return null
  return [lo, hi]
}

/** Narrows to the two gender values stored in BenchmarkRow. */
function coerceGender(v: unknown): 'male' | 'female' | null {
  if (v === 'male' || v === 'female') return v
  return null
}

// ── Public API ─────────────────────────────────────────────────────────────

/**
 * Normalizes an unknown value into a BenchmarkRow.
 *
 * Tolerates common shape variations from external or loosely-typed sources:
 * - `percentile` as a numeric string (e.g. "50")
 * - `minValue`/`maxValue` as undefined, ±Infinity, or string "null"/"Infinity"/"-Infinity"
 *   — all treated as no bound (null in the JSON-safe convention)
 * - `ageRange` elements as numeric strings (e.g. ["30", "39"])
 * - Unknown extra fields are silently dropped
 *
 * Returns null when the input is structurally unrecognisable or when a
 * required field cannot be coerced to an acceptable value.
 */
export function normalizeRow(raw: unknown): BenchmarkRow | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const r = raw as Record<string, unknown>

  // percentile — required; must resolve to a value in [1, 99]
  const pct = coerceNumber(r.percentile)
  if (pct === null || pct < 1 || pct > 99) return null

  // minValue / maxValue — `undefined` means unrecognisable, not "no bound"
  const minValue = coerceBound(r.minValue)
  const maxValue = coerceBound(r.maxValue)
  if (minValue === undefined || maxValue === undefined) return null

  // ageRange — optional; if present, must be a valid [lo, hi] pair
  let ageRange: [number, number] | undefined
  if (r.ageRange !== undefined) {
    const ar = coerceAgeRange(r.ageRange)
    if (ar === null) return null // present but not valid
    ageRange = ar
  }

  // gender — optional; only 'male' and 'female' are stored in BenchmarkRow
  let gender: 'male' | 'female' | undefined
  if (r.gender !== undefined) {
    const g = coerceGender(r.gender)
    if (g === null) return null // present but unrecognised
    gender = g
  }

  return {
    minValue,
    maxValue,
    percentile: pct,
    ...(ageRange !== undefined ? { ageRange } : {}),
    ...(gender   !== undefined ? { gender   } : {}),
  }
}

/**
 * Normalizes an array of unknown values into BenchmarkRow[].
 *
 * Rows that cannot be normalised are silently dropped.
 * Returns null when the result is empty (nothing survived normalisation).
 */
export function normalizeRows(rows: unknown[]): BenchmarkRow[] | null {
  const result = rows
    .map(normalizeRow)
    .filter((r): r is BenchmarkRow => r !== null)
  return result.length > 0 ? result : null
}

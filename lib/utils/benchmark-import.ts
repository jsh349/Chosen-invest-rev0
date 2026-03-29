import type { BenchmarkBucket } from '@/lib/types/rank'
import type { BenchmarkFile, BenchmarkRow } from '@/lib/types/benchmark-import'

/**
 * Validates that an unknown value conforms to BenchmarkFile.
 * Returns null if valid, or an error string describing the problem.
 */
export function validateBenchmarkFile(data: unknown): string | null {
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    return 'Must be a JSON object.'
  }
  const d = data as Record<string, unknown>

  if (d.version !== '1')                                  return 'Unsupported version — expected "1".'
  if (typeof d.source !== 'string' || !d.source)         return 'Missing field: source.'
  if (typeof d.jurisdiction !== 'string' || !d.jurisdiction) return 'Missing field: jurisdiction.'
  if (typeof d.currency !== 'string' || !d.currency)     return 'Missing field: currency.'
  if (typeof d.vintageYear !== 'number')                  return 'Missing field: vintageYear (number).'

  for (const key of ['overallWealth', 'ageBased', 'ageGender', 'investmentReturn'] as const) {
    if (!Array.isArray(d[key]) || (d[key] as unknown[]).length === 0) {
      return `Missing or empty array: "${key}".`
    }
  }

  return null
}

/**
 * Converts a JSON-safe BenchmarkRow to a BenchmarkBucket used by the rank engine.
 * null minValue → -Infinity; null maxValue → +Infinity.
 */
export function rowToBucket(row: BenchmarkRow): BenchmarkBucket {
  return {
    minValue:  row.minValue  ?? -Infinity,
    maxValue:  row.maxValue  ?? Infinity,
    percentile: row.percentile,
    ...(row.ageRange ? { ageRange: row.ageRange } : {}),
    ...(row.gender   ? { gender:   row.gender   } : {}),
  }
}

/**
 * Converts a full BenchmarkFile into the four bucket arrays expected by
 * RankBenchmarksAdapter. Call this after validateBenchmarkFile returns null.
 */
export function parseBenchmarkFile(file: BenchmarkFile): {
  overallWealth:    BenchmarkBucket[]
  ageBased:         BenchmarkBucket[]
  ageGender:        BenchmarkBucket[]
  investmentReturn: BenchmarkBucket[]
} {
  return {
    overallWealth:    file.overallWealth.map(rowToBucket),
    ageBased:         file.ageBased.map(rowToBucket),
    ageGender:        file.ageGender.map(rowToBucket),
    investmentReturn: file.investmentReturn.map(rowToBucket),
  }
}

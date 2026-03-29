import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { validateBenchmarkFile, parseBenchmarkFile } from '@/lib/utils/benchmark-import'
import { validateBuckets } from '@/lib/utils/benchmark-qa'

/** Known top-level keys of BenchmarkFile — used to detect unsupported sections. */
const KNOWN_KEYS = new Set([
  'version', 'source', 'jurisdiction', 'currency', 'vintageYear',
  'overallWealth', 'ageBased', 'ageGender', 'investmentReturn',
])

export type BenchmarkSectionSummary = {
  /** Total rows parsed for this section. */
  rowCount:   number
  /** Number of QA issues found in this section (0 = clean). */
  issueCount: number
}

export type BenchmarkPreviewSummary = {
  /**
   * True only when the file passes schema validation AND all four sections
   * have zero QA issues. Safe to apply only when this is true.
   */
  isValid:         boolean
  /** First schema-level error, or null if the schema is valid. */
  schemaError:     string | null
  /**
   * Per-section breakdown. null when schema validation failed — sections
   * cannot be safely parsed from an invalid file.
   */
  sections: {
    overallWealth:    BenchmarkSectionSummary
    ageBased:         BenchmarkSectionSummary
    ageGender:        BenchmarkSectionSummary
    investmentReturn: BenchmarkSectionSummary
  } | null
  /** Total rows across all four sections (0 when schema failed). */
  totalRowCount:   number
  /** Total QA issues across all four sections (0 when schema failed). */
  totalIssueCount: number
  /**
   * Top-level keys present in the raw input that are not part of the
   * BenchmarkFile schema. Non-empty means the file has unrecognised fields.
   */
  unknownKeys:     string[]
}

const SECTION_NAMES = [
  'overallWealth',
  'ageBased',
  'ageGender',
  'investmentReturn',
] as const

/**
 * Returns a compact validation summary for a raw benchmark input.
 * Does not apply or stage the file — call validateBenchmarkFile() first if
 * you only need a pass/fail result.
 *
 * Never throws. Safe to call with any unknown value.
 */
export function previewBenchmarkFile(raw: unknown): BenchmarkPreviewSummary {
  // Detect unknown top-level keys before schema validation so they are
  // always reported, even if the schema check also fails.
  const unknownKeys: string[] = []
  if (typeof raw === 'object' && raw !== null && !Array.isArray(raw)) {
    for (const key of Object.keys(raw as Record<string, unknown>)) {
      if (!KNOWN_KEYS.has(key)) unknownKeys.push(key)
    }
  }

  // Schema check — stops here if the file shape is wrong.
  const schemaError = validateBenchmarkFile(raw)
  if (schemaError !== null) {
    return {
      isValid:         false,
      schemaError,
      sections:        null,
      totalRowCount:   0,
      totalIssueCount: 0,
      unknownKeys,
    }
  }

  // Schema passed — parse and run per-section QA.
  const buckets = parseBenchmarkFile(raw as BenchmarkFile)

  const sections = {} as NonNullable<BenchmarkPreviewSummary['sections']>
  let totalRowCount   = 0
  let totalIssueCount = 0

  for (const name of SECTION_NAMES) {
    const rows = buckets[name]
    const issues = validateBuckets(name, rows)
    sections[name]   = { rowCount: rows.length, issueCount: issues.length }
    totalRowCount   += rows.length
    totalIssueCount += issues.length
  }

  return {
    isValid:         totalIssueCount === 0,
    schemaError:     null,
    sections,
    totalRowCount,
    totalIssueCount,
    unknownKeys,
  }
}

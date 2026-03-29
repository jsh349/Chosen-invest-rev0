import type { BenchmarkFile } from '@/lib/types/benchmark-import'
import { normalizeRow } from '@/lib/utils/benchmark-normalize'

export type BenchmarkCompatibilityResult = {
  compatible: boolean
  /** Empty when compatible. Each string describes one structural problem. */
  reasons: string[]
}

/**
 * Checks that each section of a BenchmarkFile has the structural characteristics
 * the rank engine actually needs — beyond what validateBenchmarkFile guarantees.
 *
 * validateBenchmarkFile only ensures sections are non-empty arrays.
 * This guard checks that rows in each section carry the required extra fields:
 *   - ageBased: at least one normalized row must have ageRange
 *   - ageGender: at least one normalized row must have both ageRange and gender
 *   - overallWealth / investmentReturn: at least one row must survive normalizeRow()
 *
 * Returns { compatible: true, reasons: [] } on success.
 * Returns { compatible: false, reasons: [...] } describing every problem found.
 *
 * Never throws. Caller should fall back to the default source when compatible is false.
 */
export function checkBenchmarkCompatibility(file: BenchmarkFile): BenchmarkCompatibilityResult {
  const reasons: string[] = []

  // overallWealth — at least 1 row must survive normalization
  const owOk = file.overallWealth.some((r) => normalizeRow(r) !== null)
  if (!owOk) {
    reasons.push('overallWealth: no rows survived normalization — overall wealth ranking will have no data.')
  }

  // ageBased — at least 1 normalized row must carry ageRange
  const abOk = file.ageBased.some((r) => {
    const n = normalizeRow(r)
    return n !== null && n.ageRange !== undefined
  })
  if (!abOk) {
    reasons.push('ageBased: no rows have a valid ageRange — age-based ranking will produce no results for any age.')
  }

  // ageGender — at least 1 normalized row must carry both ageRange and gender
  const agOk = file.ageGender.some((r) => {
    const n = normalizeRow(r)
    return n !== null && n.ageRange !== undefined && n.gender !== undefined
  })
  if (!agOk) {
    reasons.push('ageGender: no rows have both ageRange and gender — age+gender ranking will produce no results.')
  }

  // investmentReturn — at least 1 row must survive normalization
  const irOk = file.investmentReturn.some((r) => normalizeRow(r) !== null)
  if (!irOk) {
    reasons.push('investmentReturn: no rows survived normalization — return ranking will have no data.')
  }

  return { compatible: reasons.length === 0, reasons }
}

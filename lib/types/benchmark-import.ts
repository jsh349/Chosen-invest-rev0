/**
 * JSON-safe typed format for imported rank benchmark files.
 *
 * Key difference from BenchmarkBucket: minValue and maxValue are
 * `number | null` because JSON cannot represent Infinity / -Infinity.
 * null minValue means no lower bound (-Infinity); null maxValue means
 * no upper bound (+Infinity). The converter in benchmark-import.ts
 * restores those values before passing to the rank engine.
 */

export type BenchmarkRow = {
  /** null = no lower bound (-Infinity) */
  minValue: number | null
  /** null = no upper bound (+Infinity) */
  maxValue: number | null
  /** Percentile this bucket represents, 1–99 */
  percentile: number
  /** Inclusive [min, max] age range — omit for non-age-stratified rows */
  ageRange?: [number, number]
  /** Omit for non-gender-stratified rows */
  gender?: 'male' | 'female'
}

export type BenchmarkFile = {
  /** Schema version — currently "1" */
  version: '1'
  /** Human-readable source description, e.g. "US Federal Reserve SCF 2022" */
  source: string
  /** ISO 3166-1 alpha-2 country code, e.g. "US" */
  jurisdiction: string
  /** ISO 4217 currency code the wealth values are denominated in, e.g. "USD" */
  currency: string
  /** Year the underlying survey / report was published */
  vintageYear: number
  overallWealth:     BenchmarkRow[]
  ageBased:          BenchmarkRow[]
  ageGender:         BenchmarkRow[]
  investmentReturn:  BenchmarkRow[]
}

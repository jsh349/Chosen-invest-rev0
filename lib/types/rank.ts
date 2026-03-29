export type RankType =
  | 'overall_wealth'
  | 'age_based'
  | 'age_gender'
  | 'investment_return'

export type GenderOption = 'male' | 'female' | 'other' | 'undisclosed'

export type BenchmarkBucket = {
  minValue: number
  maxValue: number
  percentile: number
  ageRange?: [number, number]
  gender?: GenderOption
}

export type RankDetail = {
  /** Human-readable description of who is being compared, e.g. "Adults aged 30–39, nationally" */
  comparisonBasis: string
  /** The value range of the matched benchmark band, e.g. "$100K – $250K" or "6% – 10%" */
  bandLabel: string
}

export type RankResult = {
  type: RankType
  label: string
  percentile: number | null
  message: string
  missingField?: string
  /** Present when a benchmark band was matched — omitted when data is missing */
  detail?: RankDetail
}

export type BenchmarkMeta = {
  version: string
  sourceLabel: string
  updatedAt: string   // ISO date string YYYY-MM-DD
  notes?: string
}

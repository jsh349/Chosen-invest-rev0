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

export type RankResult = {
  type: RankType
  label: string
  percentile: number | null
  message: string
  missingField?: string
}

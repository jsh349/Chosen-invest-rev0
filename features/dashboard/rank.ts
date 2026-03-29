import type { BenchmarkBucket, RankResult, GenderOption } from '@/lib/types/rank'
import { rankBenchmarksAdapter } from '@/lib/adapters/rank-benchmarks-adapter'

function findPercentile(buckets: BenchmarkBucket[], value: number): number {
  for (const b of buckets) {
    if (value >= b.minValue && value < b.maxValue) return b.percentile
  }
  return buckets[buckets.length - 1].percentile
}

function filterByAge(buckets: BenchmarkBucket[], age: number): BenchmarkBucket[] {
  return buckets.filter(
    (b) => b.ageRange && age >= b.ageRange[0] && age <= b.ageRange[1]
  )
}

export type RankInput = {
  totalAssetValue: number
  age?: number
  gender?: GenderOption
  annualReturnPct?: number
}

/** Compute only the Overall Wealth rank from total asset value. */
export function computeOverallWealthRank(totalAssetValue: number): RankResult {
  const percentile = findPercentile(rankBenchmarksAdapter.getOverallWealthBenchmarks(), totalAssetValue)
  const topPct = 100 - percentile

  let message: string
  if (percentile >= 90) message = `Top ${topPct}% nationally. Exceptional wealth position.`
  else if (percentile >= 70) message = `Top ${topPct}%. Above-average wealth accumulation.`
  else if (percentile >= 50) message = `Top ${topPct}%. Solid financial foundation building.`
  else message = `Top ${topPct}%. Growing steadily — keep building.`

  return {
    type: 'overall_wealth',
    label: 'Overall Wealth Rank',
    percentile,
    message,
  }
}

/** Compute Age-Based Wealth rank. Returns informational state if age is missing. */
export function computeAgeBasedRank(totalAssetValue: number, age?: number): RankResult {
  if (age == null) {
    return {
      type: 'age_based',
      label: 'Age-Based Rank',
      percentile: null,
      message: 'Set your birth year in Settings to see age-based ranking.',
      missingField: 'age',
    }
  }

  const ageBuckets = filterByAge(rankBenchmarksAdapter.getAgeBenchmarks(), age)
  if (ageBuckets.length === 0) {
    return {
      type: 'age_based',
      label: 'Age-Based Rank',
      percentile: null,
      message: `No benchmark data for age ${age}. Supported: 20–99.`,
    }
  }

  const percentile = findPercentile(ageBuckets, totalAssetValue)
  const topPct = 100 - percentile
  const ageRange = ageBuckets[0].ageRange!

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among ages ${ageRange[0]}–${ageRange[1]}. Excellent position.`
  else if (percentile >= 50) message = `Top ${topPct}% for your age group (${ageRange[0]}–${ageRange[1]}).`
  else message = `Top ${topPct}% in the ${ageRange[0]}–${ageRange[1]} bracket. Room to grow.`

  return {
    type: 'age_based',
    label: 'Age-Based Rank',
    percentile,
    message,
  }
}

/** Compute Age + Gender rank. Returns informational state if age or gender is missing/unsupported. */
export function computeAgeGenderRank(
  totalAssetValue: number,
  age?: number,
  gender?: GenderOption,
): RankResult {
  // Missing fields
  if (age == null && (gender == null || gender === 'undisclosed')) {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Set your birth year and gender in Settings to see this ranking.',
      missingField: 'age and gender',
    }
  }
  if (age == null) {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Set your birth year in Settings to see this ranking.',
      missingField: 'age',
    }
  }
  if (gender == null || gender === 'undisclosed' || gender === 'other') {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Set your gender in Settings to see this ranking. This is optional.',
      missingField: 'gender',
    }
  }

  // Filter by age + gender
  const buckets = rankBenchmarksAdapter.getAgeGenderBenchmarks().filter(
    (b) =>
      b.ageRange &&
      age >= b.ageRange[0] &&
      age <= b.ageRange[1] &&
      b.gender === gender
  )

  if (buckets.length === 0) {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: `No benchmark data for ${gender}, age ${age}. More buckets coming soon.`,
    }
  }

  const percentile = findPercentile(buckets, totalAssetValue)
  const topPct = 100 - percentile
  const ageRange = buckets[0].ageRange!
  const genderLabel = gender === 'male' ? 'men' : 'women'

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among ${genderLabel} ages ${ageRange[0]}–${ageRange[1]}. Outstanding.`
  else if (percentile >= 50) message = `Top ${topPct}% among ${genderLabel} in the ${ageRange[0]}–${ageRange[1]} group.`
  else message = `Top ${topPct}% among ${genderLabel} ages ${ageRange[0]}–${ageRange[1]}. Building steadily.`

  return {
    type: 'age_gender',
    label: 'Age + Gender Rank',
    percentile,
    message,
  }
}

/** Compute Investment Return rank from an estimated annual return %. */
export function computeReturnRank(annualReturnPct?: number): RankResult {
  if (annualReturnPct == null) {
    return {
      type: 'investment_return',
      label: 'Investment Return Rank',
      percentile: null,
      message: 'Enter your estimated annual return in Settings to see this ranking.',
      missingField: 'annualReturn',
    }
  }

  const percentile = findPercentile(rankBenchmarksAdapter.getReturnBenchmarks(), annualReturnPct)
  const topPct = 100 - percentile
  const sign = annualReturnPct >= 0 ? '+' : ''

  let message: string
  if (percentile >= 80) message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors.`
  else if (percentile >= 50) message = `${sign}${annualReturnPct.toFixed(1)}% return places you in the top ${topPct}%.`
  else message = `${sign}${annualReturnPct.toFixed(1)}% return — top ${topPct}%. Market conditions vary.`

  return {
    type: 'investment_return',
    label: 'Investment Return Rank',
    percentile,
    message,
  }
}

export function computeRanks(input: RankInput): RankResult[] {
  const { totalAssetValue, age, gender, annualReturnPct } = input
  const results: RankResult[] = []

  // 1. Overall Wealth
  results.push(computeOverallWealthRank(totalAssetValue))

  // 2. Age-Based
  if (age != null) {
    const ageBuckets = filterByAge(rankBenchmarksAdapter.getAgeBenchmarks(), age)
    if (ageBuckets.length > 0) {
      const pct = findPercentile(ageBuckets, totalAssetValue)
      results.push({
        type: 'age_based',
        label: 'Age-Based Rank',
        percentile: pct,
        message: `Among ${age}s age group, you rank in the top ${100 - pct}%.`,
      })
    } else {
      results.push({
        type: 'age_based',
        label: 'Age-Based Rank',
        percentile: null,
        message: 'No benchmark data available for your age range.',
      })
    }
  } else {
    results.push({
      type: 'age_based',
      label: 'Age-Based Rank',
      percentile: null,
      message: 'Add your age in Settings to see age-based ranking.',
      missingField: 'age',
    })
  }

  // 3. Age + Gender
  if (age != null && gender != null && gender !== 'other') {
    const agBuckets = rankBenchmarksAdapter.getAgeGenderBenchmarks().filter(
      (b) =>
        b.ageRange &&
        age >= b.ageRange[0] &&
        age <= b.ageRange[1] &&
        b.gender === gender
    )
    if (agBuckets.length > 0) {
      const pct = findPercentile(agBuckets, totalAssetValue)
      results.push({
        type: 'age_gender',
        label: 'Age + Gender Rank',
        percentile: pct,
        message: `Among ${gender} ${age}s group, you rank in the top ${100 - pct}%.`,
      })
    } else {
      results.push({
        type: 'age_gender',
        label: 'Age + Gender Rank',
        percentile: null,
        message: 'No benchmark data for your age + gender combination yet.',
      })
    }
  } else {
    const missing =
      age == null && gender == null
        ? 'age and gender'
        : age == null
          ? 'age'
          : 'gender'
    results.push({
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: `Add your ${missing} in Settings to see this ranking.`,
      missingField: missing,
    })
  }

  // 4. Investment Return
  if (annualReturnPct != null) {
    const pct = findPercentile(rankBenchmarksAdapter.getReturnBenchmarks(), annualReturnPct)
    results.push({
      type: 'investment_return',
      label: 'Investment Return Rank',
      percentile: pct,
      message: `Your ${annualReturnPct.toFixed(1)}% return ranks in the top ${100 - pct}%.`,
    })
  } else {
    results.push({
      type: 'investment_return',
      label: 'Investment Return Rank',
      percentile: null,
      message: 'Return data not yet available. Add transaction history to calculate.',
      missingField: 'annualReturn',
    })
  }

  return results
}

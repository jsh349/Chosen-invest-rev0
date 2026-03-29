import type { BenchmarkBucket, RankResult, RankDetail, GenderOption } from '@/lib/types/rank'
import { rankBenchmarksAdapter } from '@/lib/adapters/rank-benchmarks-adapter'

function findPercentile(buckets: BenchmarkBucket[], value: number): number {
  for (const b of buckets) {
    if (value >= b.minValue && value < b.maxValue) return b.percentile
  }
  return buckets[buckets.length - 1].percentile
}

function findBucket(buckets: BenchmarkBucket[], value: number): BenchmarkBucket {
  for (const b of buckets) {
    if (value >= b.minValue && value < b.maxValue) return b
  }
  return buckets[buckets.length - 1]
}

function filterByAge(buckets: BenchmarkBucket[], age: number): BenchmarkBucket[] {
  return buckets.filter(
    (b) => b.ageRange && age >= b.ageRange[0] && age <= b.ageRange[1]
  )
}

function fmtWealth(v: number): string {
  if (v >= 1_000_000) return `$${+(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `$${Math.round(v / 1_000)}K`
  return `$${Math.round(v)}`
}

function wealthBand(b: BenchmarkBucket): string {
  if (b.maxValue === Infinity) return `${fmtWealth(b.minValue)}+`
  return `${fmtWealth(b.minValue)} – ${fmtWealth(b.maxValue)}`
}

function returnBand(b: BenchmarkBucket): string {
  if (b.minValue === -Infinity) return `below ${b.maxValue.toFixed(0)}%`
  if (b.maxValue === Infinity)  return `${b.minValue.toFixed(0)}%+`
  return `${b.minValue.toFixed(0)}% – ${b.maxValue.toFixed(0)}%`
}

export type RankInput = {
  totalAssetValue: number
  age?: number
  gender?: GenderOption
  annualReturnPct?: number
}

/** Compute only the Overall Wealth rank from total asset value. */
export function computeOverallWealthRank(totalAssetValue: number): RankResult {
  const buckets = rankBenchmarksAdapter.getOverallWealthBenchmarks()
  const percentile = findPercentile(buckets, totalAssetValue)
  const bucket = findBucket(buckets, totalAssetValue)
  const topPct = 100 - percentile

  let message: string
  if (percentile >= 90) message = `Top ${topPct}% nationally — in the highest benchmark range.`
  else if (percentile >= 70) message = `Top ${topPct}% nationally — above average across all households.`
  else if (percentile >= 50) message = `Top ${topPct}% nationally — above the median benchmark.`
  else message = `Top ${topPct}% nationally — below the median benchmark.`

  const detail: RankDetail = {
    comparisonBasis: 'All households (national estimate)',
    bandLabel: wealthBand(bucket),
  }

  return { type: 'overall_wealth', label: 'Overall Wealth Rank', percentile, message, detail }
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
  const bucket = findBucket(ageBuckets, totalAssetValue)
  const topPct = 100 - percentile
  const ageRange = ageBuckets[0].ageRange!

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among adults aged ${ageRange[0]}–${ageRange[1]} — above average for this age group.`
  else if (percentile >= 50) message = `Top ${topPct}% among adults aged ${ageRange[0]}–${ageRange[1]} — around the median for this age group.`
  else message = `Top ${topPct}% among adults aged ${ageRange[0]}–${ageRange[1]} — below the median for this age group.`

  const detail: RankDetail = {
    comparisonBasis: `Adults aged ${ageRange[0]}–${ageRange[1]} (national estimate)`,
    bandLabel: wealthBand(bucket),
  }

  return { type: 'age_based', label: 'Age-Based Rank', percentile, message, detail }
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
      message: 'Set your gender in Settings to see this ranking.',
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
      message: `No benchmark data available for this age and gender combination.`,
    }
  }

  const percentile = findPercentile(buckets, totalAssetValue)
  const bucket = findBucket(buckets, totalAssetValue)
  const topPct = 100 - percentile
  const ageRange = buckets[0].ageRange!
  const genderLabel = gender === 'male' ? 'men' : 'women'
  const genderCapital = gender === 'male' ? 'Men' : 'Women'

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among ${genderLabel} aged ${ageRange[0]}–${ageRange[1]} — above average for this group.`
  else if (percentile >= 50) message = `Top ${topPct}% among ${genderLabel} aged ${ageRange[0]}–${ageRange[1]} — around the median for this group.`
  else message = `Top ${topPct}% among ${genderLabel} aged ${ageRange[0]}–${ageRange[1]} — below the median for this group.`

  const detail: RankDetail = {
    comparisonBasis: `${genderCapital} aged ${ageRange[0]}–${ageRange[1]} (national estimate)`,
    bandLabel: wealthBand(bucket),
  }

  return { type: 'age_gender', label: 'Age + Gender Rank', percentile, message, detail }
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

  const retBuckets = rankBenchmarksAdapter.getReturnBenchmarks()
  const percentile = findPercentile(retBuckets, annualReturnPct)
  const bucket = findBucket(retBuckets, annualReturnPct)
  const topPct = 100 - percentile
  const sign = annualReturnPct >= 0 ? '+' : ''

  let message: string
  if (percentile >= 80) message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors.`
  else if (percentile >= 50) message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors.`
  else message = `${sign}${annualReturnPct.toFixed(1)}% return — top ${topPct}%. Market conditions vary.`

  const detail: RankDetail = {
    comparisonBasis: 'All investors (by estimated annual return)',
    bandLabel: returnBand(bucket),
  }

  return { type: 'investment_return', label: 'Investment Return Rank', percentile, message, detail }
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

import type { BenchmarkBucket, RankResult, RankDetail, GenderOption } from '@/lib/types/rank'
import { rankBenchmarksAdapter, getActiveBenchmarkSourceId } from '@/lib/adapters/rank-benchmarks-adapter'
import { getBenchmarkCapabilities } from '@/lib/utils/benchmark-capabilities'
import { capabilityGuardedResult } from '@/lib/utils/benchmark-capability-guard'

/**
 * Reads capabilities fresh on each call, always reflecting the current localStorage
 * source preference. SSR-safe: getActiveBenchmarkSourceId() returns 'default' when
 * window is undefined.
 */
function getCaps() {
  return getBenchmarkCapabilities(getActiveBenchmarkSourceId())
}

/**
 * Returns the percentile for the bucket whose range contains `value`.
 * Bucket matching is inclusive-lower / exclusive-upper: `minValue <= value < maxValue`.
 * Values exceeding all bucket upper bounds fall into the last bucket (open-ended top tier).
 * Callers must guard against empty buckets before calling — all compute* functions check
 * buckets.length === 0 and return percentile: null early, so this branch should never fire.
 */
function findPercentile(buckets: BenchmarkBucket[], value: number): number {
  if (buckets.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[findPercentile] Called with empty bucket array — caller should have returned percentile: null.')
    }
    return 1
  }
  for (const b of buckets) {
    if (value >= b.minValue && value < b.maxValue) return b.percentile
  }
  return buckets[buckets.length - 1].percentile
}

function findBucket(buckets: BenchmarkBucket[], value: number): BenchmarkBucket {
  if (buckets.length === 0) {
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[findBucket] Called with empty bucket array — benchmark data may be corrupted.')
    }
    return { minValue: 0, maxValue: Infinity, percentile: 1 }
  }
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
  if (v >= 1_000_000) return `${+(v / 1_000_000).toFixed(1)}M`
  if (v >= 1_000)     return `${Math.round(v / 1_000)}K`
  return `${Math.round(v)}`
}

function wealthBand(b: BenchmarkBucket): string {
  if (b.maxValue === Infinity) return `${fmtWealth(b.minValue)}+`
  return `${fmtWealth(b.minValue)} \u2013 ${fmtWealth(b.maxValue)}`
}

function returnBand(b: BenchmarkBucket): string {
  if (b.minValue === -Infinity) return `below ${b.maxValue.toFixed(0)}%`
  if (b.maxValue === Infinity)  return `${b.minValue.toFixed(0)}%+`
  return `${b.minValue.toFixed(0)}% – ${b.maxValue.toFixed(0)}%`
}

/** Compute only the Overall Wealth rank from total asset value. */
export function computeOverallWealthRank(totalAssetValue: number): RankResult {
  const guard = capabilityGuardedResult(getCaps().supportsWealth, 'overall_wealth', 'Overall Wealth Rank')
  if (guard) return guard
  const buckets = rankBenchmarksAdapter.getOverallWealthBenchmarks()
  if (buckets.length === 0) {
    return { type: 'overall_wealth', label: 'Overall Wealth Rank', percentile: null, message: 'Benchmark data unavailable.' }
  }
  const percentile = findPercentile(buckets, totalAssetValue)
  const bucket = findBucket(buckets, totalAssetValue)
  const topPct = Math.max(0, Math.min(100, 100 - percentile))

  let message: string
  if (percentile >= 90) message = `Top ${topPct}% — in the upper benchmark range.`
  else if (percentile >= 70) message = `Top ${topPct}% — above the benchmark median.`
  else if (percentile >= 50) message = `Top ${topPct}% — above the benchmark median.`
  else message = `Top ${topPct}% — below the benchmark median.`

  const detail: RankDetail = {
    comparisonBasis: 'All households (national estimate)',
    bandLabel: wealthBand(bucket),
  }

  return { type: 'overall_wealth', label: 'Overall Wealth Rank', percentile, message, detail }
}

/** Compute Age-Based Wealth rank. Returns informational state if age is missing. */
export function computeAgeBasedRank(totalAssetValue: number, age?: number): RankResult {
  const guard = capabilityGuardedResult(getCaps().supportsAge, 'age_based', 'Age-Based Rank')
  if (guard) return guard
  if (age == null) {
    return {
      type: 'age_based',
      label: 'Age-Based Rank',
      percentile: null,
      message: 'Add your birth year in Settings to unlock age-based ranking.',
      missingField: 'birth year',
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
  const topPct = Math.max(0, Math.min(100, 100 - percentile))
  const ageRange = ageBuckets[0].ageRange!

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among adults aged ${ageRange[0]}–${ageRange[1]} — above the median for this age group.`
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
  const guard = capabilityGuardedResult(getCaps().supportsAgeGender, 'age_gender', 'Age + Gender Rank')
  if (guard) return guard
  // Missing fields
  if (age == null && (gender == null || gender === 'undisclosed')) {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Add your birth year and gender in Settings to unlock this ranking.',
      missingField: 'birth year and gender',
    }
  }
  if (age == null) {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Add your birth year in Settings to unlock this ranking.',
      missingField: 'birth year',
    }
  }
  if (gender == null || gender === 'undisclosed') {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Add your gender in Settings to unlock this ranking.',
      missingField: 'gender',
    }
  }
  if (gender === 'other') {
    return {
      type: 'age_gender',
      label: 'Age + Gender Rank',
      percentile: null,
      message: 'Age + gender ranking is available for male/female benchmarks only.',
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
  const topPct = Math.max(0, Math.min(100, 100 - percentile))
  const ageRange = buckets[0].ageRange!
  const genderLabel = gender === 'male' ? 'men' : 'women'
  const genderCapital = gender === 'male' ? 'Men' : 'Women'

  let message: string
  if (percentile >= 75) message = `Top ${topPct}% among ${genderLabel} aged ${ageRange[0]}–${ageRange[1]} — above the median for this group.`
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
  const guard = capabilityGuardedResult(getCaps().supportsReturn, 'investment_return', 'Investment Return Rank')
  if (guard) return guard
  if (annualReturnPct == null) {
    return {
      type: 'investment_return',
      label: 'Investment Return Rank',
      percentile: null,
      message: 'Add your estimated annual return in Settings to unlock this ranking.',
      missingField: 'annual return',
    }
  }

  const retBuckets = rankBenchmarksAdapter.getReturnBenchmarks()
  if (retBuckets.length === 0) {
    return { type: 'investment_return', label: 'Investment Return Rank', percentile: null, message: 'Benchmark data unavailable.' }
  }
  const percentile = findPercentile(retBuckets, annualReturnPct)
  const bucket = findBucket(retBuckets, annualReturnPct)
  const topPct = Math.max(0, Math.min(100, 100 - percentile))
  const sign = annualReturnPct >= 0 ? '+' : ''

  let message: string
  if (percentile >= 80) message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors, above the benchmark median.`
  else if (percentile >= 50) message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors, near the benchmark median.`
  else message = `${sign}${annualReturnPct.toFixed(1)}% annual return — top ${topPct}% of investors, below the benchmark median.`

  const detail: RankDetail = {
    comparisonBasis: 'All investors (by estimated annual return)',
    bandLabel: returnBand(bucket),
  }

  return { type: 'investment_return', label: 'Investment Return Rank', percentile, message, detail }
}

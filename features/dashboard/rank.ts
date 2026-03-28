import type { BenchmarkBucket, RankResult, GenderOption } from '@/lib/types/rank'
import {
  OVERALL_WEALTH_BUCKETS,
  AGE_BASED_BUCKETS,
  AGE_GENDER_BUCKETS,
  RETURN_BUCKETS,
} from '@/lib/mock/rank-benchmarks'

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

export function computeRanks(input: RankInput): RankResult[] {
  const { totalAssetValue, age, gender, annualReturnPct } = input
  const results: RankResult[] = []

  // 1. Overall Wealth
  results.push({
    type: 'overall_wealth',
    label: 'Overall Wealth Rank',
    percentile: findPercentile(OVERALL_WEALTH_BUCKETS, totalAssetValue),
    message: formatWealthMessage(
      findPercentile(OVERALL_WEALTH_BUCKETS, totalAssetValue)
    ),
  })

  // 2. Age-Based
  if (age != null) {
    const ageBuckets = filterByAge(AGE_BASED_BUCKETS, age)
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
    const agBuckets = AGE_GENDER_BUCKETS.filter(
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
    const pct = findPercentile(RETURN_BUCKETS, annualReturnPct)
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

function formatWealthMessage(percentile: number): string {
  if (percentile >= 90) return `Top ${100 - percentile}% nationally. Exceptional position.`
  if (percentile >= 70) return `Top ${100 - percentile}%. Above-average wealth accumulation.`
  if (percentile >= 50) return `Top ${100 - percentile}%. Solid financial foundation.`
  return `Building momentum. You're at the ${percentile}th percentile.`
}

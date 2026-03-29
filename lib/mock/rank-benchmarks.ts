import type { BenchmarkBucket } from '@/lib/types/rank'

/**
 * Mock benchmark data based loosely on US household wealth distributions.
 * These are simplified placeholders — not real statistical data.
 */

/** Overall wealth percentile buckets (all ages, all genders) */
export const OVERALL_WEALTH_BUCKETS: BenchmarkBucket[] = [
  { minValue: 0,         maxValue: 10_000,     percentile: 15 },
  { minValue: 10_000,    maxValue: 50_000,     percentile: 30 },
  { minValue: 50_000,    maxValue: 100_000,    percentile: 45 },
  { minValue: 100_000,   maxValue: 250_000,    percentile: 60 },
  { minValue: 250_000,   maxValue: 500_000,    percentile: 75 },
  { minValue: 500_000,   maxValue: 1_000_000,  percentile: 85 },
  { minValue: 1_000_000, maxValue: 2_500_000,  percentile: 93 },
  { minValue: 2_500_000, maxValue: Infinity,   percentile: 98 },
]

/** Age-based wealth percentile buckets */
export const AGE_BASED_BUCKETS: BenchmarkBucket[] = [
  // 20–29
  { minValue: 0,       maxValue: 10_000,   percentile: 40, ageRange: [20, 29] },
  { minValue: 10_000,  maxValue: 50_000,   percentile: 65, ageRange: [20, 29] },
  { minValue: 50_000,  maxValue: 100_000,  percentile: 80, ageRange: [20, 29] },
  { minValue: 100_000, maxValue: Infinity,  percentile: 95, ageRange: [20, 29] },
  // 30–39
  { minValue: 0,       maxValue: 30_000,   percentile: 30, ageRange: [30, 39] },
  { minValue: 30_000,  maxValue: 100_000,  percentile: 50, ageRange: [30, 39] },
  { minValue: 100_000, maxValue: 300_000,  percentile: 70, ageRange: [30, 39] },
  { minValue: 300_000, maxValue: Infinity,  percentile: 90, ageRange: [30, 39] },
  // 40–49
  { minValue: 0,       maxValue: 50_000,   percentile: 25, ageRange: [40, 49] },
  { minValue: 50_000,  maxValue: 200_000,  percentile: 50, ageRange: [40, 49] },
  { minValue: 200_000, maxValue: 500_000,  percentile: 70, ageRange: [40, 49] },
  { minValue: 500_000, maxValue: Infinity,  percentile: 90, ageRange: [40, 49] },
  // 50–59
  { minValue: 0,       maxValue: 80_000,   percentile: 25, ageRange: [50, 59] },
  { minValue: 80_000,  maxValue: 300_000,  percentile: 50, ageRange: [50, 59] },
  { minValue: 300_000, maxValue: 800_000,  percentile: 70, ageRange: [50, 59] },
  { minValue: 800_000, maxValue: Infinity,  percentile: 90, ageRange: [50, 59] },
  // 60+
  { minValue: 0,       maxValue: 100_000,  percentile: 25, ageRange: [60, 99] },
  { minValue: 100_000, maxValue: 400_000,  percentile: 50, ageRange: [60, 99] },
  { minValue: 400_000, maxValue: 1_000_000, percentile: 70, ageRange: [60, 99] },
  { minValue: 1_000_000, maxValue: Infinity, percentile: 90, ageRange: [60, 99] },
]

/** Age + gender wealth percentile buckets (simplified: male/female offsets) */
export const AGE_GENDER_BUCKETS: BenchmarkBucket[] = [
  // Male 20–29
  { minValue: 0,       maxValue: 12_000,   percentile: 40, ageRange: [20, 29], gender: 'male' },
  { minValue: 12_000,  maxValue: 60_000,   percentile: 65, ageRange: [20, 29], gender: 'male' },
  { minValue: 60_000,  maxValue: 120_000,  percentile: 80, ageRange: [20, 29], gender: 'male' },
  { minValue: 120_000, maxValue: Infinity,  percentile: 95, ageRange: [20, 29], gender: 'male' },
  // Female 20–29
  { minValue: 0,       maxValue: 8_000,    percentile: 40, ageRange: [20, 29], gender: 'female' },
  { minValue: 8_000,   maxValue: 40_000,   percentile: 65, ageRange: [20, 29], gender: 'female' },
  { minValue: 40_000,  maxValue: 90_000,   percentile: 80, ageRange: [20, 29], gender: 'female' },
  { minValue: 90_000,  maxValue: Infinity,  percentile: 95, ageRange: [20, 29], gender: 'female' },
  // Male 30–39
  { minValue: 0,       maxValue: 35_000,   percentile: 30, ageRange: [30, 39], gender: 'male' },
  { minValue: 35_000,  maxValue: 120_000,  percentile: 50, ageRange: [30, 39], gender: 'male' },
  { minValue: 120_000, maxValue: 350_000,  percentile: 70, ageRange: [30, 39], gender: 'male' },
  { minValue: 350_000, maxValue: Infinity,  percentile: 90, ageRange: [30, 39], gender: 'male' },
  // Female 30–39
  { minValue: 0,       maxValue: 25_000,   percentile: 30, ageRange: [30, 39], gender: 'female' },
  { minValue: 25_000,  maxValue: 80_000,   percentile: 50, ageRange: [30, 39], gender: 'female' },
  { minValue: 80_000,  maxValue: 250_000,  percentile: 70, ageRange: [30, 39], gender: 'female' },
  { minValue: 250_000, maxValue: Infinity,  percentile: 90, ageRange: [30, 39], gender: 'female' },
  // Male 40–49
  { minValue: 0,       maxValue: 60_000,   percentile: 25, ageRange: [40, 49], gender: 'male' },
  { minValue: 60_000,  maxValue: 250_000,  percentile: 50, ageRange: [40, 49], gender: 'male' },
  { minValue: 250_000, maxValue: 600_000,  percentile: 70, ageRange: [40, 49], gender: 'male' },
  { minValue: 600_000, maxValue: Infinity,  percentile: 90, ageRange: [40, 49], gender: 'male' },
  // Female 40–49
  { minValue: 0,       maxValue: 40_000,   percentile: 25, ageRange: [40, 49], gender: 'female' },
  { minValue: 40_000,  maxValue: 180_000,  percentile: 50, ageRange: [40, 49], gender: 'female' },
  { minValue: 180_000, maxValue: 450_000,  percentile: 70, ageRange: [40, 49], gender: 'female' },
  { minValue: 450_000, maxValue: Infinity,  percentile: 90, ageRange: [40, 49], gender: 'female' },
  // Male 50–59
  { minValue: 0,       maxValue: 95_000,   percentile: 25, ageRange: [50, 59], gender: 'male' },
  { minValue: 95_000,  maxValue: 350_000,  percentile: 50, ageRange: [50, 59], gender: 'male' },
  { minValue: 350_000, maxValue: 950_000,  percentile: 70, ageRange: [50, 59], gender: 'male' },
  { minValue: 950_000, maxValue: Infinity,  percentile: 90, ageRange: [50, 59], gender: 'male' },
  // Female 50–59
  { minValue: 0,       maxValue: 65_000,   percentile: 25, ageRange: [50, 59], gender: 'female' },
  { minValue: 65_000,  maxValue: 250_000,  percentile: 50, ageRange: [50, 59], gender: 'female' },
  { minValue: 250_000, maxValue: 650_000,  percentile: 70, ageRange: [50, 59], gender: 'female' },
  { minValue: 650_000, maxValue: Infinity,  percentile: 90, ageRange: [50, 59], gender: 'female' },
  // Male 60+
  { minValue: 0,         maxValue: 120_000,   percentile: 25, ageRange: [60, 99], gender: 'male' },
  { minValue: 120_000,   maxValue: 470_000,   percentile: 50, ageRange: [60, 99], gender: 'male' },
  { minValue: 470_000,   maxValue: 1_200_000, percentile: 70, ageRange: [60, 99], gender: 'male' },
  { minValue: 1_200_000, maxValue: Infinity,   percentile: 90, ageRange: [60, 99], gender: 'male' },
  // Female 60+
  { minValue: 0,         maxValue: 80_000,    percentile: 25, ageRange: [60, 99], gender: 'female' },
  { minValue: 80_000,    maxValue: 330_000,   percentile: 50, ageRange: [60, 99], gender: 'female' },
  { minValue: 330_000,   maxValue: 850_000,   percentile: 70, ageRange: [60, 99], gender: 'female' },
  { minValue: 850_000,   maxValue: Infinity,   percentile: 90, ageRange: [60, 99], gender: 'female' },
]

/** Investment return percentile buckets (annualized %, all profiles) */
export const RETURN_BUCKETS: BenchmarkBucket[] = [
  { minValue: -Infinity, maxValue: 0,   percentile: 10 },
  { minValue: 0,         maxValue: 3,   percentile: 25 },
  { minValue: 3,         maxValue: 6,   percentile: 45 },
  { minValue: 6,         maxValue: 10,  percentile: 65 },
  { minValue: 10,        maxValue: 15,  percentile: 80 },
  { minValue: 15,        maxValue: 25,  percentile: 92 },
  { minValue: 25,        maxValue: Infinity, percentile: 98 },
]

import type { BenchmarkBucket, BenchmarkMeta } from '@/lib/types/rank'

/**
 * Benchmark data derived from the 2022 US Survey of Consumer Finances (SCF).
 * Values approximate published percentile tables from the Federal Reserve.
 * Gender-split buckets use a rough ±10-15% offset as a stylized gap estimate.
 */

export const BENCHMARK_META: BenchmarkMeta = {
  version:     '2.0.0',
  sourceLabel: 'Based on 2022 US Survey of Consumer Finances (SCF) published percentiles',
  updatedAt:   '2025-05-01',
  notes:       'Derived from Federal Reserve 2022 SCF summary tables. Not raw microdata.',
}

/* ------------------------------------------------------------------ */
/*  Overall wealth percentile buckets (all ages, all genders)         */
/*  Reference points: p25 ~$43K, p50 ~$193K, p75 ~$570K,             */
/*  p90 ~$1.62M, p95 ~$3.7M, p99 ~$13.7M                            */
/* ------------------------------------------------------------------ */
export const OVERALL_WEALTH_BUCKETS: BenchmarkBucket[] = [
  { minValue: 0,           maxValue: 12_500,      percentile: 10 },
  { minValue: 12_500,      maxValue: 43_000,      percentile: 25 },
  { minValue: 43_000,      maxValue: 100_000,     percentile: 35 },
  { minValue: 100_000,     maxValue: 193_000,     percentile: 50 },
  { minValue: 193_000,     maxValue: 350_000,     percentile: 60 },
  { minValue: 350_000,     maxValue: 570_000,     percentile: 75 },
  { minValue: 570_000,     maxValue: 1_000_000,   percentile: 83 },
  { minValue: 1_000_000,   maxValue: 1_620_000,   percentile: 90 },
  { minValue: 1_620_000,   maxValue: 3_700_000,   percentile: 95 },
  { minValue: 3_700_000,   maxValue: 7_000_000,   percentile: 97 },
  { minValue: 7_000_000,   maxValue: 13_700_000,  percentile: 99 },
  { minValue: 13_700_000,  maxValue: Infinity,     percentile: 99.5 },
]

/* ------------------------------------------------------------------ */
/*  Age-based wealth percentile buckets                               */
/*  SCF age groups: <35, 35-44, 45-54, 55-64, 65-74, 75+             */
/* ------------------------------------------------------------------ */
export const AGE_BASED_BUCKETS: BenchmarkBucket[] = [
  // Under 35 — median ~$39K, 75th ~$160K
  { minValue: 0,         maxValue: 10_400,   percentile: 25, ageRange: [20, 34] },
  { minValue: 10_400,    maxValue: 39_000,   percentile: 50, ageRange: [20, 34] },
  { minValue: 39_000,    maxValue: 95_000,   percentile: 65, ageRange: [20, 34] },
  { minValue: 95_000,    maxValue: 160_000,  percentile: 75, ageRange: [20, 34] },
  { minValue: 160_000,   maxValue: 400_000,  percentile: 90, ageRange: [20, 34] },
  { minValue: 400_000,   maxValue: Infinity,  percentile: 97, ageRange: [20, 34] },

  // 35–44 — median ~$135K, 75th ~$435K
  { minValue: 0,         maxValue: 32_000,   percentile: 25, ageRange: [35, 44] },
  { minValue: 32_000,    maxValue: 135_000,  percentile: 50, ageRange: [35, 44] },
  { minValue: 135_000,   maxValue: 280_000,  percentile: 65, ageRange: [35, 44] },
  { minValue: 280_000,   maxValue: 435_000,  percentile: 75, ageRange: [35, 44] },
  { minValue: 435_000,   maxValue: 1_000_000, percentile: 90, ageRange: [35, 44] },
  { minValue: 1_000_000, maxValue: Infinity,  percentile: 97, ageRange: [35, 44] },

  // 45–54 — median ~$247K, 75th ~$750K
  { minValue: 0,         maxValue: 60_000,   percentile: 25, ageRange: [45, 54] },
  { minValue: 60_000,    maxValue: 247_000,  percentile: 50, ageRange: [45, 54] },
  { minValue: 247_000,   maxValue: 490_000,  percentile: 65, ageRange: [45, 54] },
  { minValue: 490_000,   maxValue: 750_000,  percentile: 75, ageRange: [45, 54] },
  { minValue: 750_000,   maxValue: 1_800_000, percentile: 90, ageRange: [45, 54] },
  { minValue: 1_800_000, maxValue: Infinity,  percentile: 97, ageRange: [45, 54] },

  // 55–64 — median ~$364K, 75th ~$1.1M
  { minValue: 0,         maxValue: 83_000,   percentile: 25, ageRange: [55, 64] },
  { minValue: 83_000,    maxValue: 364_000,  percentile: 50, ageRange: [55, 64] },
  { minValue: 364_000,   maxValue: 720_000,  percentile: 65, ageRange: [55, 64] },
  { minValue: 720_000,   maxValue: 1_100_000, percentile: 75, ageRange: [55, 64] },
  { minValue: 1_100_000, maxValue: 2_700_000, percentile: 90, ageRange: [55, 64] },
  { minValue: 2_700_000, maxValue: Infinity,  percentile: 97, ageRange: [55, 64] },

  // 65–74 — median ~$409K, 75th ~$1.0M
  { minValue: 0,         maxValue: 96_000,   percentile: 25, ageRange: [65, 74] },
  { minValue: 96_000,    maxValue: 409_000,  percentile: 50, ageRange: [65, 74] },
  { minValue: 409_000,   maxValue: 700_000,  percentile: 65, ageRange: [65, 74] },
  { minValue: 700_000,   maxValue: 1_000_000, percentile: 75, ageRange: [65, 74] },
  { minValue: 1_000_000, maxValue: 2_500_000, percentile: 90, ageRange: [65, 74] },
  { minValue: 2_500_000, maxValue: Infinity,  percentile: 97, ageRange: [65, 74] },

  // 75+ — median ~$335K, 75th ~$870K
  { minValue: 0,         maxValue: 80_000,   percentile: 25, ageRange: [75, 99] },
  { minValue: 80_000,    maxValue: 335_000,  percentile: 50, ageRange: [75, 99] },
  { minValue: 335_000,   maxValue: 600_000,  percentile: 65, ageRange: [75, 99] },
  { minValue: 600_000,   maxValue: 870_000,  percentile: 75, ageRange: [75, 99] },
  { minValue: 870_000,   maxValue: 2_100_000, percentile: 90, ageRange: [75, 99] },
  { minValue: 2_100_000, maxValue: Infinity,  percentile: 97, ageRange: [75, 99] },
]

/* ------------------------------------------------------------------ */
/*  Age + gender wealth percentile buckets                            */
/*  Male thresholds ~10-15% higher, female ~10-15% lower than base    */
/* ------------------------------------------------------------------ */
export const AGE_GENDER_BUCKETS: BenchmarkBucket[] = [
  // ── Under 35, Male ──
  { minValue: 0,         maxValue: 11_900,   percentile: 25, ageRange: [20, 34], gender: 'male' },
  { minValue: 11_900,    maxValue: 44_500,   percentile: 50, ageRange: [20, 34], gender: 'male' },
  { minValue: 44_500,    maxValue: 108_000,  percentile: 65, ageRange: [20, 34], gender: 'male' },
  { minValue: 108_000,   maxValue: 182_000,  percentile: 75, ageRange: [20, 34], gender: 'male' },
  { minValue: 182_000,   maxValue: 455_000,  percentile: 90, ageRange: [20, 34], gender: 'male' },
  { minValue: 455_000,   maxValue: Infinity,  percentile: 97, ageRange: [20, 34], gender: 'male' },

  // ── Under 35, Female ──
  { minValue: 0,         maxValue: 8_800,    percentile: 25, ageRange: [20, 34], gender: 'female' },
  { minValue: 8_800,     maxValue: 33_200,   percentile: 50, ageRange: [20, 34], gender: 'female' },
  { minValue: 33_200,    maxValue: 81_000,   percentile: 65, ageRange: [20, 34], gender: 'female' },
  { minValue: 81_000,    maxValue: 136_000,  percentile: 75, ageRange: [20, 34], gender: 'female' },
  { minValue: 136_000,   maxValue: 340_000,  percentile: 90, ageRange: [20, 34], gender: 'female' },
  { minValue: 340_000,   maxValue: Infinity,  percentile: 97, ageRange: [20, 34], gender: 'female' },

  // ── 35–44, Male ──
  { minValue: 0,         maxValue: 36_500,   percentile: 25, ageRange: [35, 44], gender: 'male' },
  { minValue: 36_500,    maxValue: 155_000,  percentile: 50, ageRange: [35, 44], gender: 'male' },
  { minValue: 155_000,   maxValue: 320_000,  percentile: 65, ageRange: [35, 44], gender: 'male' },
  { minValue: 320_000,   maxValue: 500_000,  percentile: 75, ageRange: [35, 44], gender: 'male' },
  { minValue: 500_000,   maxValue: 1_150_000, percentile: 90, ageRange: [35, 44], gender: 'male' },
  { minValue: 1_150_000, maxValue: Infinity,  percentile: 97, ageRange: [35, 44], gender: 'male' },

  // ── 35–44, Female ──
  { minValue: 0,         maxValue: 27_200,   percentile: 25, ageRange: [35, 44], gender: 'female' },
  { minValue: 27_200,    maxValue: 115_000,  percentile: 50, ageRange: [35, 44], gender: 'female' },
  { minValue: 115_000,   maxValue: 238_000,  percentile: 65, ageRange: [35, 44], gender: 'female' },
  { minValue: 238_000,   maxValue: 370_000,  percentile: 75, ageRange: [35, 44], gender: 'female' },
  { minValue: 370_000,   maxValue: 850_000,  percentile: 90, ageRange: [35, 44], gender: 'female' },
  { minValue: 850_000,   maxValue: Infinity,  percentile: 97, ageRange: [35, 44], gender: 'female' },

  // ── 45–54, Male ──
  { minValue: 0,         maxValue: 69_000,   percentile: 25, ageRange: [45, 54], gender: 'male' },
  { minValue: 69_000,    maxValue: 284_000,  percentile: 50, ageRange: [45, 54], gender: 'male' },
  { minValue: 284_000,   maxValue: 560_000,  percentile: 65, ageRange: [45, 54], gender: 'male' },
  { minValue: 560_000,   maxValue: 860_000,  percentile: 75, ageRange: [45, 54], gender: 'male' },
  { minValue: 860_000,   maxValue: 2_070_000, percentile: 90, ageRange: [45, 54], gender: 'male' },
  { minValue: 2_070_000, maxValue: Infinity,  percentile: 97, ageRange: [45, 54], gender: 'male' },

  // ── 45–54, Female ──
  { minValue: 0,         maxValue: 51_000,   percentile: 25, ageRange: [45, 54], gender: 'female' },
  { minValue: 51_000,    maxValue: 210_000,  percentile: 50, ageRange: [45, 54], gender: 'female' },
  { minValue: 210_000,   maxValue: 417_000,  percentile: 65, ageRange: [45, 54], gender: 'female' },
  { minValue: 417_000,   maxValue: 638_000,  percentile: 75, ageRange: [45, 54], gender: 'female' },
  { minValue: 638_000,   maxValue: 1_530_000, percentile: 90, ageRange: [45, 54], gender: 'female' },
  { minValue: 1_530_000, maxValue: Infinity,  percentile: 97, ageRange: [45, 54], gender: 'female' },

  // ── 55–64, Male ──
  { minValue: 0,         maxValue: 95_000,   percentile: 25, ageRange: [55, 64], gender: 'male' },
  { minValue: 95_000,    maxValue: 418_000,  percentile: 50, ageRange: [55, 64], gender: 'male' },
  { minValue: 418_000,   maxValue: 828_000,  percentile: 65, ageRange: [55, 64], gender: 'male' },
  { minValue: 828_000,   maxValue: 1_265_000, percentile: 75, ageRange: [55, 64], gender: 'male' },
  { minValue: 1_265_000, maxValue: 3_100_000, percentile: 90, ageRange: [55, 64], gender: 'male' },
  { minValue: 3_100_000, maxValue: Infinity,  percentile: 97, ageRange: [55, 64], gender: 'male' },

  // ── 55–64, Female ──
  { minValue: 0,         maxValue: 70_500,   percentile: 25, ageRange: [55, 64], gender: 'female' },
  { minValue: 70_500,    maxValue: 310_000,  percentile: 50, ageRange: [55, 64], gender: 'female' },
  { minValue: 310_000,   maxValue: 612_000,  percentile: 65, ageRange: [55, 64], gender: 'female' },
  { minValue: 612_000,   maxValue: 935_000,  percentile: 75, ageRange: [55, 64], gender: 'female' },
  { minValue: 935_000,   maxValue: 2_300_000, percentile: 90, ageRange: [55, 64], gender: 'female' },
  { minValue: 2_300_000, maxValue: Infinity,  percentile: 97, ageRange: [55, 64], gender: 'female' },

  // ── 65–74, Male ──
  { minValue: 0,         maxValue: 110_000,  percentile: 25, ageRange: [65, 74], gender: 'male' },
  { minValue: 110_000,   maxValue: 470_000,  percentile: 50, ageRange: [65, 74], gender: 'male' },
  { minValue: 470_000,   maxValue: 805_000,  percentile: 65, ageRange: [65, 74], gender: 'male' },
  { minValue: 805_000,   maxValue: 1_150_000, percentile: 75, ageRange: [65, 74], gender: 'male' },
  { minValue: 1_150_000, maxValue: 2_875_000, percentile: 90, ageRange: [65, 74], gender: 'male' },
  { minValue: 2_875_000, maxValue: Infinity,  percentile: 97, ageRange: [65, 74], gender: 'male' },

  // ── 65–74, Female ──
  { minValue: 0,         maxValue: 82_000,   percentile: 25, ageRange: [65, 74], gender: 'female' },
  { minValue: 82_000,    maxValue: 348_000,  percentile: 50, ageRange: [65, 74], gender: 'female' },
  { minValue: 348_000,   maxValue: 595_000,  percentile: 65, ageRange: [65, 74], gender: 'female' },
  { minValue: 595_000,   maxValue: 850_000,  percentile: 75, ageRange: [65, 74], gender: 'female' },
  { minValue: 850_000,   maxValue: 2_125_000, percentile: 90, ageRange: [65, 74], gender: 'female' },
  { minValue: 2_125_000, maxValue: Infinity,  percentile: 97, ageRange: [65, 74], gender: 'female' },

  // ── 75+, Male ──
  { minValue: 0,         maxValue: 92_000,   percentile: 25, ageRange: [75, 99], gender: 'male' },
  { minValue: 92_000,    maxValue: 385_000,  percentile: 50, ageRange: [75, 99], gender: 'male' },
  { minValue: 385_000,   maxValue: 690_000,  percentile: 65, ageRange: [75, 99], gender: 'male' },
  { minValue: 690_000,   maxValue: 1_000_000, percentile: 75, ageRange: [75, 99], gender: 'male' },
  { minValue: 1_000_000, maxValue: 2_415_000, percentile: 90, ageRange: [75, 99], gender: 'male' },
  { minValue: 2_415_000, maxValue: Infinity,  percentile: 97, ageRange: [75, 99], gender: 'male' },

  // ── 75+, Female ──
  { minValue: 0,         maxValue: 68_000,   percentile: 25, ageRange: [75, 99], gender: 'female' },
  { minValue: 68_000,    maxValue: 285_000,  percentile: 50, ageRange: [75, 99], gender: 'female' },
  { minValue: 285_000,   maxValue: 510_000,  percentile: 65, ageRange: [75, 99], gender: 'female' },
  { minValue: 510_000,   maxValue: 740_000,  percentile: 75, ageRange: [75, 99], gender: 'female' },
  { minValue: 740_000,   maxValue: 1_785_000, percentile: 90, ageRange: [75, 99], gender: 'female' },
  { minValue: 1_785_000, maxValue: Infinity,  percentile: 97, ageRange: [75, 99], gender: 'female' },
]

/* ------------------------------------------------------------------ */
/*  Investment return percentile buckets (annualized %, all profiles) */
/*  Modeled on typical S&P 500 long-term investor return distribution */
/* ------------------------------------------------------------------ */
export const RETURN_BUCKETS: BenchmarkBucket[] = [
  { minValue: -Infinity, maxValue: -5,  percentile: 5 },
  { minValue: -5,        maxValue: 0,   percentile: 15 },
  { minValue: 0,         maxValue: 4,   percentile: 30 },
  { minValue: 4,         maxValue: 8,   percentile: 55 },
  { minValue: 8,         maxValue: 12,  percentile: 75 },
  { minValue: 12,        maxValue: 18,  percentile: 90 },
  { minValue: 18,        maxValue: 25,  percentile: 96 },
  { minValue: 25,        maxValue: Infinity, percentile: 99 },
]

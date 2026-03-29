/**
 * Shared rank test fixtures.
 *
 * Provides:
 *   - Low-level RankResult builders (mkOverall, mkAge, mkAgeGender, mkReturn)
 *   - Pre-built scenario arrays for the five standard rank input states
 *   - BenchmarkFile fixtures for adapter and validation tests
 *
 * These are read-only shared fixtures — do not mutate them in tests.
 * Import only what you need; do not re-export from individual test files.
 */

import type { RankResult, RankType } from '@/lib/types/rank'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

// ---------------------------------------------------------------------------
// Low-level builder
// ---------------------------------------------------------------------------

/**
 * Creates a minimal RankResult with only the fields rank utilities inspect.
 * Label is set to the type string for easy identification in test output.
 */
export function makeRankResult(
  type: RankType,
  percentile: number | null,
  missingField?: string,
): RankResult {
  return {
    type,
    label:   type,
    percentile,
    message: '',
    ...(missingField != null && { missingField }),
  }
}

// ---------------------------------------------------------------------------
// Typed shortcuts
// ---------------------------------------------------------------------------

export const mkOverall    = (pct: number | null)                      => makeRankResult('overall_wealth',    pct)
export const mkAge        = (pct: number | null, miss?: string)       => makeRankResult('age_based',         pct, miss)
export const mkAgeGender  = (pct: number | null, miss?: string)       => makeRankResult('age_gender',        pct, miss)
export const mkReturn     = (pct: number | null, miss?: string)       => makeRankResult('investment_return', pct, miss)

// ---------------------------------------------------------------------------
// Scenario arrays
// Percentile values are chosen to exercise real rank tiers (not arbitrary).
// missingField strings match the normalized values from features/dashboard/rank.ts
// ---------------------------------------------------------------------------

/**
 * Assets only — overall rank available; age, gender, return all missing.
 * Typical state for a new user who has added portfolio data but no profile.
 */
export const SCENARIO_ASSETS_ONLY: RankResult[] = [
  mkOverall(72),
  mkAge(null,       'birth year'),
  mkAgeGender(null, 'birth year and gender'),
  mkReturn(null,    'annual return'),
]

/**
 * Assets + age — overall and age-based ranks available; gender and return missing.
 * User has set birth year but not gender or return estimate.
 */
export const SCENARIO_WITH_AGE: RankResult[] = [
  mkOverall(72),
  mkAge(68),
  mkAgeGender(null, 'gender'),
  mkReturn(null,    'annual return'),
]

/**
 * Assets + age + gender — overall, age-based, and age+gender ranks available; return missing.
 * User has set birth year and gender but not return estimate.
 */
export const SCENARIO_WITH_AGE_GENDER: RankResult[] = [
  mkOverall(72),
  mkAge(68),
  mkAgeGender(65),
  mkReturn(null, 'annual return'),
]

/**
 * Full rank inputs — all four ranks available.
 * No meaningful gap between overall (72) and return (55); wealth is above median.
 */
export const SCENARIO_FULL: RankResult[] = [
  mkOverall(72),
  mkAge(68),
  mkAgeGender(65),
  mkReturn(55),
]

/**
 * No profile inputs — overall rank present (requires only asset value),
 * but age, gender, and return are all unset.
 * Minimal state: shows the overall rank but all derived ranks are missing.
 */
export const SCENARIO_NO_PROFILE: RankResult[] = [
  mkOverall(60),
  mkAge(null,       'birth year'),
  mkAgeGender(null, 'birth year and gender'),
  mkReturn(null,    'annual return'),
]

/**
 * Return gap — overall rank (80) is 30 points above return rank (50).
 * Exceeds RANK_GAP_THRESHOLD (20); should trigger rank insight Rule 1
 * ("Wealth rank is higher than investment return rank").
 */
export const SCENARIO_RETURN_GAP: RankResult[] = [
  mkOverall(80),
  mkAge(75),
  mkAgeGender(70),
  mkReturn(50),
]

// ---------------------------------------------------------------------------
// All scenarios — useful for exhaustive iteration in tests
// ---------------------------------------------------------------------------

export const ALL_SCENARIOS: Readonly<Record<string, RankResult[]>> = {
  ASSETS_ONLY:      SCENARIO_ASSETS_ONLY,
  WITH_AGE:         SCENARIO_WITH_AGE,
  WITH_AGE_GENDER:  SCENARIO_WITH_AGE_GENDER,
  FULL:             SCENARIO_FULL,
  NO_PROFILE:       SCENARIO_NO_PROFILE,
  RETURN_GAP:       SCENARIO_RETURN_GAP,
}

// ---------------------------------------------------------------------------
// BenchmarkFile fixtures
// ---------------------------------------------------------------------------

/** A minimal BenchmarkFile that passes both validation and QA. */
export const FIXTURE_VALID_BENCHMARK_FILE: BenchmarkFile = {
  version:     '1',
  source:      'Test 2024',
  jurisdiction: 'US',
  currency:    'USD',
  vintageYear: 2024,
  overallWealth:    [{ minValue: 0, maxValue: 1_000_000, percentile: 50 }],
  ageBased:         [{ minValue: 0, maxValue: 1_000_000, percentile: 50, ageRange: [30, 39] as [number, number] }],
  ageGender:        [{ minValue: 0, maxValue: 1_000_000, percentile: 50, ageRange: [30, 39] as [number, number], gender: 'male' as const }],
  investmentReturn: [{ minValue: 0, maxValue: 20,        percentile: 50 }],
}

/**
 * Passes validateBenchmarkFile (schema is correct) but contains NaN percentile.
 * runBenchmarkQA should flag this file; used to test QA-fail paths.
 */
export const FIXTURE_QA_FAILING_FILE: BenchmarkFile = {
  ...FIXTURE_VALID_BENCHMARK_FILE,
  overallWealth: [{ minValue: 0, maxValue: 1_000_000, percentile: NaN }],
}

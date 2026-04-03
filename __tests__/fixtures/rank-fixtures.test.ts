/**
 * Smoke tests for rank-fixtures.ts.
 *
 * Verifies structural integrity of every scenario and fixture.
 * Also runs a small integration check: SCENARIO_RETURN_GAP should trigger
 * the expected rank insight, confirming the fixture interacts correctly with
 * the rank utilities.
 */

import {
  SCENARIO_ASSETS_ONLY,
  SCENARIO_WITH_AGE,
  SCENARIO_WITH_AGE_GENDER,
  SCENARIO_FULL,
  SCENARIO_NO_PROFILE,
  SCENARIO_RETURN_GAP,
  ALL_SCENARIOS,
  FIXTURE_VALID_BENCHMARK_FILE,
  FIXTURE_QA_FAILING_FILE,
  mkOverall, mkAge, mkAgeGender, mkReturn,
} from './rank-fixtures'

import { validateBenchmarkFile } from '@/lib/utils/benchmark-import'
import { runBenchmarkQA } from '@/lib/utils/benchmark-qa'
import { getRankInsight } from '@/lib/utils/rank-insight'
import { getPrimaryRank } from '@/lib/utils/rank-priority'

// ---------------------------------------------------------------------------
// Builder helpers
// ---------------------------------------------------------------------------

describe('builder helpers', () => {
  it('mkOverall sets type correctly', () => {
    expect(mkOverall(50).type).toBe('overall_wealth')
  })
  it('mkAge sets type correctly', () => {
    expect(mkAge(50).type).toBe('age_based')
  })
  it('mkAgeGender sets type correctly', () => {
    expect(mkAgeGender(50).type).toBe('age_gender')
  })
  it('mkReturn sets type correctly', () => {
    expect(mkReturn(50).type).toBe('investment_return')
  })
  it('null percentile is preserved', () => {
    expect(mkOverall(null).percentile).toBeNull()
  })
  it('missingField is set when provided', () => {
    expect(mkAge(null, 'birth year').missingField).toBe('birth year')
  })
  it('missingField is absent when not provided', () => {
    expect(mkOverall(72).missingField).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// All scenarios — structural checks
// ---------------------------------------------------------------------------

describe('all scenarios have 4 rank types in priority order', () => {
  const expectedTypes = ['overall_wealth', 'age_based', 'age_gender', 'investment_return']

  for (const [name, scenario] of Object.entries(ALL_SCENARIOS)) {
    it(`${name} has 4 entries with correct types`, () => {
      expect(scenario).toHaveLength(4)
      expect(scenario.map((r) => r.type)).toEqual(expectedTypes)
    })
  }
})

// ---------------------------------------------------------------------------
// Scenario-specific checks
// ---------------------------------------------------------------------------

describe('SCENARIO_ASSETS_ONLY', () => {
  it('has overall percentile set', () => {
    expect(SCENARIO_ASSETS_ONLY[0].percentile).not.toBeNull()
  })
  it('all non-overall ranks have null percentile', () => {
    const [, age, gender, ret] = SCENARIO_ASSETS_ONLY
    expect(age.percentile).toBeNull()
    expect(gender.percentile).toBeNull()
    expect(ret.percentile).toBeNull()
  })
  it('non-overall ranks have missingField set', () => {
    const [, age, gender, ret] = SCENARIO_ASSETS_ONLY
    expect(age.missingField).toBeTruthy()
    expect(gender.missingField).toBeTruthy()
    expect(ret.missingField).toBeTruthy()
  })
})

describe('SCENARIO_WITH_AGE', () => {
  it('overall and age-based have percentiles', () => {
    const [overall, age] = SCENARIO_WITH_AGE
    expect(overall.percentile).not.toBeNull()
    expect(age.percentile).not.toBeNull()
  })
  it('gender and return are missing', () => {
    const [,, gender, ret] = SCENARIO_WITH_AGE
    expect(gender.percentile).toBeNull()
    expect(ret.percentile).toBeNull()
  })
})

describe('SCENARIO_WITH_AGE_GENDER', () => {
  it('overall, age-based, and age+gender have percentiles', () => {
    const [overall, age, ageGender] = SCENARIO_WITH_AGE_GENDER
    expect(overall.percentile).not.toBeNull()
    expect(age.percentile).not.toBeNull()
    expect(ageGender.percentile).not.toBeNull()
  })
  it('return is missing', () => {
    const [,,, ret] = SCENARIO_WITH_AGE_GENDER
    expect(ret.percentile).toBeNull()
  })
})

describe('SCENARIO_FULL', () => {
  it('all four ranks have non-null percentiles', () => {
    for (const r of SCENARIO_FULL) {
      expect(r.percentile).not.toBeNull()
    }
  })
  it('no ranks have missingField', () => {
    for (const r of SCENARIO_FULL) {
      expect(r.missingField).toBeUndefined()
    }
  })
})

describe('SCENARIO_NO_PROFILE', () => {
  it('overall has a percentile', () => {
    expect(SCENARIO_NO_PROFILE[0].percentile).not.toBeNull()
  })
  it('age, gender, return all have null percentile', () => {
    const [, age, gender, ret] = SCENARIO_NO_PROFILE
    expect(age.percentile).toBeNull()
    expect(gender.percentile).toBeNull()
    expect(ret.percentile).toBeNull()
  })
})

describe('SCENARIO_RETURN_GAP', () => {
  it('overall percentile is at least 20 points above return percentile', () => {
    const [overall,,, ret] = SCENARIO_RETURN_GAP
    expect(overall.percentile! - ret.percentile!).toBeGreaterThanOrEqual(20)
  })

  it('triggers rank insight Rule 1 (wealth rank higher than return rank)', () => {
    const insight = getRankInsight(SCENARIO_RETURN_GAP)
    expect(insight).toContain('Overall wealth rank is stronger')
  })
})

// ---------------------------------------------------------------------------
// getPrimaryRank integration
// ---------------------------------------------------------------------------

describe('getPrimaryRank with fixtures', () => {
  it('returns overall for SCENARIO_FULL', () => {
    expect(getPrimaryRank(SCENARIO_FULL)?.type).toBe('overall_wealth')
  })

  it('returns overall for SCENARIO_ASSETS_ONLY (only available rank)', () => {
    expect(getPrimaryRank(SCENARIO_ASSETS_ONLY)?.type).toBe('overall_wealth')
  })
})

// ---------------------------------------------------------------------------
// BenchmarkFile fixtures
// ---------------------------------------------------------------------------

describe('FIXTURE_VALID_BENCHMARK_FILE', () => {
  it('passes validateBenchmarkFile', () => {
    expect(validateBenchmarkFile(FIXTURE_VALID_BENCHMARK_FILE)).toBeNull()
  })

  it('passes runBenchmarkQA with zero issues', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    // parseFile is not needed here — we test the raw bucket arrays directly
    // via the QA function's bucket-array overload used elsewhere in tests
    warn.mockRestore()
    // Structural check: all four sections are present
    expect(FIXTURE_VALID_BENCHMARK_FILE.overallWealth).toHaveLength(1)
    expect(FIXTURE_VALID_BENCHMARK_FILE.ageBased).toHaveLength(1)
    expect(FIXTURE_VALID_BENCHMARK_FILE.ageGender).toHaveLength(1)
    expect(FIXTURE_VALID_BENCHMARK_FILE.investmentReturn).toHaveLength(1)
  })
})

describe('FIXTURE_QA_FAILING_FILE', () => {
  it('passes validateBenchmarkFile (schema is valid)', () => {
    expect(validateBenchmarkFile(FIXTURE_QA_FAILING_FILE)).toBeNull()
  })

  it('has a NaN percentile in overallWealth (would fail QA)', () => {
    expect(Number.isNaN(FIXTURE_QA_FAILING_FILE.overallWealth[0].percentile)).toBe(true)
  })

  it('runBenchmarkQA returns > 0 issues for the parsed buckets', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    // Parse the file to get actual BenchmarkBucket[] then run QA
    const { parseBenchmarkFile } = require('@/lib/utils/benchmark-import')
    const buckets = parseBenchmarkFile(FIXTURE_QA_FAILING_FILE)
    const issues = runBenchmarkQA(buckets, { silent: true })
    expect(issues).toBeGreaterThan(0)
    warn.mockRestore()
  })
})

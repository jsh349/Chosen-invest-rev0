import { getRankNarrativeSummary } from '@/lib/utils/rank-narrative-summary'
import type { RankResult } from '@/lib/types/rank'

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function result(
  type: RankResult['type'],
  percentile: number | null,
  missingField?: string,
): RankResult {
  return {
    type,
    label:   type,
    percentile,
    message: '',
    ...(missingField ? { missingField } : {}),
  }
}

const OVERALL  = (pct: number | null) => result('overall_wealth',    pct)
const AGE      = (pct: number | null, missing?: string) => result('age_based',          pct, missing)
const GENDER   = (pct: number | null, missing?: string) => result('age_gender',         pct, missing)
const RETURN   = (pct: number | null, missing?: string) => result('investment_return',  pct, missing)

// ---------------------------------------------------------------------------
// No data
// ---------------------------------------------------------------------------

describe('getRankNarrativeSummary — no data', () => {
  it('returns a neutral prompt when all ranks are null and profile is incomplete', () => {
    const result = getRankNarrativeSummary([
      OVERALL(null), AGE(null, 'age'), GENDER(null, 'age'), RETURN(null, 'annualReturnPct'),
    ])
    expect(result).toMatch(/not yet available/i)
  })

  it('returns a short unavailable note when overall is null without profile issues', () => {
    const result = getRankNarrativeSummary([OVERALL(null)])
    expect(result.length).toBeGreaterThan(0)
    expect(result).not.toMatch(/favorably|median/)
  })
})

// ---------------------------------------------------------------------------
// Opening sentence — overall percentile tiers
// ---------------------------------------------------------------------------

describe('getRankNarrativeSummary — opening sentence', () => {
  it('uses "compares favorably" for overall ≥ 75', () => {
    expect(getRankNarrativeSummary([OVERALL(75)])).toMatch(/compares favorably/)
  })

  it('uses "compares favorably" for overall = 90', () => {
    expect(getRankNarrativeSummary([OVERALL(90)])).toMatch(/compares favorably/)
  })

  it('uses "above the benchmark median" for overall = 50', () => {
    expect(getRankNarrativeSummary([OVERALL(50)])).toMatch(/above the benchmark median/)
  })

  it('uses "above the benchmark median" for overall = 74', () => {
    expect(getRankNarrativeSummary([OVERALL(74)])).toMatch(/above the benchmark median/)
  })

  it('uses "near the benchmark median" for overall = 40', () => {
    expect(getRankNarrativeSummary([OVERALL(40)])).toMatch(/near the benchmark median/)
  })

  it('uses "near the benchmark median" for overall = 49', () => {
    expect(getRankNarrativeSummary([OVERALL(49)])).toMatch(/near the benchmark median/)
  })

  it('uses "below the benchmark median" for overall = 39', () => {
    expect(getRankNarrativeSummary([OVERALL(39)])).toMatch(/below the benchmark median/)
  })

  it('uses "below the benchmark median" for overall = 0', () => {
    expect(getRankNarrativeSummary([OVERALL(0)])).toMatch(/below the benchmark median/)
  })
})

// ---------------------------------------------------------------------------
// Second sentence — return gap
// ---------------------------------------------------------------------------

describe('getRankNarrativeSummary — return gap second sentence', () => {
  it('notes lower return rank when overall − return ≥ 20', () => {
    const text = getRankNarrativeSummary([OVERALL(70), RETURN(45)])
    expect(text).toMatch(/return rank is notably lower/)
  })

  it('notes stronger return rank when return − overall ≥ 20', () => {
    const text = getRankNarrativeSummary([OVERALL(50), RETURN(75)])
    expect(text).toMatch(/return rank is notably stronger/)
  })

  it('does not add a return sentence when gap is exactly 19', () => {
    const text = getRankNarrativeSummary([OVERALL(69), RETURN(50)])
    expect(text).not.toMatch(/return rank/)
  })
})

// ---------------------------------------------------------------------------
// Second sentence — profile incomplete
// ---------------------------------------------------------------------------

describe('getRankNarrativeSummary — profile incomplete note', () => {
  it('adds profile note when age is missing', () => {
    const text = getRankNarrativeSummary([OVERALL(60), AGE(null, 'age')])
    expect(text).toMatch(/profile inputs/)
  })

  it('does not add profile note when all ranks are available', () => {
    const text = getRankNarrativeSummary([
      OVERALL(60), AGE(55), GENDER(50), RETURN(58),
    ])
    expect(text).not.toMatch(/profile inputs/)
  })

  it('return gap takes priority over profile note', () => {
    // Both conditions true — only return gap note should appear
    const text = getRankNarrativeSummary([
      OVERALL(70), RETURN(45), AGE(null, 'age'),
    ])
    expect(text).toMatch(/return rank is notably lower/)
    // Should not also say "profile inputs"
    expect(text).not.toMatch(/profile inputs/)
  })
})

// ---------------------------------------------------------------------------
// Always returns a non-empty string
// ---------------------------------------------------------------------------

describe('getRankNarrativeSummary — always returns string', () => {
  it('returns a non-empty string for an empty ranks array', () => {
    expect(getRankNarrativeSummary([]).length).toBeGreaterThan(0)
  })

  it('returns a non-empty string for all-null ranks', () => {
    expect(getRankNarrativeSummary([OVERALL(null), AGE(null), RETURN(null)]).length).toBeGreaterThan(0)
  })
})

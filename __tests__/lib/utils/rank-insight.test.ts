import { getRankInsight } from '@/lib/utils/rank-insight'
import type { RankResult } from '@/lib/types/rank'

// Minimal builders — only the fields getRankInsight inspects
function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}
function ret(pct: number | null): RankResult {
  return { type: 'investment_return', label: 'Return', percentile: pct, message: '' }
}
function ageBased(pct: number | null, missingField?: string): RankResult {
  return { type: 'age_based', label: 'Age', percentile: pct, message: '', ...(missingField && { missingField }) }
}
function ageGender(pct: number | null, missingField?: string): RankResult {
  return { type: 'age_gender', label: 'Gender', percentile: pct, message: '', ...(missingField && { missingField }) }
}

describe('getRankInsight', () => {
  it('returns null when ranks array is empty', () => {
    expect(getRankInsight([])).toBeNull()
  })

  it('returns null when no gap and no missing fields', () => {
    expect(getRankInsight([overall(60), ret(55), ageBased(60), ageGender(60)])).toBeNull()
  })

  // Rule 1 — wealth significantly above return (gap >= 20)
  it('Rule 1: fires when wealth exceeds return by 20+', () => {
    const insight = getRankInsight([overall(80), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    expect(insight).toContain('Overall wealth rank is stronger')
  })

  it('Rule 1: does NOT fire when gap is 19', () => {
    const insight = getRankInsight([overall(74), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    // gap = 19 → Rule 1 skipped; Rule 3 fires instead
    expect(insight).not.toContain('Overall wealth rank is stronger')
  })

  // Rule 2 — return significantly above wealth
  it('Rule 2: fires when return exceeds wealth by 20+', () => {
    const insight = getRankInsight([overall(50), ret(75), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    expect(insight).toContain('Return rank is higher')
  })

  // Rule 3 — overall available but age missing
  it('Rule 3: fires when age missing field is set', () => {
    const insight = getRankInsight([overall(60), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year')])
    expect(insight).toContain('birth year')
  })

  // Rule 4 — age available but gender missing
  it('Rule 4: fires when ageBased has percentile and ageGender has missingField', () => {
    const insight = getRankInsight([overall(60), ret(55), ageBased(75), ageGender(null, 'gender')])
    expect(insight).toContain('gender')
  })

  // LOW fix regression — Rule 4 must NOT fire when ageBased percentile is null
  it('Rule 4 regression: null ageBased percentile does not trigger Rule 4', () => {
    // ageBased.percentile = null  → ageBased?.percentile != null is false → Rule 4 skipped
    const insight = getRankInsight([overall(60), ret(55), ageBased(null), ageGender(null, 'gender')])
    expect(insight).toBeNull()
  })

  // Priority — first matching rule wins
  it('Rule 1 takes priority over Rule 3', () => {
    const insight = getRankInsight([overall(80), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    expect(insight).toContain('Overall wealth rank is stronger')
    expect(insight).not.toContain('birth year')
  })
})

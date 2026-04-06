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
    // gap = 19 → below threshold; no other conditions met → null
    expect(insight).toBeNull()
  })

  // Rule 2 — return significantly above wealth
  it('Rule 2: fires when return exceeds wealth by 20+', () => {
    const insight = getRankInsight([overall(50), ret(75), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    expect(insight).toContain('Return rank is stronger')
  })

  // Profile-gap rules (Rules 3 & 4) were removed in a prior refactor.
  // Profile completeness hints are now handled by rank-next-hint / rank-checklist.
  it('returns null when gap < threshold and no rule conditions met (age missing)', () => {
    const insight = getRankInsight([overall(60), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year')])
    expect(insight).toBeNull()
  })

  it('returns null when gap < threshold and no rule conditions met (gender missing)', () => {
    const insight = getRankInsight([overall(60), ret(55), ageBased(75), ageGender(null, 'gender')])
    expect(insight).toBeNull()
  })

  it('returns null when gap < threshold and ageBased percentile is null', () => {
    const insight = getRankInsight([overall(60), ret(55), ageBased(null), ageGender(null, 'gender')])
    expect(insight).toBeNull()
  })

  // Priority — first matching rule wins
  it('Rule 1 fires when wealth–return gap ≥ threshold (gap-based insight, not profile note)', () => {
    const insight = getRankInsight([overall(80), ret(55), ageBased(null, 'birth year'), ageGender(null, 'birth year and gender')])
    expect(insight).toContain('Overall wealth rank is stronger')
  })
})

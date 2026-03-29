import { getRankExplanationSet } from '@/lib/utils/rank-explanation-priority'
import { ROUTES } from '@/lib/constants/routes'

const HINT = { text: 'Add birth year.', href: ROUTES.settings }
const NARRATIVE = 'Your overall wealth rank is above the midpoint.'
const INSIGHT   = 'Return rank is higher than overall wealth rank.'

describe('getRankExplanationSet', () => {
  // ── profile incomplete (nextHint present) ─────────────────────────────

  it('shows nextHint when profile is incomplete', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: null, nextHint: HINT })
    expect(result.showNextHint).toBe(true)
  })

  it('shows narrative alongside nextHint for context', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: null, nextHint: HINT })
    expect(result.showNarrative).toBe(true)
  })

  it('suppresses insight when profile is incomplete', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT, nextHint: HINT })
    expect(result.showInsight).toBe(false)
  })

  it('does not show narrative when it is null, even with a hint', () => {
    const result = getRankExplanationSet({ narrativeSummary: null, rankInsight: null, nextHint: HINT })
    expect(result.showNarrative).toBe(false)
    expect(result.showNextHint).toBe(true)
  })

  // ── profile complete (nextHint null) ──────────────────────────────────

  it('shows insight when profile is complete and gap detected', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT, nextHint: null })
    expect(result.showInsight).toBe(true)
  })

  it('shows narrative when profile is complete and gap detected', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT, nextHint: null })
    expect(result.showNarrative).toBe(true)
  })

  it('does not show nextHint when profile is complete', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT, nextHint: null })
    expect(result.showNextHint).toBe(false)
  })

  it('shows only narrative when profile is complete and no insight', () => {
    const result = getRankExplanationSet({ narrativeSummary: NARRATIVE, rankInsight: null, nextHint: null })
    expect(result.showNarrative).toBe(true)
    expect(result.showInsight).toBe(false)
    expect(result.showNextHint).toBe(false)
  })

  it('shows nothing when all inputs are null', () => {
    const result = getRankExplanationSet({ narrativeSummary: null, rankInsight: null, nextHint: null })
    expect(result.showNarrative).toBe(false)
    expect(result.showInsight).toBe(false)
    expect(result.showNextHint).toBe(false)
  })
})

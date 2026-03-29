import { getRankExplanationSet } from '@/lib/utils/rank-explanation-priority'
import { ROUTES } from '@/lib/constants/routes'

const HINT       = { text: 'Add birth year.', href: ROUTES.settings }
const NARRATIVE  = 'Your overall wealth rank is above the midpoint.'
const INSIGHT    = 'Return rank is higher than overall wealth rank.'
const GOAL       = 'Your wealth rank is strong, but no goals are set.'
const ALLOCATION = 'Holdings are concentrated in a single category.'

type ExplanationParams = Parameters<typeof getRankExplanationSet>[0]

/** Helper: build a full params object with all-null defaults. */
function params(overrides: Partial<ExplanationParams>): ExplanationParams {
  return {
    narrativeSummary:      null,
    rankInsight:           null,
    nextHint:              null,
    rankGoalInsight:       null,
    rankAllocationInsight: null,
    ...overrides,
  }
}

describe('getRankExplanationSet', () => {
  // ── Priority 1: profile incomplete (nextHint present) ─────────────────

  it('shows nextHint when profile is incomplete', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, nextHint: HINT }))
    expect(result.showNextHint).toBe(true)
  })

  it('shows narrative alongside nextHint for context', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, nextHint: HINT }))
    expect(result.showNarrative).toBe(true)
  })

  it('suppresses rankInsight when profile is incomplete', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT, nextHint: HINT }))
    expect(result.showInsight).toBe(false)
  })

  it('suppresses goalInsight when profile is incomplete', () => {
    const result = getRankExplanationSet(params({ nextHint: HINT, rankGoalInsight: GOAL }))
    expect(result.showGoalInsight).toBe(false)
  })

  it('suppresses allocationInsight when profile is incomplete', () => {
    const result = getRankExplanationSet(params({ nextHint: HINT, rankAllocationInsight: ALLOCATION }))
    expect(result.showAllocationInsight).toBe(false)
  })

  it('does not show narrative when it is null, even with a hint', () => {
    const result = getRankExplanationSet(params({ nextHint: HINT }))
    expect(result.showNarrative).toBe(false)
    expect(result.showNextHint).toBe(true)
  })

  // ── Priority 2: major rank gap ─────────────────────────────────────────

  it('shows rankInsight when profile is complete and gap detected', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT }))
    expect(result.showInsight).toBe(true)
  })

  it('shows narrative alongside rankInsight', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT }))
    expect(result.showNarrative).toBe(true)
  })

  it('suppresses goalInsight when rankInsight fires', () => {
    const result = getRankExplanationSet(params({ rankInsight: INSIGHT, rankGoalInsight: GOAL }))
    expect(result.showGoalInsight).toBe(false)
  })

  it('suppresses allocationInsight when rankInsight fires', () => {
    const result = getRankExplanationSet(params({ rankInsight: INSIGHT, rankAllocationInsight: ALLOCATION }))
    expect(result.showAllocationInsight).toBe(false)
  })

  it('does not show nextHint when profile is complete', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankInsight: INSIGHT }))
    expect(result.showNextHint).toBe(false)
  })

  // ── Priority 3: goal-related insight ──────────────────────────────────

  it('shows goalInsight when no nextHint and no rankInsight', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankGoalInsight: GOAL }))
    expect(result.showGoalInsight).toBe(true)
  })

  it('shows narrative alongside goalInsight', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankGoalInsight: GOAL }))
    expect(result.showNarrative).toBe(true)
  })

  it('suppresses allocationInsight when goalInsight fires', () => {
    const result = getRankExplanationSet(params({ rankGoalInsight: GOAL, rankAllocationInsight: ALLOCATION }))
    expect(result.showAllocationInsight).toBe(false)
  })

  // ── Priority 4: allocation-related insight ─────────────────────────────

  it('shows allocationInsight when it is the highest available', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankAllocationInsight: ALLOCATION }))
    expect(result.showAllocationInsight).toBe(true)
  })

  it('shows narrative alongside allocationInsight', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE, rankAllocationInsight: ALLOCATION }))
    expect(result.showNarrative).toBe(true)
  })

  // ── Priority 5: narrative only ─────────────────────────────────────────

  it('shows only narrative when no insight is available', () => {
    const result = getRankExplanationSet(params({ narrativeSummary: NARRATIVE }))
    expect(result.showNarrative).toBe(true)
    expect(result.showInsight).toBe(false)
    expect(result.showNextHint).toBe(false)
    expect(result.showGoalInsight).toBe(false)
    expect(result.showAllocationInsight).toBe(false)
  })

  it('shows nothing when all inputs are null', () => {
    const result = getRankExplanationSet(params({}))
    expect(result.showNarrative).toBe(false)
    expect(result.showInsight).toBe(false)
    expect(result.showNextHint).toBe(false)
    expect(result.showGoalInsight).toBe(false)
    expect(result.showAllocationInsight).toBe(false)
  })
})

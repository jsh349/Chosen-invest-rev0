import { getRankGoalInsight } from '@/lib/utils/rank-goal-insight'
import type { RankResult } from '@/lib/types/rank'
import type { Goal } from '@/lib/types/goal'

function overall(pct: number | null): RankResult {
  return { type: 'overall_wealth', label: 'Overall', percentile: pct, message: '' }
}
function ret(pct: number | null): RankResult {
  return { type: 'investment_return', label: 'Return', percentile: pct, message: '' }
}
function goal(overrides: Partial<Goal> = {}): Goal {
  return {
    id: '1', name: 'Test', type: 'savings',
    targetAmount: 10_000, currentAmount: 0,
    createdAt: '2026-01-01', updatedAt: '2026-01-01',
    ...overrides,
  }
}

const noRanks: RankResult[] = []
const noGoals: Goal[] = []

describe('getRankGoalInsight', () => {
  it('returns null for empty ranks and no goals', () => {
    expect(getRankGoalInsight(noRanks, noGoals)).toBeNull()
  })

  it('returns null when all percentiles are null', () => {
    expect(getRankGoalInsight([overall(null), ret(null)], noGoals)).toBeNull()
  })

  // Rule 1 — strong wealth, no goals
  it('Rule 1: fires when overall >= 75 and no goals', () => {
    const insight = getRankGoalInsight([overall(80), ret(70)], noGoals)
    expect(insight).toContain('no financial goals')
  })

  it('Rule 1: fires at exactly 75th percentile', () => {
    const insight = getRankGoalInsight([overall(75)], noGoals)
    expect(insight).toContain('no financial goals')
  })

  it('Rule 1: does NOT fire when goals exist', () => {
    const insight = getRankGoalInsight([overall(80)], [goal()])
    expect(insight).not.toContain('no financial goals')
  })

  it('Rule 1: does NOT fire below 75th percentile', () => {
    // overall=74 → Rule 1 miss; no goals → Rule 2 miss; no return → Rule 3 miss
    expect(getRankGoalInsight([overall(74)], noGoals)).toBeNull()
  })

  // Rule 2 — moderate wealth, goals without target dates
  it('Rule 2: fires when overall >= 40, goals exist, none have targetDate', () => {
    const insight = getRankGoalInsight([overall(60)], [goal()])
    expect(insight).toContain('target date')
  })

  it('Rule 2: does NOT fire when at least one goal has a targetDate', () => {
    // Rule 2 requires ALL goals to have no targetDate; here one has a date → no match
    expect(getRankGoalInsight([overall(60)], [goal({ targetDate: '2030-01-01' })])).toBeNull()
  })

  it('Rule 2: does NOT fire when no goals exist', () => {
    const insight = getRankGoalInsight([overall(60)], noGoals)
    // Rule 1 doesn't fire (overall < 75), Rule 2 doesn't fire (no goals)
    expect(insight).toBeNull()
  })

  it('Rule 2: does NOT fire below 40th percentile', () => {
    const insight = getRankGoalInsight([overall(35)], [goal()])
    expect(insight).toBeNull()
  })

  // Rule 3 — strong return rank, no investment/retirement goals
  // Use targetDate on savings goal to bypass Rule 2 (Rule 2 requires no targetDate on any goal)
  it('Rule 3: fires when returnPct >= 75 and no investment/retirement goals', () => {
    const savingsWithDate = goal({ type: 'savings', targetDate: '2030-01-01' })
    const insight = getRankGoalInsight([overall(50), ret(80)], [savingsWithDate])
    expect(insight).toContain('return rank')
  })

  it('Rule 3: does NOT fire when a retirement goal exists', () => {
    const retirementGoal = goal({ type: 'retirement', targetDate: '2040-01-01' })
    expect(getRankGoalInsight([overall(50), ret(80)], [retirementGoal])).toBeNull()
  })

  it('Rule 3: does NOT fire when an investment goal exists', () => {
    const investmentGoal = goal({ type: 'investment', targetDate: '2035-01-01' })
    expect(getRankGoalInsight([overall(50), ret(80)], [investmentGoal])).toBeNull()
  })

  it('Rule 3: does NOT fire when returnPct < 75', () => {
    const savingsWithDate = goal({ type: 'savings', targetDate: '2030-01-01' })
    expect(getRankGoalInsight([overall(50), ret(74)], [savingsWithDate])).toBeNull()
  })

  // Priority — Rule 1 before Rule 3 when both could match
  it('Rule 1 takes priority over Rule 3', () => {
    // overall >= 75, no goals → Rule 1 fires first
    const insight = getRankGoalInsight([overall(80), ret(80)], noGoals)
    expect(insight).toContain('no financial goals')
    expect(insight).not.toContain('return rank')
  })
})

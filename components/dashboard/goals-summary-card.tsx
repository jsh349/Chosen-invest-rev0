'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { useGoals } from '@/lib/store/goals-store'
import { getGoalStatus, goalProgressPct, GOAL_STATUS_LABELS, GOAL_STATUS_STYLES } from '@/lib/utils/goal-status'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { Goal } from '@/lib/types/goal'

function nearestGoal(goals: Goal[]): Goal | null {
  if (goals.length === 0) return null
  const withDate = goals
    .filter((g) => g.targetDate)
    .sort((a, b) => a.targetDate!.localeCompare(b.targetDate!))
  if (withDate[0]) return withDate[0]
  // No goals have a target date — fall back to the goal with the highest progress ratio
  return goals.reduce((best, g) => {
    const bestPct = best.targetAmount > 0 ? best.currentAmount / best.targetAmount : 0
    const gPct    = g.targetAmount    > 0 ? g.currentAmount    / g.targetAmount    : 0
    return gPct > bestPct ? g : best
  })
}

export function GoalsSummaryCard() {
  const { goals, hasGoals, isLoaded } = useGoals()
  const { fmt } = useFormatCurrency()

  if (!isLoaded) return null

  if (!hasGoals) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Goals</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">No goals set yet. Define a financial goal to start tracking progress.</p>
          <Link href={ROUTES.goals} className="inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Add your first goal →
          </Link>
        </CardContent>
      </Card>
    )
  }

  const totalTarget = goals.reduce((sum, g) => sum + g.targetAmount, 0)
  const totalCurrent = goals.reduce((sum, g) => sum + g.currentAmount, 0)
  const featured = nearestGoal(goals)
  if (!featured) return null
  const progress = goalProgressPct(featured)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Goals</CardTitle>
        <span className="text-xs text-gray-500">{goals.length} active</span>
      </CardHeader>
      <CardContent className="space-y-4">

        {/* Summary row */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-lg bg-surface-muted/40 px-3 py-2">
            <p className="text-xs text-gray-500">Total Target</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{fmt(totalTarget)}</p>
          </div>
          <div className="rounded-lg bg-surface-muted/40 px-3 py-2">
            <p className="text-xs text-gray-500">Saved So Far</p>
            <p className="mt-0.5 text-sm font-semibold text-white">{fmt(totalCurrent)}</p>
          </div>
        </div>

        {/* Featured goal */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <div className="flex items-center gap-1.5 min-w-0">
              <span className="font-medium text-gray-300 truncate">{featured.name}</span>
              <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', GOAL_STATUS_STYLES[getGoalStatus(featured.currentAmount, featured.targetAmount)])}>
                {GOAL_STATUS_LABELS[getGoalStatus(featured.currentAmount, featured.targetAmount)]}
              </span>
            </div>
            <span className="shrink-0 text-gray-500 ml-2">{progress.toFixed(0)}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{fmt(featured.currentAmount)} saved</span>
            <span>{fmt(featured.targetAmount)} target</span>
          </div>
        </div>

      </CardContent>
    </Card>
  )
}

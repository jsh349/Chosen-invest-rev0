'use client'

import { use } from 'react'
import Link from 'next/link'
import { ArrowLeft, Target } from 'lucide-react'
import { useGoals } from '@/lib/store/goals-store'
import { getGoalStatus, GOAL_STATUS_STYLES } from '@/lib/utils/goal-status'
import { formatCurrency } from '@/lib/utils/currency'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils/cn'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { ROUTES } from '@/lib/constants/routes'

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between py-2.5 border-b border-surface-border last:border-0">
      <span className="text-sm text-gray-500">{label}</span>
      <span className="text-sm font-medium text-white">{value}</span>
    </div>
  )
}

export default function GoalDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params)
  const { goals, isLoaded } = useGoals()

  if (!isLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  const goal = goals.find((g) => g.id === id)

  if (!goal) {
    return (
      <div className="space-y-6">
        <Link href={ROUTES.goals} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors w-fit">
          <ArrowLeft className="h-4 w-4" />
          Back to Goals
        </Link>
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-600" />
          <p className="text-sm font-medium text-gray-400">Goal not found</p>
          <p className="mt-1 text-xs text-gray-600">This goal may have been deleted.</p>
        </div>
      </div>
    )
  }

  const progress = goal.targetAmount > 0
    ? Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
    : 0
  const status = getGoalStatus(goal.currentAmount, goal.targetAmount)
  const typeLabel = goal.type.charAt(0).toUpperCase() + goal.type.slice(1)

  return (
    <div className="space-y-6">
      <Link href={ROUTES.goals} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Goals
      </Link>

      <div className="flex items-start justify-between gap-3">
        <div>
          <h1 className="text-xl font-bold text-white">{goal.name}</h1>
          <p className="mt-0.5 text-sm text-gray-500">{typeLabel}</p>
        </div>
        <span className={cn('shrink-0 rounded-full px-2.5 py-1 text-xs font-medium', GOAL_STATUS_STYLES[status])}>
          {status}
        </span>
      </div>

      {/* Progress bar */}
      <Card>
        <CardHeader>
          <CardTitle>Progress</CardTitle>
          <span className="text-xs text-gray-500">{progress.toFixed(1)}%</span>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="h-2.5 w-full overflow-hidden rounded-full bg-surface-muted">
            <div
              className="h-full rounded-full bg-brand-500 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between text-xs text-gray-500">
            <span>{formatCurrency(goal.currentAmount)} saved</span>
            <span>{formatCurrency(goal.targetAmount)} target</span>
          </div>
        </CardContent>
      </Card>

      {/* Details */}
      <Card>
        <CardHeader>
          <CardTitle>Details</CardTitle>
        </CardHeader>
        <CardContent className="px-4 py-0">
          <Row label="Goal Name"      value={goal.name} />
          <Row label="Type"           value={typeLabel} />
          <Row label="Target Amount"  value={formatCurrency(goal.targetAmount)} />
          <Row label="Saved So Far"   value={formatCurrency(goal.currentAmount)} />
          <Row label="Remaining"      value={formatCurrency(Math.max(0, goal.targetAmount - goal.currentAmount))} />
          <Row label="Progress"       value={`${progress.toFixed(1)}%`} />
          {goal.targetDate && (
            <Row label="Target Date"  value={goal.targetDate} />
          )}
          <Row
            label="Status"
            value={
              <span className={cn('rounded-full px-2 py-0.5 text-xs font-medium', GOAL_STATUS_STYLES[status])}>
                {status}
              </span>
            }
          />
        </CardContent>
      </Card>
    </div>
  )
}

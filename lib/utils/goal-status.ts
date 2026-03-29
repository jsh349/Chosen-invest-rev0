export type GoalStatus = 'not_started' | 'in_progress' | 'complete'

export const GOAL_STATUS_LABELS: Record<GoalStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  complete:    'Complete',
}

export const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  not_started: 'text-gray-400 bg-surface-muted',
  in_progress: 'text-yellow-400 bg-yellow-950',
  complete:    'text-green-400 bg-green-950',
}

export function getGoalStatus(currentAmount: number, targetAmount: number): GoalStatus {
  if (targetAmount <= 0) return 'not_started'           // invalid or unset target
  if (currentAmount >= targetAmount) return 'complete'
  if (currentAmount > 0) return 'in_progress'
  return 'not_started'                                   // valid target, no savings yet
}

/**
 * Progress percentage for a goal, clamped to [0, 100].
 * Returns 0 when targetAmount is invalid.
 */
export function goalProgressPct(goal: { currentAmount: number; targetAmount: number }): number {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

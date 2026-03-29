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
  if (targetAmount <= 0 || currentAmount <= 0) return 'not_started'
  if (currentAmount >= targetAmount) return 'complete'
  return 'in_progress'
}

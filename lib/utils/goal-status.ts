export type GoalStatus = 'Not Started' | 'In Progress' | 'Complete'

export function getGoalStatus(currentAmount: number, targetAmount: number): GoalStatus {
  if (targetAmount <= 0 || currentAmount <= 0) return 'Not Started'
  if (currentAmount >= targetAmount) return 'Complete'
  return 'In Progress'
}

export const GOAL_STATUS_STYLES: Record<GoalStatus, string> = {
  'Not Started': 'text-gray-400 bg-surface-muted',
  'In Progress': 'text-yellow-400 bg-yellow-950',
  'Complete':    'text-green-400 bg-green-950',
}

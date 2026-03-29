// NOTE: GoalStatus values serve double duty as display labels (Title Case with spaces).
// This differs from other enums in the codebase which use lowercase codes (e.g. AssetCategory).
// When API integration is added, split into a status code type ('not_started' | 'in_progress' |
// 'complete') and a separate GOAL_STATUS_LABELS display map to avoid a breaking data-model change.
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

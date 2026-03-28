export type GoalType =
  | 'savings'
  | 'investment'
  | 'retirement'
  | 'purchase'
  | 'debt'
  | 'other'

export type Goal = {
  id: string
  name: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  targetDate?: string   // ISO date string YYYY-MM-DD
  createdAt: string
  updatedAt: string
}

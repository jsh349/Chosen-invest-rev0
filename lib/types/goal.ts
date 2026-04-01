export type GoalType =
  | 'savings'
  | 'investment'
  | 'retirement'
  | 'purchase'
  | 'debt'
  | 'other'

export type Goal = {
  id: string
  userId?: string
  name: string
  type: GoalType
  targetAmount: number
  currentAmount: number
  targetDate?: string   // ISO date string YYYY-MM-DD
  shared?: boolean
  createdAt: string
  updatedAt: string
}

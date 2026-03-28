export type HealthStatus = 'good' | 'warning' | 'attention'

export type FinancialHealthCard = {
  key: string
  title: string
  status: HealthStatus
  message: string
  score: number
  generatedAt: string
}

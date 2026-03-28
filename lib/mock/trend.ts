export type TrendPoint = {
  month: string
  value: number
}

export function buildMockTrend(currentTotal: number): TrendPoint[] {
  // 6개월 추세 — 현재 값 기준으로 역산한 mock 데이터
  const months = ['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']
  const factors = [0.82, 0.86, 0.91, 0.94, 0.97, 1.0]
  return months.map((month, i) => ({
    month,
    value: Math.round(currentTotal * factors[i]),
  }))
}

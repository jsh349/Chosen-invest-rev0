export type TrendPoint = {
  month: string
  value: number
}

export function buildMockTrend(currentTotal: number): TrendPoint[] {
  // 6개월 추세 — 현재 값 기준으로 역산한 mock 데이터
  const monthNames = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec']
  const now = new Date()
  const months = Array.from({ length: 6 }, (_, i) => {
    const d = new Date(now.getFullYear(), now.getMonth() - (5 - i), 1)
    return monthNames[d.getMonth()]
  })
  const factors = [0.82, 0.86, 0.91, 0.94, 0.97, 1.0]
  return months.map((month, i) => ({
    month,
    value: Math.round(currentTotal * factors[i]),
  }))
}

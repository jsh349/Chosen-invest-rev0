'use client'

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

type ChartPoint = {
  label: string
  overall: number | null
  returnRank: number | null
}

function toChartData(snapshots: RankSnapshot[]): ChartPoint[] {
  return [...snapshots].reverse().map((s) => {
    const d = new Date(s.savedAt)
    return {
      label: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
      overall: s.overallPercentile != null ? 100 - s.overallPercentile : null,
      returnRank: s.returnPercentile != null ? 100 - s.returnPercentile : null,
    }
  })
}

export function RankTrendChart({ snapshots }: { snapshots: RankSnapshot[] }) {
  const data = toChartData(snapshots)

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Trend</p>
      <ResponsiveContainer width="100%" height={160}>
        <LineChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
          <XAxis
            dataKey="label"
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            domain={[0, 100]}
            tickFormatter={(v: number) => `Top ${v}%`}
            tick={{ fill: '#6b7280', fontSize: 10 }}
            axisLine={false}
            tickLine={false}
            width={52}
            reversed
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null
              return (
                <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold text-white">{label}</p>
                  {payload.map((p) => (
                    <p key={p.dataKey as string} style={{ color: p.color }}>
                      {p.name}: Top {p.value}%
                    </p>
                  ))}
                </div>
              )
            }}
          />
          <Line
            type="monotone"
            dataKey="overall"
            name="Wealth"
            stroke="#4f7df3"
            strokeWidth={2}
            dot={{ r: 3, fill: '#4f7df3' }}
            activeDot={{ r: 5, fill: '#4f7df3' }}
            connectNulls
          />
          <Line
            type="monotone"
            dataKey="returnRank"
            name="Return"
            stroke="#34d399"
            strokeWidth={2}
            dot={{ r: 3, fill: '#34d399' }}
            activeDot={{ r: 5, fill: '#34d399' }}
            connectNulls
          />
        </LineChart>
      </ResponsiveContainer>
      <div className="flex items-center gap-4 text-[10px] text-gray-600">
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-[#4f7df3]" />
          Wealth rank
        </span>
        <span className="flex items-center gap-1">
          <span className="inline-block h-2 w-2 rounded-full bg-emerald-400" />
          Return rank
        </span>
      </div>
    </div>
  )
}

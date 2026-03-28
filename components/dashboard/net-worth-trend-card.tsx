'use client'

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCompact } from '@/lib/utils/currency'
import type { TrendPoint } from '@/lib/mock/trend'

interface NetWorthTrendCardProps {
  data: TrendPoint[]
  isMock?: boolean
}

export function NetWorthTrendCard({ data, isMock }: NetWorthTrendCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Trend</CardTitle>
        {isMock && (
          <span className="text-xs text-gray-600">demo</span>
        )}
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={160}>
          <AreaChart data={data} margin={{ top: 4, right: 4, bottom: 0, left: 0 }}>
            <defs>
              <linearGradient id="trendGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%"  stopColor="#4f7df3" stopOpacity={0.25} />
                <stop offset="95%" stopColor="#4f7df3" stopOpacity={0} />
              </linearGradient>
            </defs>
            <XAxis
              dataKey="month"
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tickFormatter={(v) => formatCompact(v)}
              tick={{ fill: '#6b7280', fontSize: 11 }}
              axisLine={false}
              tickLine={false}
              width={48}
            />
            <Tooltip
              content={({ active, payload, label }) => {
                if (!active || !payload?.length) return null
                return (
                  <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs shadow-lg">
                    <p className="font-semibold text-white">{label}</p>
                    <p className="text-gray-400">{formatCompact(payload[0].value as number)}</p>
                  </div>
                )
              }}
            />
            <Area
              type="monotone"
              dataKey="value"
              stroke="#4f7df3"
              strokeWidth={2}
              fill="url(#trendGradient)"
              dot={false}
              activeDot={{ r: 4, fill: '#4f7df3' }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}

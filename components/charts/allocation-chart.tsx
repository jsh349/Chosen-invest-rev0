'use client'

import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
} from 'recharts'
import type { AllocationSlice } from '@/lib/types/dashboard'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { formatPercentage } from '@/lib/utils/percentage'

interface AllocationChartProps {
  data: AllocationSlice[]
}

export function AllocationChart({ data }: AllocationChartProps) {
  const { fmt } = useFormatCurrency()
  if (!data.length) {
    return (
      <div className="flex h-48 items-center justify-center text-sm text-gray-500">
        No allocation data yet
      </div>
    )
  }

  return (
    <div className="w-full">
      <ResponsiveContainer width="100%" height={220}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={90}
            paddingAngle={3}
            dataKey="value"
            nameKey="label"
          >
            {data.map((slice) => (
              <Cell key={slice.category} fill={slice.color} />
            ))}
          </Pie>
          <Tooltip
            content={({ active, payload }) => {
              if (!active || !payload?.length) return null
              const s = payload[0].payload as AllocationSlice
              return (
                <div className="rounded-lg border border-surface-border bg-surface-card px-3 py-2 text-xs shadow-lg">
                  <p className="font-semibold text-white">{s.label}</p>
                  <p className="text-gray-400">{fmt(s.value)}</p>
                  <p className="text-gray-400">{formatPercentage(s.percentage)}</p>
                </div>
              )
            }}
          />
        </PieChart>
      </ResponsiveContainer>

      {/* Legend */}
      <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
        {data.map((slice) => (
          <div key={slice.category} className="flex items-center gap-2 text-xs text-gray-400">
            <span
              className="inline-block h-2.5 w-2.5 flex-shrink-0 rounded-full"
              style={{ backgroundColor: slice.color }}
            />
            <span className="truncate">{slice.label}</span>
            <span className="ml-auto font-medium text-gray-300">
              {formatPercentage(slice.percentage, 0)}
            </span>
          </div>
        ))}
      </div>
    </div>
  )
}

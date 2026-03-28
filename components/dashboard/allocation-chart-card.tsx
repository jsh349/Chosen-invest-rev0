'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { formatCurrency } from '@/lib/utils/currency'
import type { AllocationSlice } from '@/lib/types/dashboard'

interface AllocationChartCardProps {
  slices: AllocationSlice[]
}

export function AllocationChartCard({ slices }: AllocationChartCardProps) {
  if (!slices.length) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Allocation</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No allocation data yet.</p>
        </CardContent>
      </Card>
    )
  }

  const total = slices.reduce((sum, s) => sum + s.value, 0)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <span className="text-xs text-gray-500">{slices.length} categories</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {slices.map((slice) => (
          <div key={slice.category} className="space-y-1">
            {/* Label row */}
            <div className="flex items-center justify-between text-xs">
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 flex-shrink-0 rounded-full"
                  style={{ backgroundColor: slice.color }}
                />
                <span className="text-gray-300">{slice.label}</span>
              </div>
              <div className="flex items-center gap-3 text-right">
                <span className="text-gray-500">{slice.percentage.toFixed(1)}%</span>
                <span className="w-20 font-medium text-white tabular-nums">
                  {formatCurrency(slice.value)}
                </span>
              </div>
            </div>
            {/* Bar */}
            <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
              <div
                className="h-full rounded-full transition-all duration-300"
                style={{
                  width: `${(slice.value / total) * 100}%`,
                  backgroundColor: slice.color,
                }}
              />
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}

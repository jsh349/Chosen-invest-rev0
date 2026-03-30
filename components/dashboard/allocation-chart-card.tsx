'use client'

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import type { AllocationSlice } from '@/lib/types/dashboard'

interface AllocationChartCardProps {
  slices: AllocationSlice[]
}

/**
 * Largest-remainder rounding: distributes 100 integer points across slices so
 * displayed percentages always sum to exactly 100. Prevents visible drift like
 * "33.3% + 33.3% + 33.3% = 99.9%" when percentages are shown as a list.
 * Bar widths are computed separately from raw values and are unaffected.
 */
function displayPercentages(slices: AllocationSlice[]): number[] {
  const floors = slices.map((s) => Math.floor(s.percentage))
  const remainder = 100 - floors.reduce((a, b) => a + b, 0)
  const order = slices
    .map((s, i) => ({ i, frac: s.percentage - Math.floor(s.percentage) }))
    .sort((a, b) => b.frac - a.frac)
  order.slice(0, remainder).forEach(({ i }) => { floors[i]++ })
  return floors
}

export function AllocationChartCard({ slices }: AllocationChartCardProps) {
  const { fmt } = useFormatCurrency()

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
  const displayPcts = displayPercentages(slices)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Allocation</CardTitle>
        <span className="text-xs text-gray-500">{slices.length} categories</span>
      </CardHeader>
      <CardContent className="space-y-3">
        {slices.map((slice, i) => (
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
                <span className="text-gray-500">{displayPcts[i]}%</span>
                <span className="w-20 font-medium text-white tabular-nums">
                  {fmt(slice.value)}
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

import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { AllocationChart } from '@/components/charts/allocation-chart'
import type { AllocationSlice } from '@/lib/types/dashboard'

interface AllocationChartCardProps {
  slices: AllocationSlice[]
}

export function AllocationChartCard({ slices }: AllocationChartCardProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Asset Allocation</CardTitle>
      </CardHeader>
      <CardContent>
        <AllocationChart data={slices} />
      </CardContent>
    </Card>
  )
}

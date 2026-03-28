'use client'

import { Users, UserPlus, ShieldCheck, ListChecks } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'

// Local mock — no backend yet
const MOCK_HOUSEHOLD = null as null | {
  name: string
  members: number
  sharedGoals: number
  pendingReviews: number
}

function StatTile({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg bg-surface-muted/40 px-4 py-3">
      <p className="text-xs text-gray-500">{label}</p>
      <p className="mt-0.5 text-lg font-semibold text-white">{value}</p>
    </div>
  )
}

function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-20 text-center">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-card">
        <Users className="h-6 w-6 text-gray-500" />
      </div>
      <h2 className="mb-1 text-base font-semibold text-white">No household configured</h2>
      <p className="mb-6 max-w-xs text-sm text-gray-500">
        Create a household to share goals and track finances together with your family or partner.
      </p>
      <button
        disabled
        className={cn(buttonVariants({ size: 'lg' }), 'cursor-not-allowed opacity-40 gap-2')}
      >
        <UserPlus className="h-4 w-4" />
        Create Household
        <span className="ml-1 rounded-full bg-brand-800 px-2 py-0.5 text-xs text-brand-300">
          Coming soon
        </span>
      </button>
    </div>
  )
}

function HouseholdDashboard({
  household,
}: {
  household: NonNullable<typeof MOCK_HOUSEHOLD>
}) {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        <StatTile label="Members"        value={household.members}       />
        <StatTile label="Shared Goals"   value={household.sharedGoals}   />
        <StatTile label="Pending Reviews" value={household.pendingReviews} />
        <StatTile label="Status"         value="Active"                  />
      </div>

      {/* Sections */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-4 w-4 text-gray-400" />
              Members
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Member list coming soon.</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ListChecks className="h-4 w-4 text-gray-400" />
              Shared Goals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500">Shared goal tracking coming soon.</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ShieldCheck className="h-4 w-4 text-gray-400" />
            Pending Reviews
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-500">No pending reviews.</p>
        </CardContent>
      </Card>
    </div>
  )
}

export default function HouseholdPage() {
  const household = MOCK_HOUSEHOLD

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Household</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage shared finances with your family or partner
        </p>
      </div>

      {household ? (
        <HouseholdDashboard household={household} />
      ) : (
        <EmptyState />
      )}
    </div>
  )
}

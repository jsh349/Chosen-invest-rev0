'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus } from 'lucide-react'
import { AssetRow } from '@/components/portfolio/asset-row'
import { Button } from '@/components/ui/button'
import { blankFormEntry } from '@/features/portfolio/helpers'
import type { AssetFormEntry } from '@/features/portfolio/types'
import { ROUTES } from '@/lib/constants/routes'

export default function PortfolioInputPage() {
  const router = useRouter()
  const [entries, setEntries] = useState<AssetFormEntry[]>([blankFormEntry()])

  function handleChange(
    index: number,
    field: keyof AssetFormEntry,
    value: string
  ) {
    setEntries((prev) => {
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleAdd() {
    setEntries((prev) => [...prev, blankFormEntry()])
  }

  function handleRemove(index: number) {
    setEntries((prev) => prev.filter((_, i) => i !== index))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    // In Version 1 we use mock data on the dashboard.
    // Future: persist entries to backend, then redirect.
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Add Your Assets</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Enter each asset manually. You can update this at any time.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        {entries.map((entry, i) => (
          <AssetRow
            key={i}
            index={i}
            entry={entry}
            onChange={handleChange}
            onRemove={handleRemove}
            showRemove={entries.length > 1}
          />
        ))}

        <Button
          type="button"
          variant="outline"
          className="w-full border-dashed text-gray-400"
          onClick={handleAdd}
        >
          <Plus className="h-4 w-4" />
          Add Another Asset
        </Button>

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            Skip for now
          </Button>
          <Button type="submit">View Dashboard</Button>
        </div>
      </form>

      <p className="text-xs text-gray-600">
        Version 1 uses your input to display the dashboard. Data is not yet
        persisted between sessions.
      </p>
    </div>
  )
}

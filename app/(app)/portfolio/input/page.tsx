'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { AssetRow } from '@/components/portfolio/asset-row'
import { Button } from '@/components/ui/button'
import { blankFormEntry, formEntryToAsset } from '@/features/portfolio/helpers'
import type { AssetFormEntry } from '@/features/portfolio/types'
import { useAssets } from '@/lib/store/assets-store'
import { formatCurrency } from '@/lib/utils/currency'
import { ROUTES } from '@/lib/constants/routes'

let idCounter = Date.now()
function nextId() {
  return `asset_${(++idCounter).toString(36)}`
}

export default function PortfolioInputPage() {
  const router = useRouter()
  const { setAssets } = useAssets()
  const [entries, setEntries] = useState<AssetFormEntry[]>([blankFormEntry()])

  const total = entries.reduce((sum, e) => sum + (parseFloat(e.value) || 0), 0)

  function handleChange(index: number, field: keyof AssetFormEntry, value: string) {
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
    const validEntries = entries.filter(
      (en) => en.name.trim() && parseFloat(en.value) > 0
    )
    if (validEntries.length === 0) {
      router.push(ROUTES.dashboard)
      return
    }
    const assets = validEntries.map((en) =>
      formEntryToAsset(en, 'local_user', nextId())
    )
    setAssets(assets)
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Add Your Assets</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Enter each asset manually. Your data stays in your browser.
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

        {/* Running total */}
        {total > 0 && (
          <div className="flex items-center justify-between rounded-lg border border-surface-border bg-surface-card px-4 py-3">
            <span className="text-sm text-gray-400">Total entered</span>
            <span className="text-base font-bold text-white">{formatCurrency(total)}</span>
          </div>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <Button
            type="button"
            variant="ghost"
            onClick={() => router.push(ROUTES.dashboard)}
          >
            Skip for now
          </Button>
          <Button type="submit">
            View My Dashboard
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

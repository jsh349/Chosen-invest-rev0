'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Plus, ChevronRight } from 'lucide-react'
import { AssetRow } from '@/components/portfolio/asset-row'
import { Button } from '@/components/ui/button'
import { blankFormEntry, formEntryToAsset } from '@/features/portfolio/helpers'
import type { AssetFormEntry } from '@/features/portfolio/types'
import type { Asset } from '@/lib/types/asset'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { useAssets } from '@/lib/store/assets-store'
import { formatCurrency } from '@/lib/utils/currency'
import { ROUTES } from '@/lib/constants/routes'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

function assetToFormEntry(asset: Asset): AssetFormEntry {
  return {
    name: asset.name,
    category: asset.category,
    value: asset.value.toString(),
    currency: asset.currency ?? 'USD',
  }
}

export default function PortfolioInputPage() {
  const router = useRouter()
  const { assets, hasCustomAssets, isLoaded, setAssets } = useAssets()
  const [entries, setEntries] = useState<AssetFormEntry[] | null>(null)

  useEffect(() => {
    if (!isLoaded) return
    setEntries(hasCustomAssets ? assets.map(assetToFormEntry) : [blankFormEntry()])
  }, [isLoaded])

  if (!isLoaded || entries === null) {
    return (
      <LoadingSpinner />
    )
  }

  const total = entries.reduce((sum, e) => sum + (parseFloat(e.value) || 0), 0)

  function handleChange(index: number, field: keyof AssetFormEntry, value: string) {
    setEntries((prev) => {
      if (!prev) return prev
      const updated = [...prev]
      updated[index] = { ...updated[index], [field]: value }
      return updated
    })
  }

  function handleAdd() {
    setEntries((prev) => (prev ? [...prev, blankFormEntry()] : [blankFormEntry()]))
  }

  function handleRemove(index: number) {
    setEntries((prev) => (prev ? prev.filter((_, i) => i !== index) : prev))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!entries) return
    const validEntries = entries.filter(
      (en) => en.name.trim() && parseFloat(en.value) > 0
    )
    if (validEntries.length === 0) {
      router.push(ROUTES.dashboard)
      return
    }
    const newAssets = validEntries.map((en) =>
      formEntryToAsset(en, LOCAL_USER_ID, crypto.randomUUID())
    )
    setAssets(newAssets)
    router.push(ROUTES.dashboard)
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">
          {hasCustomAssets ? 'Edit Your Assets' : 'Add Your Assets'}
        </h1>
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
            Cancel
          </Button>
          <Button type="submit">
            Save &amp; View Dashboard
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </div>
  )
}

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
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { ROUTES } from '@/lib/constants/routes'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

// Extends AssetFormEntry locally to carry identity fields for existing assets.
// _id and _createdAt are preserved through edits and used at submit time so
// re-saving the form does not replace existing asset IDs or timestamps.
// _key is a stable React key (never changes for the lifetime of the row).
type FormEntry = AssetFormEntry & { _id?: string; _createdAt?: string; _key: string }

function assetToFormEntry(asset: Asset): FormEntry {
  return {
    name: asset.name,
    category: asset.category,
    value: asset.value.toString(),
    currency: asset.currency ?? 'USD',
    _id: asset.id,
    _createdAt: asset.createdAt,
    _key: asset.id,
  }
}

function blankEntry(): FormEntry {
  return { ...blankFormEntry(), _key: crypto.randomUUID() }
}

export default function PortfolioInputPage() {
  const router = useRouter()
  const { assets, hasCustomAssets, isLoaded, setAssets } = useAssets()
  const { fmt } = useFormatCurrency()
  const [entries, setEntries] = useState<FormEntry[] | null>(null)

  // isLoaded is the intentional one-shot trigger. Adding assets/hasCustomAssets
  // would reset the form and lose in-progress edits whenever the store updates.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!isLoaded) return
    setEntries(hasCustomAssets ? assets.map(assetToFormEntry) : [blankEntry()])
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
    setEntries((prev) => (prev ? [...prev, blankEntry()] : [blankEntry()]))
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
    const now = new Date().toISOString()
    const newAssets = validEntries.map((en) => ({
      ...formEntryToAsset(en, LOCAL_USER_ID, en._id ?? crypto.randomUUID()),
      createdAt: en._createdAt ?? now,
    }))
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
            key={entry._key}
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
            <span className="text-base font-bold text-white">{fmt(total)}</span>
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

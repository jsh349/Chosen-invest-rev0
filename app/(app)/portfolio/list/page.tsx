'use client'

import Link from 'next/link'
import { useState } from 'react'
import { Trash2, PlusCircle, Pencil, Check, X } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { CategorySelect } from '@/components/portfolio/category-select'
import { useAssets } from '@/lib/store/assets-store'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { CATEGORY_MAP } from '@/lib/constants/asset-categories'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { AssetCategory } from '@/lib/types/asset'

type Draft = { name: string; category: AssetCategory; value: string }

export default function PortfolioListPage() {
  const { assets, hasCustomAssets, updateAsset, removeAsset, isLoaded, isLoadError } = useAssets()
  const { fmt } = useFormatCurrency()
  const [editingId, setEditingId] = useState<string | null>(null)
  const [draft, setDraft] = useState<Draft | null>(null)
  const [editError, setEditError] = useState<string | null>(null)

  if (!isLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  if (isLoadError) {
    return (
      <p className="py-10 text-center text-sm text-gray-500">Failed to load portfolio — refresh to try again.</p>
    )
  }

  if (!hasCustomAssets) {
    return (
      <div className="flex min-h-[50vh] flex-col items-center justify-center text-center px-4">
        <h1 className="mb-2 text-xl font-bold text-white">Portfolio</h1>
        <p className="mb-6 text-sm text-gray-500">No assets saved yet.</p>
        <Link href={ROUTES.portfolioInput} className={cn(buttonVariants({ size: 'lg' }), 'gap-2')}>
          <PlusCircle className="h-4 w-4" />
          Add Your First Asset
        </Link>
      </div>
    )
  }

  const totalValue = assets.reduce((sum, a) => sum + a.value, 0)

  function startEdit(id: string) {
    const asset = assets.find((a) => a.id === id)
    if (!asset) return
    setEditingId(id)
    setDraft({ name: asset.name, category: asset.category, value: asset.value.toString() })
  }

  function cancelEdit() {
    setEditingId(null)
    setDraft(null)
    setEditError(null)
  }

  function saveEdit(id: string) {
    if (!draft) return
    const value = parseFloat(draft.value)
    if (!draft.name.trim() || isNaN(value) || value <= 0) {
      setEditError('Enter a name and a positive value.')
      return
    }
    setEditError(null)
    updateAsset(id, { name: draft.name.trim(), category: draft.category, value })
    setEditingId(null)
    setDraft(null)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Portfolio</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {assets.length} assets · Total {fmt(totalValue)}
          </p>
        </div>
        <Link href={ROUTES.portfolioInput} className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}>
          <PlusCircle className="h-4 w-4" />
          Add Assets
        </Link>
      </div>

      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-5 py-4">
        <span className="text-sm text-gray-400">Total Asset Value</span>
        <span className="text-xl font-bold text-white">{fmt(totalValue)}</span>
      </div>

      <div className="space-y-2">
        {assets.map((asset) => {
          const meta = CATEGORY_MAP[asset.category]
          const isEditing = editingId === asset.id

          if (isEditing && draft) {
            return (
              <div
                key={asset.id}
                className="rounded-xl border border-brand-700/50 bg-surface-card px-4 py-3 space-y-3"
              >
                <div className="grid grid-cols-1 gap-2 sm:grid-cols-3">
                  <Input
                    value={draft.name}
                    onChange={(e) => setDraft({ ...draft, name: e.target.value })}
                    placeholder="Asset name"
                    autoFocus
                  />
                  <CategorySelect
                    value={draft.category}
                    onChange={(v) => setDraft({ ...draft, category: v as AssetCategory })}
                  />
                  <Input
                    type="number"
                    min="0"
                    step="100"
                    value={draft.value}
                    onChange={(e) => setDraft({ ...draft, value: e.target.value })}
                    placeholder="0"
                  />
                </div>
                {editError && (
                  <p className="text-xs text-red-400">{editError}</p>
                )}
                <div className="flex justify-end gap-2">
                  <Button size="sm" variant="ghost" onClick={cancelEdit}>
                    <X className="h-3.5 w-3.5" />
                    Cancel
                  </Button>
                  <Button size="sm" onClick={() => saveEdit(asset.id)}>
                    <Check className="h-3.5 w-3.5" />
                    Save
                  </Button>
                </div>
              </div>
            )
          }

          return (
            <div
              key={asset.id}
              className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card px-4 py-3"
            >
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: meta?.color ?? '#6b7280' }}
              />
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                <p className="text-xs text-gray-500">{meta?.label ?? asset.category}</p>
              </div>
              <span className="text-sm font-semibold text-white">
                {fmt(asset.value)}
              </span>
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-brand-400"
                  onClick={() => startEdit(asset.id)}
                >
                  <Pencil className="h-3.5 w-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-red-400"
                  onClick={() => removeAsset(asset.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}

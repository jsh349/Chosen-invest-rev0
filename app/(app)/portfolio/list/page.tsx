'use client'

import Link from 'next/link'
import { Trash2, PlusCircle } from 'lucide-react'
import { Button, buttonVariants } from '@/components/ui/button'
import { useAssets } from '@/lib/store/assets-store'
import { CATEGORY_MAP } from '@/lib/constants/asset-categories'
import { formatCurrency } from '@/lib/utils/currency'
import { ROUTES } from '@/lib/constants/routes'
import { MOCK_ASSETS } from '@/lib/mock/assets'
import { cn } from '@/lib/utils/cn'

export default function PortfolioListPage() {
  const { assets, hasCustomAssets, removeAsset, isLoaded } = useAssets()

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  const activeAssets = hasCustomAssets ? assets : MOCK_ASSETS
  const isDemoMode = !hasCustomAssets
  const totalValue = activeAssets.reduce((sum, a) => sum + a.value, 0)

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Portfolio</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {isDemoMode
              ? 'Demo data — add your own assets'
              : `${activeAssets.length} assets · Total ${formatCurrency(totalValue)}`}
          </p>
        </div>
        <Link href={ROUTES.portfolioInput} className={cn(buttonVariants({ size: 'sm' }), 'gap-2')}>
          <PlusCircle className="h-4 w-4" />
          {hasCustomAssets ? 'Edit Assets' : 'Add Assets'}
        </Link>
      </div>

      {isDemoMode && (
        <div className="flex items-center justify-between rounded-lg border border-amber-900/50 bg-amber-950/30 px-4 py-3">
          <p className="text-sm text-amber-400">Showing demo data.</p>
          <Link href={ROUTES.portfolioInput} className={buttonVariants({ size: 'sm' })}>
            Add Your Assets
          </Link>
        </div>
      )}

      {/* Summary row */}
      <div className="flex items-center justify-between rounded-xl border border-surface-border bg-surface-card px-5 py-4">
        <span className="text-sm text-gray-400">Total Asset Value</span>
        <span className="text-xl font-bold text-white">{formatCurrency(totalValue)}</span>
      </div>

      {/* Asset rows */}
      <div className="space-y-2">
        {activeAssets.map((asset) => {
          const meta = CATEGORY_MAP[asset.category]
          return (
            <div
              key={asset.id}
              className="flex items-center gap-4 rounded-xl border border-surface-border bg-surface-card px-4 py-3"
            >
              {/* Category dot */}
              <span
                className="h-3 w-3 flex-shrink-0 rounded-full"
                style={{ backgroundColor: meta?.color ?? '#6b7280' }}
              />

              {/* Name + category */}
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-white">{asset.name}</p>
                <p className="text-xs text-gray-500">{meta?.label ?? asset.category}</p>
              </div>

              {/* Value */}
              <span className="text-sm font-semibold text-white">
                {formatCurrency(asset.value)}
              </span>

              {/* Remove (only for user-owned assets) */}
              {hasCustomAssets && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 text-gray-500 hover:text-red-400"
                  onClick={() => removeAsset(asset.id)}
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </Button>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

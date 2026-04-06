import type { Asset } from '@/lib/types/asset'
import type { AllocationSlice, PortfolioSummary } from '@/lib/types/dashboard'
import { CATEGORY_MAP } from '@/lib/constants/asset-categories'
import { toPercentage } from '@/lib/utils/percentage'
import { normalizeAssetCategory } from '@/lib/utils/normalize-category'

export function buildPortfolioSummary(
  userId: string,
  assets: Asset[]
): PortfolioSummary {
  // NOTE: Sums all asset values as a single-currency total.
  // Multi-currency conversion is not yet implemented — all values are assumed
  // to be in the user's display currency. A conversion layer will be needed
  // before API data with mixed currencies can be trusted.
  const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0)

  const grouped = assets.reduce<Record<string, number>>((acc, asset) => {
    const cat = normalizeAssetCategory(asset.category)
    acc[cat] = (acc[cat] ?? 0) + asset.value
    return acc
  }, {})

  const categoryBreakdown: AllocationSlice[] = Object.entries(grouped)
    .map(([category, value]) => {
      const meta = CATEGORY_MAP[category]
      return {
        category: category as AllocationSlice['category'],
        label: meta?.label ?? category,
        value,
        percentage: toPercentage(value, totalAssetValue),
        color: meta?.color ?? '#6b7280',
      }
    })
    .sort((a, b) => b.value - a.value)

  const largest = assets.reduce<Asset | null>(
    (top, a) => (a.value > (top?.value ?? -1) ? a : top),
    null
  )

  return {
    userId,
    totalAssetValue,
    assetCount: assets.length,
    categoryBreakdown,
    largestAsset: largest ? { name: largest.name, value: largest.value } : null,
    generatedAt: new Date().toISOString(),
  }
}

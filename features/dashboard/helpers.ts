import type { Asset } from '@/lib/types/asset'
import type { AllocationSlice, PortfolioSummary } from '@/lib/types/dashboard'
import { CATEGORY_MAP } from '@/lib/constants/asset-categories'
import { toPercentage } from '@/lib/utils/percentage'

export function buildPortfolioSummary(
  userId: string,
  assets: Asset[]
): PortfolioSummary {
  const totalAssetValue = assets.reduce((sum, a) => sum + a.value, 0)

  // Multi-currency guard: summing values across different currencies is not valid.
  // FX conversion is not implemented — flag the condition so the UI can warn users.
  const currencies = new Set(assets.map((a) => a.currency).filter(Boolean))
  const hasMixedCurrencies = currencies.size > 1
  if (hasMixedCurrencies && process.env.NODE_ENV !== 'production') {
    console.warn(
      `[buildPortfolioSummary] Assets span ${currencies.size} currencies (${[...currencies].join(', ')}). ` +
      'totalAssetValue is not FX-normalized. Display total as approximate only.'
    )
  }

  const grouped = assets.reduce<Record<string, number>>((acc, asset) => {
    acc[asset.category] = (acc[asset.category] ?? 0) + asset.value
    return acc
  }, {})

  const categoryBreakdown: AllocationSlice[] = Object.entries(grouped)
    .map(([category, value]) => {
      const meta = CATEGORY_MAP[category]
      if (!meta && process.env.NODE_ENV !== 'production') {
        console.warn(`[buildPortfolioSummary] Unknown asset category: "${category}" — falling back to defaults.`)
      }
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
    ...(hasMixedCurrencies ? { hasMixedCurrencies: true } : {}),
  }
}

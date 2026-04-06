import type { AssetCategory } from './asset'

export type AllocationSlice = {
  category: AssetCategory
  label: string
  value: number
  percentage: number
  color: string
}

export type PortfolioSummary = {
  userId: string
  totalAssetValue: number
  assetCount: number
  categoryBreakdown: AllocationSlice[]
  largestAsset: { name: string; value: number } | null
  generatedAt: string
  /**
   * True when assets span more than one currency code.
   * totalAssetValue is NOT normalized in this case — FX conversion is not implemented.
   * Consumers should warn users rather than presenting the total as meaningful.
   */
  hasMixedCurrencies?: boolean
}

export type SuggestedAction = {
  label: string
  href: string
}

export type AIAnalysisResult = {
  userId: string
  summaryText: string
  keyPoints: string[]
  suggestedActions: SuggestedAction[]
  inputSnapshot: {
    totalValue: number
    assetCount: number
    topCategory: string
  }
  generatedAt: string
}

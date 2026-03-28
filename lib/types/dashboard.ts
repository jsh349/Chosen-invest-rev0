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
}

export type AIAnalysisResult = {
  userId: string
  summaryText: string
  keyPoints: string[]
  inputSnapshot: {
    totalValue: number
    assetCount: number
    topCategory: string
  }
  generatedAt: string
}

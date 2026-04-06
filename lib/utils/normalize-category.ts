import type { AssetCategory } from '@/lib/types/asset'

const KNOWN_CATEGORIES = new Set<AssetCategory>([
  'cash',
  'stock',
  'etf',
  'crypto',
  'retirement',
  'real_estate',
  'other',
])

/**
 * Validates that a string is a known AssetCategory.
 * Maps unknown values to 'other' so downstream code never receives an
 * unexpected category string — important when real API data arrives.
 */
export function normalizeAssetCategory(raw: string): AssetCategory {
  return KNOWN_CATEGORIES.has(raw as AssetCategory) ? (raw as AssetCategory) : 'other'
}

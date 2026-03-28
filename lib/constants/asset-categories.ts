import type { AssetCategoryMeta } from '@/lib/types/asset'

export const ASSET_CATEGORIES: AssetCategoryMeta[] = [
  { key: 'cash',         label: 'Cash & Savings',   color: '#4f7df3', sortOrder: 1 },
  { key: 'stock',        label: 'Stocks',            color: '#10b981', sortOrder: 2 },
  { key: 'etf',          label: 'ETFs / Funds',      color: '#f59e0b', sortOrder: 3 },
  { key: 'crypto',       label: 'Crypto',            color: '#8b5cf6', sortOrder: 4 },
  { key: 'retirement',   label: 'Retirement',        color: '#06b6d4', sortOrder: 5 },
  { key: 'real_estate',  label: 'Real Estate',       color: '#f97316', sortOrder: 6 },
  { key: 'other',        label: 'Other',             color: '#6b7280', sortOrder: 7 },
]

export const CATEGORY_MAP = Object.fromEntries(
  ASSET_CATEGORIES.map((c) => [c.key, c])
) as Record<string, AssetCategoryMeta>

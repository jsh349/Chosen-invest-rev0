export type AssetCategory =
  | 'cash'
  | 'stock'
  | 'etf'
  | 'crypto'
  | 'retirement'
  | 'real_estate'
  | 'other'

export type Asset = {
  id: string
  userId?: string
  name: string
  category: AssetCategory
  value: number
  currency: string
  createdAt: string
  updatedAt: string
}

export type AssetCategoryMeta = {
  key: AssetCategory
  label: string
  color: string
  sortOrder: number
}

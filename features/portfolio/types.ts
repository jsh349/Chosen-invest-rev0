import type { AssetCategory } from '@/lib/types/asset'

export type AssetFormEntry = {
  name: string
  category: AssetCategory
  value: string
  currency: string
}

export type AssetFormState = {
  entries: AssetFormEntry[]
}

import type { Asset } from '@/lib/types/asset'
import type { AssetFormEntry } from './types'

export function formEntryToAsset(
  entry: AssetFormEntry,
  userId: string,
  id: string
): Asset {
  return {
    id,
    userId,
    name: entry.name.trim(),
    category: entry.category,
    value: parseFloat(entry.value),
    currency: entry.currency || 'USD',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  }
}

export function blankFormEntry(): AssetFormEntry {
  return { name: '', category: 'cash', value: '', currency: 'USD' }
}

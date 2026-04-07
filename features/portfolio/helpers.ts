import type { Asset } from '@/lib/types/asset'
import type { AssetFormEntry } from './types'

export function formEntryToAsset(
  entry: AssetFormEntry,
  userId: string,
  id: string,
  createdAt?: string,
): Asset {
  const value = parseFloat(entry.value)
  if (!Number.isFinite(value)) throw new Error(`[formEntryToAsset] Invalid value: "${entry.value}"`)
  const now = new Date().toISOString()
  return {
    id,
    userId,
    name: entry.name.trim(),
    category: entry.category,
    value,
    currency: entry.currency || 'USD',
    createdAt: createdAt ?? now,
    updatedAt: now,
  }
}

export function blankFormEntry(): AssetFormEntry {
  return { name: '', category: 'cash', value: '', currency: 'USD' }
}

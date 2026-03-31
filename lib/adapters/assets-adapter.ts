import type { Asset, AssetCategory } from '@/lib/types/asset'
import { ASSET_CATEGORIES } from '@/lib/constants/asset-categories'

const VALID_ASSET_CATEGORIES = new Set<string>(ASSET_CATEGORIES.map((c) => c.key))

function isValidAssetCategory(cat: string): cat is AssetCategory {
  return VALID_ASSET_CATEGORIES.has(cat)
}

/** Async adapter interface — decouples stores from the underlying data source. */
export type AssetsAdapter = {
  getAll(): Promise<Asset[]>
  saveAll(assets: Asset[]): Promise<void>
  clear(): Promise<void>
}

/** API-backed implementation — persists assets in Turso via /api/assets. */
export const assetsAdapter: AssetsAdapter = {
  async getAll() {
    const res = await fetch('/api/assets', { credentials: 'include' })
    if (!res.ok) throw new Error(`[assetsAdapter] getAll failed: ${res.status}`)
    const data = await res.json() as Asset[]
    return data.filter((a) => {
      if (!a.id || !Number.isFinite(a.value) || !a.name) {
        console.warn('[assetsAdapter] Skipping malformed asset — missing id, value, or name.', a)
        return false
      }
      if (!isValidAssetCategory(a.category)) {
        console.warn(`[assetsAdapter] Unknown category "${a.category}" on asset "${a.id}" — skipped.`)
        return false
      }
      return true
    })
  },

  async saveAll(assets) {
    const res = await fetch('/api/assets', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(assets),
    })
    if (!res.ok) throw new Error(`[assetsAdapter] saveAll failed: ${res.status}`)
  },

  async clear() {
    const res = await fetch('/api/assets', { method: 'DELETE', credentials: 'include' })
    if (!res.ok) throw new Error(`[assetsAdapter] clear failed: ${res.status}`)
  },
}

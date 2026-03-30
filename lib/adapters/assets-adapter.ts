import type { Asset, AssetCategory } from '@/lib/types/asset'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { ASSET_CATEGORIES } from '@/lib/constants/asset-categories'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.assets

const VALID_ASSET_CATEGORIES = new Set<string>(ASSET_CATEGORIES.map((c) => c.key))

function isValidAssetCategory(cat: string): cat is AssetCategory {
  return VALID_ASSET_CATEGORIES.has(cat)
}

/** Async adapter interface — matches the shape of a future API client. */
export type AssetsAdapter = {
  getAll(): Promise<Asset[]>
  saveAll(assets: Asset[]): Promise<void>
  clear(): Promise<void>
}

/** Local implementation backed by localStorage. */
export const assetsAdapter: AssetsAdapter = {
  async getAll() {
    const all = readJSON<Asset[]>(LS_KEY, [])
    return all.filter((a) => {
      if (!isValidAssetCategory(a.category)) {
        console.warn(`[assetsAdapter] Unknown category "${a.category}" on asset "${a.id}" — skipped.`)
        return false
      }
      return true
    })
  },

  async saveAll(assets) {
    if (!writeJSON(LS_KEY, assets)) throw new Error('localStorage write failed (assets)')
  },

  async clear() {
    writeJSON(LS_KEY, [])
  },
}

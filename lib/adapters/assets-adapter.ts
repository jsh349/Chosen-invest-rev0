import type { Asset } from '@/lib/types/asset'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.assets

/** Minimal data adapter for assets. Swap implementation for API later. */
export const assetsAdapter = {
  getAll(): Asset[] {
    return readJSON<Asset[]>(LS_KEY, [])
  },

  saveAll(assets: Asset[]): void {
    writeJSON(LS_KEY, assets)
  },

  clear(): void {
    window.localStorage.removeItem(LS_KEY)
  },
}

import type { Asset } from '@/lib/types/asset'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.assets

/** Async adapter interface — matches the shape of a future API client. */
export type AssetsAdapter = {
  getAll(): Promise<Asset[]>
  saveAll(assets: Asset[]): Promise<void>
  clear(): Promise<void>
}

/** Local implementation backed by localStorage. */
export const assetsAdapter: AssetsAdapter = {
  async getAll() {
    return readJSON<Asset[]>(LS_KEY, [])
  },

  async saveAll(assets) {
    writeJSON(LS_KEY, assets)
  },

  async clear() {
    window.localStorage.removeItem(LS_KEY)
  },
}

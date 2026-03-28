'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Asset } from '@/lib/types/asset'
import { recordAudit } from '@/lib/store/audit-store'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.assets

type AssetsContextType = {
  assets: Asset[]
  hasCustomAssets: boolean
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => void
  removeAsset: (id: string) => void
  clearAssets: () => void
  isLoaded: boolean
}

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
  hasCustomAssets: false,
  setAssets: () => {},
  addAsset: () => {},
  updateAsset: () => {},
  removeAsset: () => {},
  clearAssets: () => {},
  isLoaded: false,
})

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssetsState] = useState<Asset[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = readJSON<Asset[]>(LS_KEY, [])
    if (stored.length > 0) setAssetsState(stored)
    setIsLoaded(true)
  }, [])

  const setAssets = useCallback((newAssets: Asset[]) => {
    writeJSON(LS_KEY, newAssets)
    setAssetsState(newAssets)
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    setAssetsState((prev) => {
      const updated = [...prev, asset]
      writeJSON(LS_KEY, updated)
      return updated
    })
    recordAudit('Asset added', asset.name)
  }, [])

  const updateAsset = useCallback(
    (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => {
      setAssetsState((prev) => {
        const target = prev.find((a) => a.id === id)
        const updated = prev.map((a) =>
          a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
        )
        writeJSON(LS_KEY, updated)
        if (target) recordAudit('Asset edited', patch.name ?? target.name)
        return updated
      })
    },
    []
  )

  const removeAsset = useCallback((id: string) => {
    setAssetsState((prev) => {
      const target = prev.find((a) => a.id === id)
      if (target) recordAudit('Asset deleted', target.name)
      const updated = prev.filter((a) => a.id !== id)
      writeJSON(LS_KEY, updated)
      return updated
    })
  }, [])

  const clearAssets = useCallback(() => {
    window.localStorage.removeItem(LS_KEY)
    setAssetsState([])
  }, [])

  return (
    <AssetsContext.Provider
      value={{
        assets,
        hasCustomAssets: assets.length > 0,
        setAssets,
        addAsset,
        updateAsset,
        removeAsset,
        clearAssets,
        isLoaded,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}

export function useAssets() {
  return useContext(AssetsContext)
}

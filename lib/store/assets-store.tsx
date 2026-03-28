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

const LS_KEY = 'chosen_assets_v1'

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
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) setAssetsState(JSON.parse(stored))
    } catch {
      // ignore
    }
    setIsLoaded(true)
  }, [])

  const setAssets = useCallback((newAssets: Asset[]) => {
    window.localStorage.setItem(LS_KEY, JSON.stringify(newAssets))
    setAssetsState(newAssets)
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    setAssetsState((prev) => {
      const updated = [...prev, asset]
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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
        window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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

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

const LS_KEY = 'chosen_assets_v1'

type AssetsContextType = {
  assets: Asset[]
  hasCustomAssets: boolean
  setAssets: (assets: Asset[]) => void
  addAsset: (asset: Asset) => void
  removeAsset: (id: string) => void
  clearAssets: () => void
  isLoaded: boolean
}

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
  hasCustomAssets: false,
  setAssets: () => {},
  addAsset: () => {},
  removeAsset: () => {},
  clearAssets: () => {},
  isLoaded: false,
})

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssetsState] = useState<Asset[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    try {
      const stored = localStorage.getItem(LS_KEY)
      if (stored) setAssetsState(JSON.parse(stored))
    } catch {
      // ignore parse errors
    }
    setIsLoaded(true)
  }, [])

  const setAssets = useCallback((newAssets: Asset[]) => {
    localStorage.setItem(LS_KEY, JSON.stringify(newAssets))
    setAssetsState(newAssets)
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    setAssetsState((prev) => {
      const updated = [...prev, asset]
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeAsset = useCallback((id: string) => {
    setAssetsState((prev) => {
      const updated = prev.filter((a) => a.id !== id)
      localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const clearAssets = useCallback(() => {
    localStorage.removeItem(LS_KEY)
    setAssetsState([])
  }, [])

  return (
    <AssetsContext.Provider
      value={{
        assets,
        hasCustomAssets: assets.length > 0,
        setAssets,
        addAsset,
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

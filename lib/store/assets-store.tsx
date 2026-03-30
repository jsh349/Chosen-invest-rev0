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
import { assetsAdapter } from '@/lib/adapters/assets-adapter'

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
    let cancelled = false
    assetsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) setAssetsState(stored)
      setIsLoaded(true)
    }).catch(() => {
      if (!cancelled) setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const setAssets = useCallback((newAssets: Asset[]) => {
    void assetsAdapter.saveAll(newAssets).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    setAssetsState(newAssets)
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    setAssetsState((prev) => {
      const updated = [...prev, asset]
      void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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
        void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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
      void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
      return updated
    })
  }, [])

  const clearAssets = useCallback(() => {
    void assetsAdapter.clear().catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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

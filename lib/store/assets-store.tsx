'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Asset } from '@/lib/types/asset'
import { recordAudit } from '@/lib/store/audit-store'
import { assetsAdapter } from '@/lib/adapters/assets-adapter'

type AssetsContextType = {
  assets: Asset[]
  hasCustomAssets: boolean
  /** Returns a Promise so callers can await and catch save failures. */
  setAssets: (assets: Asset[]) => Promise<void>
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => void
  removeAsset: (id: string) => void
  clearAssets: () => void
  isLoaded: boolean
  /** True when the initial load failed. isLoaded is also true in this state. */
  isLoadError: boolean
}

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
  hasCustomAssets: false,
  setAssets: () => Promise.resolve(),
  addAsset: () => {},
  updateAsset: () => {},
  removeAsset: () => {},
  clearAssets: () => {},
  isLoaded: false,
  isLoadError: false,
})

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssetsState] = useState<Asset[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)
  // Ref mirrors state so mutation callbacks can build the next array without
  // putting async side-effects inside the setState updater (Strict Mode double-invoke).
  const assetsRef = useRef<Asset[]>([])

  useEffect(() => {
    let cancelled = false
    assetsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) {
        assetsRef.current = stored
        setAssetsState(stored)
      }
      setIsLoaded(true)
    }).catch(() => {
      if (!cancelled) {
        setIsLoadError(true)
        setIsLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const setAssets = useCallback((newAssets: Asset[]): Promise<void> => {
    const prev = assetsRef.current
    assetsRef.current = newAssets
    setAssetsState(newAssets)
    return assetsAdapter.saveAll(newAssets).catch((err) => {
      console.error(err)
      assetsRef.current = prev
      setAssetsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
      throw err
    })
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    const prev = assetsRef.current
    const updated = [...assetsRef.current, asset]
    assetsRef.current = updated
    setAssetsState(updated)
    void assetsAdapter.saveAll(updated).catch(() => {
      console.error('[assets] save failed')
      assetsRef.current = prev
      setAssetsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
    recordAudit('Asset added', asset.name)
  }, [])

  const updateAsset = useCallback(
    (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => {
      const prev = assetsRef.current
      const target = prev.find((a) => a.id === id)
      const updated = prev.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      )
      assetsRef.current = updated
      setAssetsState(updated)
      void assetsAdapter.saveAll(updated).catch(() => {
        console.error('[assets] save failed')
        assetsRef.current = prev
        setAssetsState(prev)
        if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
      })
      if (target) recordAudit('Asset edited', patch.name ?? target.name)
    },
    []
  )

  const removeAsset = useCallback((id: string) => {
    const prev = assetsRef.current
    const target = prev.find((a) => a.id === id)
    if (target) recordAudit('Asset deleted', target.name)
    const updated = prev.filter((a) => a.id !== id)
    assetsRef.current = updated
    setAssetsState(updated)
    void assetsAdapter.saveAll(updated).catch(() => {
      console.error('[assets] save failed')
      assetsRef.current = prev
      setAssetsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
  }, [])

  const clearAssets = useCallback(() => {
    void assetsAdapter.clear().catch(console.error)
    assetsRef.current = []
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
        isLoadError,
      }}
    >
      {children}
    </AssetsContext.Provider>
  )
}

export function useAssets() {
  return useContext(AssetsContext)
}

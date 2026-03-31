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
  setAssets: (assets: Asset[]) => Promise<void>
  addAsset: (asset: Asset) => void
  updateAsset: (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => void
  removeAsset: (id: string) => void
  clearAssets: () => Promise<void>
  isLoaded: boolean
  /** True when the initial load failed (network error, 401, 500, etc.).
   *  isLoaded is also true in this state — the store has settled, just with no data. */
  isLoadError: boolean
}

const AssetsContext = createContext<AssetsContextType>({
  assets: [],
  hasCustomAssets: false,
  setAssets: () => Promise.resolve(),
  addAsset: () => {},
  updateAsset: () => {},
  removeAsset: () => {},
  clearAssets: () => Promise.resolve(),
  isLoaded: false,
  isLoadError: false,
})

export function AssetsProvider({ children }: { children: ReactNode }) {
  const [assets, setAssetsState] = useState<Asset[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)
  // Ref mirrors state so mutation callbacks can build the next array without
  // putting async side-effects inside the setState updater. React Strict Mode
  // double-invokes updater functions in development — calling saveAll() inside
  // an updater would fire two API writes per mutation.
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
        // Load failed (network error, auth error, etc.) — mark error so callers
        // can distinguish "no data yet" from "failed to load existing data".
        setIsLoadError(true)
        setIsLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const setAssets = useCallback((newAssets: Asset[]) => {
    // Update in-memory state immediately so the UI responds without waiting,
    // then return the save Promise so callers can await persistence before
    // navigating away (prevents stale-read on immediate dashboard reload).
    assetsRef.current = newAssets
    setAssetsState(newAssets)
    return assetsAdapter.saveAll(newAssets).catch((err) => {
      console.error('[assets] save failed', err)
      window.dispatchEvent(new CustomEvent('persist-error'))
      throw err
    })
  }, [])

  const addAsset = useCallback((asset: Asset) => {
    const updated = [...assetsRef.current, asset]
    assetsRef.current = updated
    setAssetsState(updated)
    void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    recordAudit('Asset added', asset.name)
  }, [])

  const updateAsset = useCallback(
    (id: string, patch: Partial<Pick<Asset, 'name' | 'category' | 'value'>>) => {
      const target = assetsRef.current.find((a) => a.id === id)
      const updated = assetsRef.current.map((a) =>
        a.id === id ? { ...a, ...patch, updatedAt: new Date().toISOString() } : a
      )
      assetsRef.current = updated
      setAssetsState(updated)
      void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
      if (target) recordAudit('Asset edited', patch.name ?? target.name)
    },
    []
  )

  const removeAsset = useCallback((id: string) => {
    const target = assetsRef.current.find((a) => a.id === id)
    if (target) recordAudit('Asset deleted', target.name)
    const updated = assetsRef.current.filter((a) => a.id !== id)
    assetsRef.current = updated
    setAssetsState(updated)
    void assetsAdapter.saveAll(updated).catch(() => { console.error('[assets] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
  }, [])

  const clearAssets = useCallback(async () => {
    await assetsAdapter.clear().catch((err) => {
      console.error('[assets] clear failed', err)
      window.dispatchEvent(new CustomEvent('persist-error'))
      throw err
    })
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

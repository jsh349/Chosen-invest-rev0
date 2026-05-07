'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'
import type { RankResult } from '@/lib/types/rank'
import '@/lib/mock/guard'
import { BENCHMARK_META } from '@/lib/mock/rank-benchmarks'
import { getActiveBenchmarkSourceId } from '@/lib/adapters/rank-benchmarks-adapter'

const LS_KEY = STORAGE_KEYS.rankSnapshots
const MAX_LOCAL_SNAPSHOTS = 10

export type RankSnapshot = {
  id: string
  savedAt: string
  totalAssetValue: number
  overallPercentile: number | null
  agePercentile: number | null
  returnPercentile: number | null
  benchmarkVersion?: string
  benchmarkSource?: string
}

export function getBenchmarkSnapshotMeta(): { benchmarkVersion: string; benchmarkSource: string } {
  return {
    benchmarkVersion: BENCHMARK_META.version,
    benchmarkSource:  getActiveBenchmarkSourceId(),
  }
}

function extractSnapshot(
  ranks: RankResult[],
  totalAssetValue: number
): Omit<RankSnapshot, 'id' | 'savedAt'> {
  return {
    totalAssetValue,
    overallPercentile:  ranks.find((r) => r.type === 'overall_wealth')?.percentile  ?? null,
    agePercentile:      ranks.find((r) => r.type === 'age_based')?.percentile        ?? null,
    returnPercentile:   ranks.find((r) => r.type === 'investment_return')?.percentile ?? null,
  }
}

function isDuplicate(latest: RankSnapshot | undefined, incoming: Omit<RankSnapshot, 'id' | 'savedAt'>): boolean {
  if (!latest) return false
  return (
    latest.totalAssetValue   === incoming.totalAssetValue &&
    latest.overallPercentile === incoming.overallPercentile &&
    latest.agePercentile     === incoming.agePercentile &&
    latest.returnPercentile  === incoming.returnPercentile
  )
}

function isValidSnapshot(item: unknown): item is RankSnapshot {
  if (typeof item !== 'object' || item === null) return false
  const s = item as Record<string, unknown>
  return (
    typeof s.id === 'string' &&
    typeof s.savedAt === 'string' &&
    typeof s.totalAssetValue === 'number' &&
    (s.overallPercentile === null || typeof s.overallPercentile === 'number')
  )
}

async function fetchFromApi(): Promise<RankSnapshot[] | null> {
  try {
    const res = await fetch('/api/rank-snapshots')
    if (!res.ok) return null
    const data = await res.json()
    return Array.isArray(data) ? data.filter(isValidSnapshot) : null
  } catch {
    return null
  }
}

async function postToApi(snapshot: RankSnapshot): Promise<boolean> {
  try {
    const res = await fetch('/api/rank-snapshots', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(snapshot),
    })
    return res.ok
  } catch {
    return false
  }
}

export function useRankSnapshots() {
  const [snapshots, setSnapshots] = useState<RankSnapshot[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const snapshotsRef = useRef<RankSnapshot[]>([])
  const useDbRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    async function load() {
      // Try API first (authenticated users get DB-backed unlimited history)
      const apiData = await fetchFromApi()
      if (!cancelled && apiData !== null) {
        useDbRef.current = true
        snapshotsRef.current = apiData
        setSnapshots(apiData)
        setIsLoaded(true)
        return
      }

      // Fallback to localStorage (unauthenticated or API unavailable)
      const raw = readJSON<unknown[]>(LS_KEY, [])
      const valid = (Array.isArray(raw) ? raw : []).filter(isValidSnapshot)
      if (!cancelled) {
        snapshotsRef.current = valid
        setSnapshots(valid)
        setIsLoaded(true)
      }
    }

    load()
    return () => { cancelled = true }
  }, [])

  const saveSnapshot = useCallback((ranks: RankResult[], totalAssetValue: number) => {
    const incoming = extractSnapshot(ranks, totalAssetValue)
    if (isDuplicate(snapshotsRef.current[0], incoming)) return

    const meta = getBenchmarkSnapshotMeta()
    const newSnap: RankSnapshot = {
      ...incoming,
      id: crypto.randomUUID(),
      savedAt: new Date().toISOString(),
      ...meta,
    }

    // Optimistically update local state
    const updated = [newSnap, ...snapshotsRef.current]
    snapshotsRef.current = updated
    setSnapshots(updated)

    if (useDbRef.current) {
      // Persist to DB (fire-and-forget); localStorage is kept as offline backup
      postToApi(newSnap)
      writeJSON(LS_KEY, updated.slice(0, MAX_LOCAL_SNAPSHOTS))
    } else {
      writeJSON(LS_KEY, updated.slice(0, MAX_LOCAL_SNAPSHOTS))
    }
  }, [])

  return { snapshots, isLoaded, saveSnapshot }
}

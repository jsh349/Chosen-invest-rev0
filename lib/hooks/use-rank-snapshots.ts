'use client'

import { useState, useEffect, useCallback } from 'react'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'
import type { RankResult } from '@/lib/types/rank'
import '@/lib/mock/guard'
import { BENCHMARK_META } from '@/lib/mock/rank-benchmarks'
import { getActiveBenchmarkSourceId } from '@/lib/adapters/rank-benchmarks-adapter'

const LS_KEY = STORAGE_KEYS.rankSnapshots
const MAX_SNAPSHOTS = 10

export type RankSnapshot = {
  id: string
  savedAt: string
  totalAssetValue: number
  overallPercentile: number | null
  agePercentile: number | null
  returnPercentile: number | null
  /** Benchmark version active when this snapshot was saved, e.g. "1.1.0". Optional for backward compatibility. */
  benchmarkVersion?: string
  /** Active benchmark source ID when this snapshot was saved, e.g. "default" | "curated". Optional for backward compatibility. */
  benchmarkSource?: string
}

/**
 * Returns the benchmark metadata to stamp into a new snapshot.
 * Exported for testing; not intended for direct use outside this module.
 */
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

export function useRankSnapshots() {
  const [snapshots, setSnapshots] = useState<RankSnapshot[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    setSnapshots(readJSON<RankSnapshot[]>(LS_KEY, []))
    setIsLoaded(true)
  }, [])

  const saveSnapshot = useCallback((ranks: RankResult[], totalAssetValue: number) => {
    const incoming = extractSnapshot(ranks, totalAssetValue)
    setSnapshots((prev) => {
      if (isDuplicate(prev[0], incoming)) return prev
      const meta = getBenchmarkSnapshotMeta()
      const updated = [
        { ...incoming, id: crypto.randomUUID(), savedAt: new Date().toISOString(), ...meta },
        ...prev,
      ].slice(0, MAX_SNAPSHOTS)
      writeJSON(LS_KEY, updated)
      return updated
    })
  }, [])

  return { snapshots, isLoaded, saveSnapshot }
}

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
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

export function useRankSnapshots() {
  const [snapshots, setSnapshots] = useState<RankSnapshot[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  // Ref mirrors state so saveSnapshot can read the latest value without
  // putting writeJSON (a side effect) inside the setState updater.
  const snapshotsRef = useRef<RankSnapshot[]>([])

  useEffect(() => {
    const raw = readJSON<unknown[]>(LS_KEY, [])
    const valid = (Array.isArray(raw) ? raw : []).filter(isValidSnapshot)
    snapshotsRef.current = valid
    setSnapshots(valid)
    setIsLoaded(true)
  }, [])

  const saveSnapshot = useCallback((ranks: RankResult[], totalAssetValue: number) => {
    const incoming = extractSnapshot(ranks, totalAssetValue)
    if (isDuplicate(snapshotsRef.current[0], incoming)) return
    const meta = getBenchmarkSnapshotMeta()
    const updated = [
      { ...incoming, id: crypto.randomUUID(), savedAt: new Date().toISOString(), ...meta },
      ...snapshotsRef.current,
    ].slice(0, MAX_SNAPSHOTS)
    snapshotsRef.current = updated
    setSnapshots(updated)
    writeJSON(LS_KEY, updated)
  }, [])

  return { snapshots, isLoaded, saveSnapshot }
}

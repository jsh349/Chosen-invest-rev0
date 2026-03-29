/**
 * Tests for getBenchmarkSnapshotMeta() — the helper that stamps benchmark
 * metadata into new rank snapshots.
 *
 * Also validates that existing snapshots without the optional fields
 * satisfy the RankSnapshot type contract (backward compatibility).
 */

import { getBenchmarkSnapshotMeta } from '@/lib/hooks/use-rank-snapshots'
import { BENCHMARK_META } from '@/lib/mock/rank-benchmarks'
import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

// ---------------------------------------------------------------------------
// localStorage mock (test env is node)
// ---------------------------------------------------------------------------

const store: Record<string, string> = {}
const localStorageMock = {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear:      () => { Object.keys(store).forEach((k) => delete store[k]) },
}
Object.defineProperty(global, 'window',       { value: global, writable: true })
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => { localStorageMock.clear() })

// ---------------------------------------------------------------------------
// getBenchmarkSnapshotMeta
// ---------------------------------------------------------------------------

describe('getBenchmarkSnapshotMeta', () => {
  it('returns an object with benchmarkVersion and benchmarkSource', () => {
    const meta = getBenchmarkSnapshotMeta()
    expect(typeof meta.benchmarkVersion).toBe('string')
    expect(typeof meta.benchmarkSource).toBe('string')
  })

  it('benchmarkVersion matches BENCHMARK_META.version', () => {
    expect(getBenchmarkSnapshotMeta().benchmarkVersion).toBe(BENCHMARK_META.version)
  })

  it('benchmarkSource defaults to "default" when nothing stored', () => {
    expect(getBenchmarkSnapshotMeta().benchmarkSource).toBe('default')
  })

  it('benchmarkSource reflects a stored "curated" preference', () => {
    localStorageMock.setItem('chosen_benchmark_source_v1', 'curated')
    expect(getBenchmarkSnapshotMeta().benchmarkSource).toBe('curated')
  })

  it('benchmarkSource falls back to "default" for unrecognised stored value', () => {
    localStorageMock.setItem('chosen_benchmark_source_v1', 'unknown')
    expect(getBenchmarkSnapshotMeta().benchmarkSource).toBe('default')
  })
})

// ---------------------------------------------------------------------------
// RankSnapshot backward compatibility
// ---------------------------------------------------------------------------

describe('RankSnapshot type backward compatibility', () => {
  it('a snapshot without metadata fields satisfies the type', () => {
    // TypeScript guarantees this at compile time; this test documents the intent.
    const legacy: RankSnapshot = {
      id:                'abc',
      savedAt:           '2025-01-01T00:00:00.000Z',
      totalAssetValue:   100_000,
      overallPercentile: 60,
      agePercentile:     55,
      returnPercentile:  null,
    }
    expect(legacy.benchmarkVersion).toBeUndefined()
    expect(legacy.benchmarkSource).toBeUndefined()
  })

  it('a snapshot with metadata fields includes them correctly', () => {
    const stamped: RankSnapshot = {
      id:                'def',
      savedAt:           '2026-03-29T00:00:00.000Z',
      totalAssetValue:   200_000,
      overallPercentile: 75,
      agePercentile:     70,
      returnPercentile:  65,
      benchmarkVersion:  '1.1.0',
      benchmarkSource:   'default',
    }
    expect(stamped.benchmarkVersion).toBe('1.1.0')
    expect(stamped.benchmarkSource).toBe('default')
  })
})

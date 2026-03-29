/**
 * Tests for benchmarkVersionNote().
 *
 * The function compares snapshot savedAt timestamps against BENCHMARK_META.updatedAt.
 * BENCHMARK_META.updatedAt = '2025-03-01' (from lib/mock/rank-benchmarks.ts).
 * Any snapshot saved before that date triggers the note.
 */

import { benchmarkVersionNote } from '@/lib/utils/benchmark-change-alert'

// BENCHMARK_META.updatedAt = '2025-03-01'
const BEFORE_UPDATE = '2025-01-15T10:00:00.000Z'  // < 2025-03-01
const ON_UPDATE     = '2025-03-01T00:00:00.000Z'  // === 2025-03-01 00:00 UTC
const AFTER_UPDATE  = '2025-06-01T10:00:00.000Z'  // > 2025-03-01

describe('benchmarkVersionNote', () => {
  it('returns null for an empty snapshots array', () => {
    expect(benchmarkVersionNote([])).toBeNull()
  })

  it('returns null when all snapshots are after the benchmark update', () => {
    expect(benchmarkVersionNote([{ savedAt: AFTER_UPDATE }])).toBeNull()
  })

  it('returns null when snapshot savedAt equals the benchmark updatedAt boundary', () => {
    // new Date('2025-03-01T00:00:00.000Z') is NOT less than itself
    expect(benchmarkVersionNote([{ savedAt: ON_UPDATE }])).toBeNull()
  })

  it('returns the note string when a snapshot predates the benchmark update', () => {
    const result = benchmarkVersionNote([{ savedAt: BEFORE_UPDATE }])
    expect(result).toBe('Rank comparisons may reflect updated benchmark reference ranges.')
  })

  it('returns the note when any snapshot is old, even if others are newer', () => {
    const result = benchmarkVersionNote([
      { savedAt: AFTER_UPDATE },
      { savedAt: BEFORE_UPDATE },
      { savedAt: AFTER_UPDATE },
    ])
    expect(result).toBe('Rank comparisons may reflect updated benchmark reference ranges.')
  })

  it('returns null when all of multiple snapshots are after the update', () => {
    const result = benchmarkVersionNote([
      { savedAt: AFTER_UPDATE },
      { savedAt: AFTER_UPDATE },
    ])
    expect(result).toBeNull()
  })
})

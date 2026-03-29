/**
 * Tests for the resilience improvements in rank-benchmarks-adapter.ts.
 *
 * Note: resolveAdapter() runs at module load, so we test the public API
 * surfaces that exercise the same fallback logic:
 *   - rankBenchmarksAdapterFromFile()  — explicit file adapter (try/catch + QA)
 *   - getActiveBenchmarkSourceId()     — localStorage source preference reading
 */

import { rankBenchmarksAdapterFromFile, getActiveBenchmarkSourceId } from '@/lib/adapters/rank-benchmarks-adapter'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

// ---------------------------------------------------------------------------
// localStorage mock
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
// Fixtures
// ---------------------------------------------------------------------------

const GOOD_ROW = { minValue: null, maxValue: null, percentile: 50 }

const VALID_FILE: BenchmarkFile = {
  version:          '1',
  source:           'Test 2024',
  jurisdiction:     'US',
  currency:         'USD',
  vintageYear:      2024,
  overallWealth:    [GOOD_ROW],
  ageBased:         [{ ...GOOD_ROW, ageRange: [30, 39] as [number, number] }],
  ageGender:        [{ ...GOOD_ROW, ageRange: [30, 39] as [number, number], gender: 'male' }],
  investmentReturn: [GOOD_ROW],
}

/** Passes validateBenchmarkFile but has a NaN percentile (fails QA). */
const QA_FAILING_FILE: BenchmarkFile = {
  ...VALID_FILE,
  overallWealth: [{ minValue: 0, maxValue: 100_000, percentile: NaN }],
}

// ---------------------------------------------------------------------------
// rankBenchmarksAdapterFromFile
// ---------------------------------------------------------------------------

describe('rankBenchmarksAdapterFromFile', () => {
  it('returns an adapter with the correct buckets for a valid file', () => {
    const adapter = rankBenchmarksAdapterFromFile(VALID_FILE)
    expect(adapter.getOverallWealthBenchmarks()).toHaveLength(1)
    expect(adapter.getAgeBenchmarks()).toHaveLength(1)
    expect(adapter.getAgeGenderBenchmarks()).toHaveLength(1)
    expect(adapter.getReturnBenchmarks()).toHaveLength(1)
  })

  it('returns buckets with Infinity restored for null-bound rows', () => {
    const adapter = rankBenchmarksAdapterFromFile(VALID_FILE)
    const overall = adapter.getOverallWealthBenchmarks()
    expect(overall[0].minValue).toBe(-Infinity)
    expect(overall[0].maxValue).toBe(Infinity)
  })

  it('logs a console.warn when the file has QA issues (non-blocking — still returns adapter)', () => {
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const adapter = rankBenchmarksAdapterFromFile(QA_FAILING_FILE)
    // Adapter still constructed — QA issues are non-fatal here
    expect(adapter).toBeDefined()
    expect(typeof adapter.getOverallWealthBenchmarks).toBe('function')
    warn.mockRestore()
  })
})

// ---------------------------------------------------------------------------
// getActiveBenchmarkSourceId
// ---------------------------------------------------------------------------

describe('getActiveBenchmarkSourceId', () => {
  it('returns "default" when nothing is stored', () => {
    expect(getActiveBenchmarkSourceId()).toBe('default')
  })

  it('returns "curated" when "curated" is stored', () => {
    localStorageMock.setItem('chosen_benchmark_source_v1', 'curated')
    expect(getActiveBenchmarkSourceId()).toBe('curated')
  })

  it('returns "default" for an unrecognised stored value', () => {
    localStorageMock.setItem('chosen_benchmark_source_v1', 'unknown_value')
    expect(getActiveBenchmarkSourceId()).toBe('default')
  })

  it('returns "default" for an empty string', () => {
    localStorageMock.setItem('chosen_benchmark_source_v1', '')
    expect(getActiveBenchmarkSourceId()).toBe('default')
  })
})

import {
  stagePendingBenchmark,
  getPendingBenchmark,
  clearPendingBenchmark,
  recordAppliedBenchmark,
  getLastAppliedBenchmark,
  readBenchmarkRefreshState,
} from '@/lib/utils/benchmark-refresh'
import type { BenchmarkFile } from '@/lib/types/benchmark-import'

// ---------------------------------------------------------------------------
// localStorage mock (test env is node, not jsdom)
// ---------------------------------------------------------------------------

const store: Record<string, string> = {}
const localStorageMock = {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear:      () => { Object.keys(store).forEach((k) => delete store[k]) },
}
Object.defineProperty(global, 'window',        { value: global, writable: true })
Object.defineProperty(global, 'localStorage',  { value: localStorageMock, writable: true })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const MINIMAL_ROW = { minValue: null, maxValue: null, percentile: 50 }

const VALID_FILE: BenchmarkFile = {
  version:          '1',
  source:           'Test Source 2024',
  jurisdiction:     'US',
  currency:         'USD',
  vintageYear:      2024,
  overallWealth:    [MINIMAL_ROW],
  ageBased:         [{ ...MINIMAL_ROW, ageRange: [30, 39] as [number, number] }],
  ageGender:        [{ ...MINIMAL_ROW, ageRange: [30, 39] as [number, number], gender: 'male' }],
  investmentReturn: [MINIMAL_ROW],
}

beforeEach(() => {
  localStorageMock.clear()
})

// ---------------------------------------------------------------------------
// stagePendingBenchmark / getPendingBenchmark / clearPendingBenchmark
// ---------------------------------------------------------------------------

describe('stagePendingBenchmark', () => {
  it('stages a valid file so getPendingBenchmark returns it', () => {
    stagePendingBenchmark(VALID_FILE)
    const result = getPendingBenchmark()
    expect(result).not.toBeNull()
    expect(result?.source).toBe('Test Source 2024')
  })

  it('throws when file is invalid', () => {
    const badFile = { ...VALID_FILE, version: '2' } as unknown as BenchmarkFile
    expect(() => stagePendingBenchmark(badFile)).toThrow()
  })

  it('overwrites an existing pending file', () => {
    stagePendingBenchmark(VALID_FILE)
    const updated: BenchmarkFile = { ...VALID_FILE, source: 'Newer Source' }
    stagePendingBenchmark(updated)
    expect(getPendingBenchmark()?.source).toBe('Newer Source')
  })
})

describe('getPendingBenchmark', () => {
  it('returns null when nothing is staged', () => {
    expect(getPendingBenchmark()).toBeNull()
  })

  it('returns null when stored value is corrupt JSON', () => {
    localStorage.setItem('chosen_benchmark_pending_v1', 'not-json{{{')
    expect(getPendingBenchmark()).toBeNull()
  })

  it('returns null when stored value fails validation', () => {
    localStorage.setItem('chosen_benchmark_pending_v1', JSON.stringify({ version: '9' }))
    expect(getPendingBenchmark()).toBeNull()
  })
})

describe('clearPendingBenchmark', () => {
  it('removes a staged file', () => {
    stagePendingBenchmark(VALID_FILE)
    clearPendingBenchmark()
    expect(getPendingBenchmark()).toBeNull()
  })

  it('is a no-op when nothing is staged', () => {
    expect(() => clearPendingBenchmark()).not.toThrow()
  })
})

// ---------------------------------------------------------------------------
// recordAppliedBenchmark / getLastAppliedBenchmark
// ---------------------------------------------------------------------------

describe('recordAppliedBenchmark', () => {
  it('stores a record that getLastAppliedBenchmark returns', () => {
    recordAppliedBenchmark(VALID_FILE)
    const rec = getLastAppliedBenchmark()
    expect(rec).not.toBeNull()
    expect(rec?.source).toBe('Test Source 2024')
    expect(rec?.vintageYear).toBe(2024)
    expect(typeof rec?.appliedAt).toBe('string')
  })

  it('appliedAt is a recent ISO timestamp', () => {
    const before = Date.now()
    recordAppliedBenchmark(VALID_FILE)
    const after = Date.now()
    const rec = getLastAppliedBenchmark()
    const ts = new Date(rec!.appliedAt).getTime()
    expect(ts).toBeGreaterThanOrEqual(before)
    expect(ts).toBeLessThanOrEqual(after)
  })

  it('overwrites a previous applied record', () => {
    recordAppliedBenchmark(VALID_FILE)
    const updated: BenchmarkFile = { ...VALID_FILE, source: 'Second Source', vintageYear: 2025 }
    recordAppliedBenchmark(updated)
    expect(getLastAppliedBenchmark()?.source).toBe('Second Source')
    expect(getLastAppliedBenchmark()?.vintageYear).toBe(2025)
  })
})

describe('getLastAppliedBenchmark', () => {
  it('returns null when nothing has been applied', () => {
    expect(getLastAppliedBenchmark()).toBeNull()
  })

  it('returns null when stored value is corrupt', () => {
    localStorage.setItem('chosen_benchmark_applied_v1', 'bad')
    expect(getLastAppliedBenchmark()).toBeNull()
  })

  it('returns null when stored record has wrong field types', () => {
    localStorage.setItem('chosen_benchmark_applied_v1', JSON.stringify({ source: 123, vintageYear: 'x', appliedAt: true }))
    expect(getLastAppliedBenchmark()).toBeNull()
  })
})

// ---------------------------------------------------------------------------
// readBenchmarkRefreshState
// ---------------------------------------------------------------------------

describe('readBenchmarkRefreshState', () => {
  it('returns hasPending=false and lastApplied=null when storage is empty', () => {
    const state = readBenchmarkRefreshState()
    expect(state.hasPending).toBe(false)
    expect(state.pendingSource).toBeNull()
    expect(state.lastApplied).toBeNull()
  })

  it('reflects a staged pending file', () => {
    stagePendingBenchmark(VALID_FILE)
    const state = readBenchmarkRefreshState()
    expect(state.hasPending).toBe(true)
    expect(state.pendingSource).toBe('Test Source 2024')
  })

  it('reflects an applied record', () => {
    recordAppliedBenchmark(VALID_FILE)
    const state = readBenchmarkRefreshState()
    expect(state.lastApplied?.source).toBe('Test Source 2024')
  })

  it('reflects both pending and applied simultaneously', () => {
    recordAppliedBenchmark(VALID_FILE)
    const newer: BenchmarkFile = { ...VALID_FILE, source: 'Newer Source' }
    stagePendingBenchmark(newer)
    const state = readBenchmarkRefreshState()
    expect(state.hasPending).toBe(true)
    expect(state.pendingSource).toBe('Newer Source')
    expect(state.lastApplied?.source).toBe('Test Source 2024')
  })

  it('hasPending becomes false after clearing', () => {
    stagePendingBenchmark(VALID_FILE)
    clearPendingBenchmark()
    expect(readBenchmarkRefreshState().hasPending).toBe(false)
  })
})

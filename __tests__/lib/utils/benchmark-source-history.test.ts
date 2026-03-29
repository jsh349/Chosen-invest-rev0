import { recordBenchmarkSourceSwitch, getBenchmarkSourceHistory, MAX_SOURCE_HISTORY } from '@/lib/utils/benchmark-source-history'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'

// ── localStorage mock ─────────────────────────────────────────────────────────
// Jest uses node environment (no window by default). Provide a minimal shim.

const store: Record<string, string> = {}

beforeAll(() => {
  Object.defineProperty(global, 'window', {
    value: {
      localStorage: {
        getItem:    (k: string) => store[k] ?? null,
        setItem:    (k: string, v: string) => { store[k] = v },
        removeItem: (k: string) => { delete store[k] },
      },
    },
    writable: true,
  })
})

beforeEach(() => {
  // Clear history key before each test for isolation.
  delete store[STORAGE_KEYS.benchmarkSourceHistory]
})

// ── getBenchmarkSourceHistory ─────────────────────────────────────────────────

describe('getBenchmarkSourceHistory', () => {
  it('returns an empty array when nothing has been recorded', () => {
    expect(getBenchmarkSourceHistory()).toEqual([])
  })
})

// ── recordBenchmarkSourceSwitch ───────────────────────────────────────────────

describe('recordBenchmarkSourceSwitch', () => {
  it('records a switch entry with correct from/to', () => {
    recordBenchmarkSourceSwitch('default', 'curated')
    const history = getBenchmarkSourceHistory()
    expect(history).toHaveLength(1)
    expect(history[0].from).toBe('default')
    expect(history[0].to).toBe('curated')
  })

  it('records a changedAt ISO timestamp', () => {
    recordBenchmarkSourceSwitch('default', 'curated')
    const ts = getBenchmarkSourceHistory()[0].changedAt
    expect(new Date(ts).toISOString()).toBe(ts)
  })

  it('prepends new entries (most recent first)', () => {
    recordBenchmarkSourceSwitch('default', 'curated')
    recordBenchmarkSourceSwitch('curated', 'default')
    const history = getBenchmarkSourceHistory()
    expect(history[0].from).toBe('curated')
    expect(history[0].to).toBe('default')
    expect(history[1].from).toBe('default')
    expect(history[1].to).toBe('curated')
  })

  it('is a no-op when from === to', () => {
    recordBenchmarkSourceSwitch('default', 'default')
    expect(getBenchmarkSourceHistory()).toHaveLength(0)
  })

  it(`trims to MAX_SOURCE_HISTORY (${MAX_SOURCE_HISTORY}) entries`, () => {
    for (let i = 0; i <= MAX_SOURCE_HISTORY; i++) {
      recordBenchmarkSourceSwitch(i % 2 === 0 ? 'default' : 'curated', i % 2 === 0 ? 'curated' : 'default')
    }
    expect(getBenchmarkSourceHistory()).toHaveLength(MAX_SOURCE_HISTORY)
  })

  it('keeps the most recent entries after trimming', () => {
    // Record MAX+1 switches so the oldest is dropped.
    for (let i = 0; i < MAX_SOURCE_HISTORY + 1; i++) {
      recordBenchmarkSourceSwitch('a', `b${i}`)
    }
    const history = getBenchmarkSourceHistory()
    // The oldest entry (to: 'b0') must be gone.
    expect(history.some((e) => e.to === 'b0')).toBe(false)
    // The newest entry (to: 'b{MAX}') must be first.
    expect(history[0].to).toBe(`b${MAX_SOURCE_HISTORY}`)
  })
})

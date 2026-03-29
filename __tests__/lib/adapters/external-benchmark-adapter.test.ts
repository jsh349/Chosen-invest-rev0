import { externalBenchmarkAdapter, externalAdapterStatus } from '@/lib/adapters/external-benchmark-adapter'

describe('externalBenchmarkAdapter stub', () => {
  it('reports status as not_connected', () => {
    expect(externalAdapterStatus).toBe('not_connected')
  })

  it('returns non-empty overall wealth buckets (fallback)', () => {
    expect(externalBenchmarkAdapter.getOverallWealthBenchmarks().length).toBeGreaterThan(0)
  })

  it('returns non-empty age buckets (fallback)', () => {
    expect(externalBenchmarkAdapter.getAgeBenchmarks().length).toBeGreaterThan(0)
  })

  it('returns non-empty age+gender buckets (fallback)', () => {
    expect(externalBenchmarkAdapter.getAgeGenderBenchmarks().length).toBeGreaterThan(0)
  })

  it('returns non-empty return buckets (fallback)', () => {
    expect(externalBenchmarkAdapter.getReturnBenchmarks().length).toBeGreaterThan(0)
  })

  it('conforms to RankBenchmarksAdapter interface shape', () => {
    expect(typeof externalBenchmarkAdapter.getOverallWealthBenchmarks).toBe('function')
    expect(typeof externalBenchmarkAdapter.getAgeBenchmarks).toBe('function')
    expect(typeof externalBenchmarkAdapter.getAgeGenderBenchmarks).toBe('function')
    expect(typeof externalBenchmarkAdapter.getReturnBenchmarks).toBe('function')
  })
})

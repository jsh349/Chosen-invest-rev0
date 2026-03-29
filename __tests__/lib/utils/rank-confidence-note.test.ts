import { getRankConfidenceNote } from '@/lib/utils/rank-confidence-note'

describe('getRankConfidenceNote', () => {
  // ── healthy source ───────────────────────────────────────────────────────

  it('returns null when source is healthy and not using fallback', () => {
    expect(getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'healthy' })).toBeNull()
  })

  // ── fallback active ──────────────────────────────────────────────────────

  it('returns level "low" when isUsingFallback is true (regardless of reported status)', () => {
    const result = getRankConfidenceNote({ isUsingFallback: true, benchmarkHealthStatus: 'healthy' })
    expect(result?.level).toBe('low')
  })

  it('returns level "low" when status is "fallback"', () => {
    const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'fallback' })
    expect(result?.level).toBe('low')
  })

  it('fallback note mentions built-in reference data', () => {
    const result = getRankConfidenceNote({ isUsingFallback: true, benchmarkHealthStatus: 'healthy' })
    expect(result?.text).toMatch(/built-in reference data/i)
  })

  // ── invalid source ───────────────────────────────────────────────────────

  it('returns level "low" when status is "invalid"', () => {
    const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'invalid' })
    expect(result?.level).toBe('low')
  })

  it('invalid note mentions placeholder or built-in reference', () => {
    const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'invalid' })
    expect(result?.text).toMatch(/placeholder|built-in reference/i)
  })

  // ── partial source ───────────────────────────────────────────────────────

  it('returns level "moderate" when status is "partial"', () => {
    const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'partial' })
    expect(result?.level).toBe('moderate')
  })

  it('partial note mentions rank categories', () => {
    const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: 'partial' })
    expect(result?.text).toMatch(/rank categor/i)
  })

  // ── priority: fallback wins over invalid/partial ─────────────────────────

  it('returns "low" (fallback) even when status is "partial"', () => {
    const result = getRankConfidenceNote({ isUsingFallback: true, benchmarkHealthStatus: 'partial' })
    expect(result?.level).toBe('low')
    expect(result?.text).toMatch(/built-in reference data/i)
  })

  // ── text is non-null when note is returned ───────────────────────────────

  it('text is a non-empty string for every non-null result', () => {
    const statuses = ['fallback', 'invalid', 'partial'] as const
    for (const status of statuses) {
      const result = getRankConfidenceNote({ isUsingFallback: false, benchmarkHealthStatus: status })
      expect(typeof result?.text).toBe('string')
      expect(result!.text.length).toBeGreaterThan(0)
    }
  })
})

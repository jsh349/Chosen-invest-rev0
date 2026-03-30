import { getRankConfidenceNote } from '@/lib/utils/rank-confidence-note'

describe('getRankConfidenceNote', () => {
  // ── healthy source ───────────────────────────────────────────────────────

  it('returns null when status is healthy', () => {
    expect(getRankConfidenceNote({ benchmarkHealthStatus: 'healthy' })).toBeNull()
  })

  // ── fallback ─────────────────────────────────────────────────────────────

  it('returns level "low" when status is "fallback"', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'fallback' })
    expect(result?.level).toBe('low')
  })

  it('fallback note mentions built-in reference data', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'fallback' })
    expect(result?.text).toMatch(/built-in reference data/i)
  })

  // ── invalid source ───────────────────────────────────────────────────────

  it('returns level "low" when status is "invalid"', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'invalid' })
    expect(result?.level).toBe('low')
  })

  it('invalid note mentions not yet connected or built-in reference', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'invalid' })
    expect(result?.text).toMatch(/not yet connected|built-in reference/i)
  })

  // ── partial source ───────────────────────────────────────────────────────

  it('returns level "moderate" when status is "partial"', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'partial' })
    expect(result?.level).toBe('moderate')
  })

  it('partial note mentions rank categories', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'partial' })
    expect(result?.text).toMatch(/rank categor/i)
  })

  // ── text is non-null when note is returned ───────────────────────────────

  it('text is a non-empty string for every non-null result', () => {
    const statuses = ['fallback', 'invalid', 'partial'] as const
    for (const status of statuses) {
      const result = getRankConfidenceNote({ benchmarkHealthStatus: status })
      expect(typeof result?.text).toBe('string')
      expect(result!.text.length).toBeGreaterThan(0)
    }
  })
})

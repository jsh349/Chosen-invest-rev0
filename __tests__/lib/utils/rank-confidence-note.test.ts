import { getRankConfidenceNote } from '@/lib/utils/rank-confidence-note'

describe('getRankConfidenceNote', () => {
  // ── healthy source ───────────────────────────────────────────────────────

  it('returns null when status is healthy', () => {
    expect(getRankConfidenceNote({ benchmarkHealthStatus: 'healthy' })).toBeNull()
  })

  // ── fallback ─────────────────────────────────────────────────────────────

  it('returns level "moderate" when status is "fallback"', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'fallback' })
    expect(result?.level).toBe('moderate')
  })

  it('fallback note mentions built-in ranges', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'fallback' })
    expect(result?.text).toMatch(/built-in ranges/i)
  })

  // ── invalid source ───────────────────────────────────────────────────────

  it('returns level "low" when status is "invalid"', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'invalid' })
    expect(result?.level).toBe('low')
  })

  it('invalid note mentions not connected or built-in ranges', () => {
    const result = getRankConfidenceNote({ benchmarkHealthStatus: 'invalid' })
    expect(result?.text).toMatch(/not connected|built-in ranges/i)
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

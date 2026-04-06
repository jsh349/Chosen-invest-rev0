import { composeRankReport } from '@/lib/utils/rank-report-composer'
import { ROUTES } from '@/lib/constants/routes'
import type { RankResult } from '@/lib/types/rank'

const SETTINGS_HINT = { text: 'Add birth year in Settings.', href: ROUTES.settings }

function makeRanks({
  overallPct   = 60,
  ageMissing   = false,
  returnPct    = null as number | null,
} = {}): RankResult[] {
  return [
    { type: 'overall_wealth',    label: 'Overall', percentile: overallPct, message: 'Overall message.' },
    ageMissing
      ? { type: 'age_based', label: 'Age', percentile: null, message: '', missingField: 'birth year' }
      : { type: 'age_based', label: 'Age', percentile: overallPct, message: '' },
    { type: 'age_gender',        label: 'Gender', percentile: overallPct, message: '' },
    returnPct !== null
      ? { type: 'investment_return', label: 'Return', percentile: returnPct, message: '' }
      : { type: 'investment_return', label: 'Return', percentile: null, message: '', missingField: 'annual return' },
  ]
}

describe('composeRankReport', () => {
  it('returns null when no rank has a real percentile', () => {
    const ranks: RankResult[] = [
      { type: 'overall_wealth', label: 'Overall', percentile: null, message: '' },
    ]
    expect(composeRankReport(ranks, null)).toBeNull()
  })

  it('returns a report with highlight and explanation when data is present', () => {
    const report = composeRankReport(makeRanks(), null)
    expect(report).not.toBeNull()
    expect(report!.highlight.percentile).toBe(60)
    // explanation uses getRankInterpretation, not highlight.message
    expect(report!.explanation).toBe('Above the benchmark median.')
  })

  // comparisonNote — present when nextAction is null and a gap exists
  it('includes comparisonNote when nextAction is null and a cross-rank gap exists', () => {
    // overallPct=80, returnPct=50 → gap=30 ≥ threshold → gap note fires
    const ranks = makeRanks({ overallPct: 80, returnPct: 50 })
    const report = composeRankReport(ranks, null)
    expect(report!.comparisonNote).not.toBeNull()
  })

  it('suppresses comparisonNote when nextAction is present (settings action already covers the gap)', () => {
    // Birth year missing → getRankInsight Rule 3 would fire, but nextAction also covers it
    const ranks = makeRanks({ ageMissing: true })
    const report = composeRankReport(ranks, SETTINGS_HINT)
    expect(report!.nextAction).not.toBeNull()
    expect(report!.comparisonNote).toBeNull()
  })

  it('suppresses comparisonNote even when a genuine gap exists and nextAction is present', () => {
    // Gap analysis is premature when profile is incomplete (ranks will shift)
    const ranks = makeRanks({ overallPct: 80, returnPct: 50, ageMissing: true })
    const report = composeRankReport(ranks, SETTINGS_HINT)
    expect(report!.comparisonNote).toBeNull()
  })

  // nextAction — only settings hints pass through
  it('passes nextAction through when it points to settings', () => {
    const report = composeRankReport(makeRanks(), SETTINGS_HINT)
    expect(report!.nextAction).toEqual(SETTINGS_HINT)
  })

  it('suppresses nextAction when hint points to non-settings route', () => {
    const portfolioHint = { text: 'Review portfolio.', href: ROUTES.portfolioList }
    const report = composeRankReport(makeRanks(), portfolioHint)
    expect(report!.nextAction).toBeNull()
  })

  it('returns null nextAction when no hint is provided', () => {
    const report = composeRankReport(makeRanks(), null)
    expect(report!.nextAction).toBeNull()
  })
})

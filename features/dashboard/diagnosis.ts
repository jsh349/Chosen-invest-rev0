/**
 * Health-card scoring specification — Phase 2 MVP formulas.
 *
 * All scores are integers in [0, 100]. statusFromScore maps:
 *   score >= 70  → 'good'
 *   score >= 50  → 'warning'
 *   score <  50  → 'attention'
 *
 * ── DIVERSIFICATION ──────────────────────────────────────────────────
 *   Input:  categoryCount = number of distinct asset categories
 *   Score:  min(100, categoryCount × 16)
 *   Result: 0 categories → 0 (attention)
 *            1 category  → 16 (attention)
 *            2 categories → 32 (attention)
 *            3 categories → 48 (attention)   ← lowest warning threshold
 *            4 categories → 64 (warning)
 *           ≥5 categories → ≥80 (good at 5)
 *   Rationale: each category adds 16 points; 5+ categories = well spread.
 *
 * ── CONCENTRATION RISK ───────────────────────────────────────────────
 *   Input:  topPct = percentage of portfolio in the single largest category
 *   Score:  topPct > 60% → 30 (attention)
 *           topPct > 40% → 55 (warning)
 *           topPct ≤ 40% → 80 (good)
 *   Rationale: >60% in one category is high concentration risk;
 *              40–60% is notable; ≤40% is healthy diversification.
 *
 * ── LIQUIDITY ────────────────────────────────────────────────────────
 *   Input:  cashPct = percentage of portfolio in 'cash' category
 *   Score:  cashPct >= 10% → 80 (good)
 *           cashPct >=  5% → 55 (warning)
 *           cashPct <   5% → 35 (attention)
 *   Rationale: 10%+ cash covers emergency buffer; <5% is illiquid risk.
 *
 * ── GROWTH BALANCE ───────────────────────────────────────────────────
 *   Input:  hasRetirement = any 'retirement' category asset exists
 *           hasGrowth     = any 'stock' or 'etf' category asset exists
 *   Score:  both present     → 80 (good)
 *           one present      → 60 (warning)
 *           neither present  → 40 (attention)
 *   Rationale: a healthy portfolio has both growth assets and
 *              long-term retirement savings.
 *
 * ── EMPTY / ZERO-TOTAL GUARD ─────────────────────────────────────────
 *   When assetCount === 0 OR totalAssetValue === 0, all four cards
 *   return score 0 / status 'attention' / generic placeholder message.
 *   This prevents NaN, Infinity, and misleading grades on empty data.
 */

import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { FinancialHealthCard, HealthStatus } from '@/lib/types/health-card'

/**
 * Shared threshold constants — imported by summary-generator.ts to prevent drift.
 * Changing these values here automatically propagates to the AI summary.
 */
export const CONCENTRATION_THRESHOLDS = {
  attention: 60, // topPct > 60  → high concentration risk
  warning:   40, // topPct > 40  → single-category dominance
} as const

export const LIQUIDITY_THRESHOLDS = {
  good:    10, // cashPct >= 10 → good buffer
  warning:  5, // cashPct >=  5 → modest buffer
} as const

// score >= 70 → 'good' | score >= 50 → 'warning' | score < 50 → 'attention'
function statusFromScore(score: number): HealthStatus {
  if (score >= 70) return 'good'
  if (score >= 50) return 'warning'
  return 'attention'
}

export function generateHealthCards(summary: PortfolioSummary): FinancialHealthCard[] {
  const now = new Date().toISOString()
  const { categoryBreakdown, totalAssetValue, assetCount } = summary

  // Guard: empty portfolio or all-zero values produce undefined scores and
  // misleading messages (e.g. "Only 0 category", "Cash is under 5%").
  // Return stable, neutral cards instead of running the scoring logic.
  if (assetCount === 0 || totalAssetValue === 0) {
    const placeholder = (key: string, title: string): FinancialHealthCard => ({
      key,
      title,
      status: 'attention',
      message: 'Add assets to see this analysis.',
      score: 0,
      generatedAt: now,
    })
    return [
      placeholder('diversification', 'Diversification'),
      placeholder('concentration', 'Concentration Risk'),
      placeholder('liquidity', 'Liquidity'),
      placeholder('balance', 'Growth Balance'),
    ]
  }

  // Diversification: min(100, categoryCount × 16) → good ≥5, warning 4, attention ≤3
  const categoryCount = categoryBreakdown.length
  const diversificationScore = Math.min(100, categoryCount * 16)
  const diversificationMessage =
    categoryCount >= 5
      ? `Assets spread across ${categoryCount} categories. Solid foundation.`
      : categoryCount >= 3
      ? `${categoryCount} asset categories — consider broadening exposure.`
      : `Only ${categoryCount} ${categoryCount === 1 ? 'category' : 'categories'}. Portfolio needs more diversification.`

  // Concentration: topPct >60% → 30 (attention), >40% → 55 (warning), ≤40% → 80 (good)
  const topSlice = categoryBreakdown[0]
  const topPct = topSlice?.percentage ?? 0
  const concentrationScore = topPct > 60 ? 30 : topPct > 40 ? 55 : 80
  const concentrationMessage =
    !topSlice
      ? 'Add assets to see concentration analysis.'
      : topPct > 60
      ? `${topSlice.label} is ${topPct.toFixed(0)}% of total. High concentration risk.`
      : topPct > 40
      ? `${topSlice.label} is ${topPct.toFixed(0)}% of total. Single-asset dominance to watch.`
      : 'No single category dominates. Concentration looks healthy.'

  // Liquidity: cashPct ≥10% → 80 (good), ≥5% → 55 (warning), <5% → 35 (attention)
  const cashSlice = categoryBreakdown.find((s) => s.category === 'cash')
  const cashPct = cashSlice?.percentage ?? 0
  const liquidityScore = cashPct >= 10 ? 80 : cashPct >= 5 ? 55 : 35
  const liquidityMessage =
    cashPct >= 10
      ? `Cash is ${cashPct.toFixed(0)}% of portfolio. Good liquidity buffer.`
      : cashPct >= 5
      ? `Cash is ${cashPct.toFixed(0)}%. Consider building a stronger emergency fund.`
      : `Cash is under 5%. Low liquidity could be a risk in an emergency.`

  // Balance: both retirement+growth → 80 (good), one only → 60 (warning), neither → 40 (attention)
  const hasRetirement = categoryBreakdown.some((s) => s.category === 'retirement')
  const hasGrowth = categoryBreakdown.some(
    (s) => s.category === 'stock' || s.category === 'etf'
  )
  const balanceScore = hasRetirement && hasGrowth ? 80 : hasGrowth || hasRetirement ? 60 : 40
  const balanceMessage =
    hasRetirement && hasGrowth
      ? 'Mix of growth assets and stable holdings looks healthy.'
      : hasGrowth
      ? 'Good growth exposure. Adding retirement savings would improve long-term balance.'
      : hasRetirement
      ? 'Retirement savings present. Adding growth assets would improve returns.'
      : 'Portfolio lacks both growth and retirement assets. Review allocation priorities.'

  return [
    {
      key: 'diversification',
      title: 'Diversification',
      status: statusFromScore(diversificationScore),
      message: diversificationMessage,
      score: diversificationScore,
      generatedAt: now,
    },
    {
      key: 'concentration',
      title: 'Concentration Risk',
      status: statusFromScore(concentrationScore),
      message: concentrationMessage,
      score: concentrationScore,
      generatedAt: now,
    },
    {
      key: 'liquidity',
      title: 'Liquidity',
      status: statusFromScore(liquidityScore),
      message: liquidityMessage,
      score: liquidityScore,
      generatedAt: now,
    },
    {
      key: 'balance',
      title: 'Growth Balance',
      status: statusFromScore(balanceScore),
      message: balanceMessage,
      score: balanceScore,
      generatedAt: now,
    },
  ]
}

import Link from 'next/link'
import type { RankHint } from '@/lib/utils/rank-next-hint'
import { ROUTES } from '@/lib/constants/routes'

function linkLabel(href: string): string {
  if (href === ROUTES.portfolioList || href === ROUTES.portfolioInput) return 'Portfolio →'
  if (href === ROUTES.goals) return 'Goals →'
  return 'Settings →'
}

type Props = {
  nextHint:             RankHint | null
  rankInsight:          string | null
  rankGoalInsight:      string | null
  rankAllocationInsight: string | null
}

/**
 * Grouped explanation block for rank detail.
 *
 * Shows at most two lines from the available explanation layers,
 * using a deterministic priority:
 *   Slot 1: nextHint → rankInsight → rankGoalInsight → rankAllocationInsight
 *   Slot 2: next available after slot 1's pick (only shown when slot 1 is filled)
 *
 * Renders nothing when all inputs are null.
 */
export function RankDetailExplanationBlock({ nextHint, rankInsight, rankGoalInsight, rankAllocationInsight }: Props) {
  // Build a flat ordered list of candidate items
  const candidates: Array<{ key: string; text: string; href?: string }> = []
  if (nextHint)              candidates.push({ key: 'hint',       text: nextHint.text,        href: nextHint.href })
  if (rankInsight)           candidates.push({ key: 'insight',    text: rankInsight })
  if (rankGoalInsight)       candidates.push({ key: 'goal',       text: rankGoalInsight })
  if (rankAllocationInsight) candidates.push({ key: 'allocation', text: rankAllocationInsight })

  // Show at most 2 items, balanced: at most one action and one interpretation.
  // Trust order: interpretation before action — the user should understand what
  // the rank means before being told what to do about it.
  //   Slot 1: rankInsight (what it means) — when available alongside a hint
  //   Slot 2: nextHint   (what to do)     — follows the interpretation
  // When no insight is present, the hint fills slot 1 alone.
  // When no hint is present, the existing order is preserved (interpretation →
  // bridge insight).
  let visible: typeof candidates
  if (candidates[0]?.key === 'hint') {
    // Pair the hint with the first available interpretation (insight, goal, or
    // allocation bridge) so the user reads context before the action link.
    // Previously only 'insight' was checked — goal/allocation insights were
    // silently dropped when nextHint was present.
    const interpretation = candidates.find((c) => c.key !== 'hint') ?? null
    // Interpretation before hint: context first, then action.
    visible = interpretation ? [interpretation, candidates[0]] : [candidates[0]]
  } else {
    visible = candidates.slice(0, 2)
  }
  if (visible.length === 0) return null

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
      {visible.map((item) => (
        <div key={item.key} className="flex items-start justify-between gap-3">
          <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
          {item.href && (
            <Link
              href={item.href}
              className="shrink-0 text-xs text-brand-300 hover:text-brand-200 transition-colors"
            >
              {linkLabel(item.href)}
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

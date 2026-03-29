import Link from 'next/link'
import type { RankHint } from '@/lib/utils/rank-next-hint'

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

  // Show at most 2 items
  const visible = candidates.slice(0, 2)
  if (visible.length === 0) return null

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-3 space-y-2.5">
      {visible.map((item) => (
        <div key={item.key} className="flex items-start justify-between gap-3">
          <p className="text-xs text-gray-400 leading-relaxed">{item.text}</p>
          {item.href && (
            <Link
              href={item.href}
              className="shrink-0 text-xs text-brand-400 hover:text-brand-300 transition-colors"
            >
              Settings →
            </Link>
          )}
        </div>
      ))}
    </div>
  )
}

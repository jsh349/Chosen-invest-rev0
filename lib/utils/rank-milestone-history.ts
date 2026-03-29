import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'
import type { RankResult } from '@/lib/types/rank'
import { getRankBadges } from '@/lib/utils/rank-badges'

export type MilestoneEntry = {
  id: string
  label: string
  description: string
  /** ISO string of the snapshot in which this badge was first recorded. */
  firstSeenAt: string
}

/** Build minimal RankResult stubs from stored percentiles for badge derivation. */
function snapshotToRanks(s: RankSnapshot): RankResult[] {
  return [
    { type: 'overall_wealth',    label: 'Overall', percentile: s.overallPercentile, message: '' },
    { type: 'age_based',         label: 'Age',     percentile: s.agePercentile,     message: '' },
    { type: 'investment_return', label: 'Return',  percentile: s.returnPercentile,  message: '' },
  ]
}

/**
 * Scans all stored rank snapshots (oldest → newest) and returns the first date
 * each badge was recorded. Result is sorted most-recently-achieved first.
 *
 * Returns an empty array when no snapshots exist or no badges have been earned.
 */
export function buildMilestoneHistory(snapshots: RankSnapshot[]): MilestoneEntry[] {
  if (snapshots.length === 0) return []

  const seen = new Map<string, MilestoneEntry>()

  // Snapshots are stored newest-first; scan oldest-first to find first appearance.
  for (const snapshot of [...snapshots].reverse()) {
    const badges = getRankBadges(snapshotToRanks(snapshot))
    for (const badge of badges) {
      if (!seen.has(badge.id)) {
        seen.set(badge.id, {
          id:          badge.id,
          label:       badge.label,
          description: badge.description,
          firstSeenAt: snapshot.savedAt,
        })
      }
    }
  }

  // Most recently achieved first
  return Array.from(seen.values()).sort(
    (a, b) => b.firstSeenAt.localeCompare(a.firstSeenAt),
  )
}

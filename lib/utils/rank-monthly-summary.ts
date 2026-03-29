import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

export type MonthlySummary = {
  /** Latest overall percentile, or null if unavailable */
  currentOverall: number | null
  /** Latest return percentile, or null if unavailable */
  currentReturn: number | null
  /** Overall percentile change vs comparison snapshot (positive = improved). Null if no comparison. */
  delta: number | null
  /** Return percentile change vs comparison snapshot. Null if no comparison or either value missing. */
  returnDelta: number | null
  /** One-line status note */
  note: string
}

/**
 * Derive a compact monthly summary from stored rank snapshots.
 *
 * Comparison target: the most recent snapshot saved in a different calendar
 * month than the latest. Falls back to snapshots[1] when no cross-month
 * snapshot exists yet.
 *
 * Returns null when there are no snapshots at all.
 */
export function buildMonthlySummary(snapshots: RankSnapshot[]): MonthlySummary | null {
  if (snapshots.length === 0) return null

  const current      = snapshots[0]
  // Assumes savedAt is an ISO 8601 string (e.g. "2026-03-20T12:00:00Z"). useRankSnapshots
  // guarantees this via new Date().toISOString(). Any external snapshot source must match.
  const currentMonth = current.savedAt.slice(0, 7)   // "YYYY-MM"

  // Prefer a snapshot from a prior calendar month; otherwise use next available
  const previous =
    snapshots.find((s) => s.savedAt.slice(0, 7) !== currentMonth) ??
    snapshots[1]

  const currentOverall = current.overallPercentile
  const currentReturn  = current.returnPercentile ?? null

  if (!previous) {
    return {
      currentOverall,
      currentReturn,
      delta: null,
      returnDelta: null,
      note: 'First recorded visit — check back after your next session for a change indicator.',
    }
  }

  const delta =
    currentOverall !== null && previous.overallPercentile !== null
      ? currentOverall - previous.overallPercentile
      : null

  const returnDelta =
    current.returnPercentile !== null && previous.returnPercentile !== null
      ? current.returnPercentile - previous.returnPercentile
      : null

  let note: string
  if (delta === null) {
    note = 'Rank comparison unavailable — overall rank data is incomplete.'
  } else if (delta > 0) {
    note = `Overall rank improved by ${delta} percentile point${delta === 1 ? '' : 's'}.`
  } else if (delta < 0) {
    note = `Overall rank declined by ${Math.abs(delta)} percentile point${Math.abs(delta) === 1 ? '' : 's'}.`
  } else {
    note = 'Overall rank unchanged from last comparison.'
  }

  return { currentOverall, currentReturn, delta, returnDelta, note }
}

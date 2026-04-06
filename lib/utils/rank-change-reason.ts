import type { RankSnapshot } from '@/lib/hooks/use-rank-snapshots'

/**
 * Returns a brief, cautious hint about the likely cause of a rank change
 * between two snapshots. Returns null when no clear single reason is
 * detectable — callers should show nothing in that case.
 *
 * Priority order (first match wins — most non-obvious reason first):
 *  1. Benchmark source changed   — non-obvious, high value to surface
 *  2. Benchmark version updated  — non-obvious
 *  3. Profile comparison expanded — new rank category became available
 *  4. Asset total changed        — common, lowest priority
 *
 * Rules for benchmark fields: both sides must be defined for the rule to
 * apply — older snapshots without these fields safely skip those checks.
 */
export function getRankChangeReason(
  current:  RankSnapshot,
  previous: RankSnapshot,
): string | null {
  // 1. Benchmark source changed
  if (
    current.benchmarkSource  &&
    previous.benchmarkSource &&
    current.benchmarkSource !== previous.benchmarkSource
  ) {
    return 'Benchmark source changed since last comparison.'
  }

  // 2. Benchmark version updated (same source, different version)
  if (
    current.benchmarkVersion  &&
    previous.benchmarkVersion &&
    current.benchmarkVersion !== previous.benchmarkVersion
  ) {
    return 'Benchmark data was updated since last comparison.'
  }

  // 3. Profile comparison expanded (new rank category unlocked)
  const profileExpanded =
    (previous.agePercentile    === null && current.agePercentile    !== null) ||
    (previous.returnPercentile === null && current.returnPercentile !== null)
  if (profileExpanded) {
    return 'A new rank category became available since last comparison.'
  }

  // 4. Asset total changed
  if (current.totalAssetValue !== previous.totalAssetValue) {
    return 'Asset total changed since last comparison.'
  }

  return null
}

/**
 * Returns a short, non-technical note identifying the active benchmark source.
 * Intended as the lowest-priority slot in the rank summary strip —
 * only shown when no confidenceNote or inputExplanation is active.
 *
 * Returns null when:
 *   - the source is a stub / not yet connected (confidenceNote covers it)
 *   - the source is 'default' (baseline; no note needed)
 *   - the source id is unrecognised
 */
export function getRankSourceExplanation(
  sourceId: string,
  isFallbackOnly: boolean,
): string | null {
  // Stub / not connected — confidenceNote already surfaces this state
  if (isFallbackOnly) return null

  // Curated source is already identified by the Benchmark chip in the summary
  // strip — a separate note here would duplicate that label. Return null so
  // the note slot is clean when the source is healthy and the profile is complete.

  // Default source is the baseline — no note needed in the confidence slot.
  return null
}

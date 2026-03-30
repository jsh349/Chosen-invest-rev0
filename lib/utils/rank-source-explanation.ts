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

  if (sourceId === 'curated') {
    return 'Compared against your curated benchmark dataset.'
  }

  // Default source is the baseline — no note needed in the confidence slot.
  return null
}

/**
 * Returns a short, non-technical note identifying the active benchmark source.
 * Intended as the lowest-priority slot in the rank summary strip —
 * only shown when no confidenceNote or inputExplanation is active.
 *
 * Returns null when:
 *   - the source is a stub / not yet connected (confidenceNote covers it)
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

  if (sourceId === 'default') {
    return 'Compared against built-in reference benchmarks.'
  }

  return null
}

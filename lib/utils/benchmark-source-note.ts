/**
 * Returns a short informational note about the current benchmark source state,
 * intended for the rank methodology section.
 *
 * Returns null when no note is needed (healthy local source, no stub active).
 * Callers must guard on null — nothing should render when null is returned.
 */
export function getBenchmarkSourceNote(
  sourceId: string,
  isFallbackOnly: boolean,
): string | null {
  // External source slot exists in the system but is not yet connected to a live feed.
  // isFallbackOnly is always true for 'external' until real data is wired up.
  if (sourceId === 'external' && isFallbackOnly) {
    return 'Live source not yet active — built-in reference ranges in use.'
  }

  // All other states (default, curated healthy, curated fallback) are already
  // communicated by existing methodology strip labels and the fallback amber note.
  return null
}

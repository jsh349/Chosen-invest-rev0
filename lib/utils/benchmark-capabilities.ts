/**
 * Capability flags for a benchmark source.
 *
 * These describe what rank categories a source is designed to support.
 * They do NOT guarantee that the source currently has data — use isFallbackOnly
 * to distinguish a stub or degraded source from a fully operational one.
 */
export type BenchmarkSourceCapabilities = {
  /** Source provides overall (national) wealth percentile buckets. */
  supportsWealth:    boolean
  /** Source provides age-segmented wealth percentile buckets. */
  supportsAge:       boolean
  /** Source provides age + gender segmented wealth percentile buckets. */
  supportsAgeGender: boolean
  /** Source provides investment return percentile buckets. */
  supportsReturn:    boolean
  /**
   * True when the source does not yet have its own real data and falls back
   * to built-in local data instead. Rank output is still correct; this flag
   * is useful for transparency notes or future activation gates.
   */
  isFallbackOnly:    boolean
}

type KnownSourceId = 'default' | 'curated' | 'external'

const CAPABILITIES: Record<KnownSourceId, BenchmarkSourceCapabilities> = {
  default: {
    supportsWealth:    true,
    supportsAge:       true,
    supportsAgeGender: true,
    supportsReturn:    true,
    isFallbackOnly:    false,
  },
  curated: {
    supportsWealth:    true,
    supportsAge:       true,
    supportsAgeGender: true,
    supportsReturn:    true,
    isFallbackOnly:    false,
  },
  external: {
    supportsWealth:    true,
    supportsAge:       true,
    supportsAgeGender: true,
    supportsReturn:    true,
    // Stub only — currently returns local fallback data, not a real external feed.
    isFallbackOnly:    true,
  },
}

/**
 * Safe fallback for any unrecognised source ID.
 * Marks isFallbackOnly so callers know the capabilities are assumed, not confirmed.
 */
const UNKNOWN_CAPABILITIES: BenchmarkSourceCapabilities = {
  supportsWealth:    true,
  supportsAge:       true,
  supportsAgeGender: true,
  supportsReturn:    true,
  isFallbackOnly:    true,
}

/**
 * Returns the capability flags for a given benchmark source ID.
 * Falls back to UNKNOWN_CAPABILITIES for any unrecognised ID — never throws.
 */
export function getBenchmarkCapabilities(sourceId: string): BenchmarkSourceCapabilities {
  return CAPABILITIES[sourceId as KnownSourceId] ?? UNKNOWN_CAPABILITIES
}

/**
 * Returns a short note listing which rank categories are not supported by the
 * given capability set, or null when all categories are supported.
 *
 * Returns null for fallback-only sources — the fallback/invalid confidence note
 * already covers that state and these sources don't declare real coverage gaps.
 *
 * Intended for the internal methodology/diagnostics area only.
 */
export function getPartialCoverageNote(caps: BenchmarkSourceCapabilities): string | null {
  if (caps.isFallbackOnly) return null

  const missing: string[] = []
  if (!caps.supportsWealth)    missing.push('overall wealth')
  if (!caps.supportsAge)       missing.push('age-based')
  if (!caps.supportsAgeGender) missing.push('age & gender')
  if (!caps.supportsReturn)    missing.push('investment return')

  if (missing.length === 0) return null

  return `Not available from this source: ${missing.join(', ')}.`
}

import type { BenchmarkSourceCapabilities } from '@/lib/utils/benchmark-capabilities'

export type BenchmarkHealthStatus = 'healthy' | 'partial' | 'fallback' | 'invalid'

export type BenchmarkHealthResult = {
  status: BenchmarkHealthStatus
  /** One-line human-readable explanation, for internal display only. */
  note: string
}

/**
 * Derives a simple health status for the active benchmark source from
 * already-available local metadata — no external calls, no new state.
 *
 * Rules (evaluated in priority order):
 *  fallback — preferred source was selected but could not be loaded;
 *             rank results are still correct (built-in data is used).
 *  invalid  — source is a stub that does not yet provide real data.
 *  partial  — source does not support all four rank categories.
 *  healthy  — source loaded, not a stub, all categories supported.
 */
export function getBenchmarkHealthStatus(
  caps: BenchmarkSourceCapabilities,
  isUsingFallback: boolean,
): BenchmarkHealthResult {
  if (isUsingFallback) {
    return {
      status: 'fallback',
      note: 'Preferred source could not be loaded — built-in data is active.',
    }
  }

  if (caps.isFallbackOnly) {
    return {
      status: 'invalid',
      note: 'Source is a stub with no real data.',
    }
  }

  const allSupported =
    caps.supportsWealth &&
    caps.supportsAge &&
    caps.supportsAgeGender &&
    caps.supportsReturn

  if (!allSupported) {
    return {
      status: 'partial',
      note: 'Not all categories supported.',
    }
  }

  return {
    status: 'healthy',
    note: 'All rank categories supported.',
  }
}

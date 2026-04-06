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
    // Note omitted — "Fallback: active" row and Active source label already cover this.
    return { status: 'fallback', note: '' }
  }

  if (caps.isFallbackOnly) {
    // Note states what's active (built-in data), not just what's absent.
    return { status: 'invalid', note: 'using built-in' }
  }

  const allSupported =
    caps.supportsWealth &&
    caps.supportsAge &&
    caps.supportsAgeGender &&
    caps.supportsReturn

  if (!allSupported) {
    // Note omitted — Capabilities row shows exactly which categories are missing.
    return { status: 'partial', note: '' }
  }

  // Note omitted — "healthy" is self-explanatory and Capabilities row confirms.
  return { status: 'healthy', note: '' }
}

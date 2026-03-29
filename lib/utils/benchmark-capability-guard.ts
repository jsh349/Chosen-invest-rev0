import type { RankResult } from '@/lib/types/rank'

/**
 * Returns a safe "not supported" RankResult when a capability flag is false,
 * or null to signal that normal rank computation should proceed.
 *
 * Accepts the flag value directly so callers remain pure and testable
 * without requiring localStorage or adapter mocks.
 *
 * Usage:
 *   const guard = capabilityGuardedResult(caps.supportsAge, 'age_based', 'Age-Based Rank')
 *   if (guard) return guard
 */
export function capabilityGuardedResult(
  supported: boolean,
  type: RankResult['type'],
  label: string,
): RankResult | null {
  if (supported) return null
  return {
    type,
    label,
    percentile: null,
    message: 'This rank category is not available for the current benchmark source.',
  }
}

/**
 * Lightweight rank review trigger.
 *
 * Detects when rank-relevant inputs have changed since the user last
 * acknowledged the rank page, and exposes a dismissable prompt.
 *
 * Change detection tracks:
 *   - Total asset value (rounded to nearest $1k to avoid micro-fluctuations)
 *   - Birth year, gender, annual return estimate (profile completeness)
 *   - Benchmark version + active source
 *
 * No scheduling, no notifications, no backend.
 */

import { STORAGE_KEYS } from '@/lib/constants/storage-keys'

export type RankReviewInputs = {
  totalAssetValue:  number
  birthYear?:       number
  gender?:          string
  annualReturnPct?: number
  /** Pass getBenchmarkFingerprint() from benchmark-change-alert */
  benchmarkFingerprint: string
}

/**
 * Returns a stable string that uniquely represents the current rank-relevant state.
 * Asset value is bucketed (nearest $1k) so minor fluctuations don't trigger a review.
 */
export function getRankReviewFingerprint(inputs: RankReviewInputs): string {
  const assetBucket = Math.round(inputs.totalAssetValue / 1000)
  return [
    assetBucket,
    inputs.birthYear       ?? '',
    inputs.gender          ?? '',
    inputs.annualReturnPct ?? '',
    inputs.benchmarkFingerprint,
  ].join('::')
}

/**
 * Returns true when the stored fingerprint exists and differs from the current one.
 *
 * On the very first call (no stored fingerprint), writes the current fingerprint
 * as the baseline and returns false — so new users never see a spurious prompt.
 *
 * SSR-safe: returns false on the server.
 */
export function checkRankReviewDue(currentFingerprint: string): boolean {
  if (typeof window === 'undefined') return false
  try {
    const stored = localStorage.getItem(STORAGE_KEYS.rankReviewSeen)
    if (stored === null) {
      // First engagement — set baseline silently, no prompt yet
      localStorage.setItem(STORAGE_KEYS.rankReviewSeen, currentFingerprint)
      return false
    }
    return stored !== currentFingerprint
  } catch {
    return false
  }
}

/**
 * Persists the current fingerprint, suppressing the review prompt until
 * inputs change again.
 *
 * SSR-safe: no-op on the server.
 */
export function dismissRankReview(currentFingerprint: string): void {
  if (typeof window === 'undefined') return
  try {
    localStorage.setItem(STORAGE_KEYS.rankReviewSeen, currentFingerprint)
  } catch { /* ignore quota / security errors */ }
}

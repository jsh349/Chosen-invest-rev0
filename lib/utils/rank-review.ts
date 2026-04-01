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
 * Cooldown: after an explicit dismiss, the prompt is suppressed for
 * RANK_REVIEW_COOLDOWN_MS even if the fingerprint changes slightly.
 * The cooldown only starts on dismiss — the initial baseline write has none.
 *
 * No scheduling, no notifications, no backend.
 */

import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readScalar, writeScalar } from '@/lib/utils/local-storage'

/** After dismissal, the review prompt is suppressed for this many ms. */
export const RANK_REVIEW_COOLDOWN_MS = 14 * 24 * 60 * 60 * 1000 // 14 days

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
 * Returns true when the stored fingerprint exists and differs from the current one,
 * AND the post-dismiss cooldown window has elapsed (or no dismiss has occurred yet).
 *
 * Priority order:
 *  1. No stored fp           → write baseline (no cooldown), return false
 *  2. fp matches stored      → return false
 *  3. fp differs, no cooldown key → return true  (initial baseline, no prior dismiss)
 *  4. fp differs, cooldown active  → return false (suppressed within window)
 *  5. fp differs, cooldown expired → return true
 *
 * SSR-safe: returns false on the server.
 */
export function checkRankReviewDue(currentFingerprint: string): boolean {
  if (typeof window === 'undefined') return false
  const stored = readScalar(STORAGE_KEYS.rankReviewSeen)
  if (stored === null) {
    // First engagement — set baseline silently, no prompt yet
    writeScalar(STORAGE_KEYS.rankReviewSeen, currentFingerprint)
    return false
  }
  if (stored === currentFingerprint) return false
  // Fingerprint changed — check whether a post-dismiss cooldown is active
  const rawCooldown = readScalar(STORAGE_KEYS.rankReviewCooldown)
  if (rawCooldown !== null) {
    const dismissedAt = parseInt(rawCooldown, 10)
    if (Number.isFinite(dismissedAt) && Date.now() - dismissedAt < RANK_REVIEW_COOLDOWN_MS) {
      return false // within cooldown window
    }
  }
  return true
}

/**
 * Persists the current fingerprint and starts the cooldown timer.
 * After this call, the review prompt is suppressed for RANK_REVIEW_COOLDOWN_MS
 * even if the fingerprint changes slightly.
 *
 * SSR-safe: no-op on the server.
 */
export function dismissRankReview(currentFingerprint: string): void {
  if (typeof window === 'undefined') return
  writeScalar(STORAGE_KEYS.rankReviewSeen, currentFingerprint)
  writeScalar(STORAGE_KEYS.rankReviewCooldown, String(Date.now()))
}

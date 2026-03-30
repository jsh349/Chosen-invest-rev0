import {
  getRankReviewFingerprint,
  checkRankReviewDue,
  dismissRankReview,
  RANK_REVIEW_COOLDOWN_MS,
  type RankReviewInputs,
} from '@/lib/utils/rank-review'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'

// ---------------------------------------------------------------------------
// localStorage mock (test env is node)
// ---------------------------------------------------------------------------

const store: Record<string, string> = {}
const localStorageMock = {
  getItem:    (k: string) => store[k] ?? null,
  setItem:    (k: string, v: string) => { store[k] = v },
  removeItem: (k: string) => { delete store[k] },
  clear:      () => { Object.keys(store).forEach((k) => delete store[k]) },
}
Object.defineProperty(global, 'window',       { value: global, writable: true })
Object.defineProperty(global, 'localStorage', { value: localStorageMock, writable: true })

beforeEach(() => { localStorageMock.clear() })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

const BASE_INPUTS: RankReviewInputs = {
  totalAssetValue:      100_000,
  birthYear:            1985,
  gender:               'male',
  annualReturnPct:      7,
  benchmarkFingerprint: '1.1.0::default',
}

function fp(overrides: Partial<RankReviewInputs> = {}): string {
  return getRankReviewFingerprint({ ...BASE_INPUTS, ...overrides })
}

// ---------------------------------------------------------------------------
// getRankReviewFingerprint
// ---------------------------------------------------------------------------

describe('getRankReviewFingerprint', () => {
  it('returns a non-empty string', () => {
    expect(fp().length).toBeGreaterThan(0)
  })

  it('same inputs produce the same fingerprint', () => {
    expect(fp()).toBe(fp())
  })

  it('different birthYear produces a different fingerprint', () => {
    expect(fp({ birthYear: 1990 })).not.toBe(fp({ birthYear: 1985 }))
  })

  it('different gender produces a different fingerprint', () => {
    expect(fp({ gender: 'female' })).not.toBe(fp({ gender: 'male' }))
  })

  it('different annualReturnPct produces a different fingerprint', () => {
    expect(fp({ annualReturnPct: 10 })).not.toBe(fp({ annualReturnPct: 7 }))
  })

  it('different benchmarkFingerprint produces a different fingerprint', () => {
    expect(fp({ benchmarkFingerprint: '2.0.0::curated' })).not.toBe(fp({ benchmarkFingerprint: '1.1.0::default' }))
  })

  it('asset values within the same $1k bucket produce the same fingerprint', () => {
    // 100_000 and 100_499 both round to bucket 100
    const a = getRankReviewFingerprint({ ...BASE_INPUTS, totalAssetValue: 100_000 })
    const b = getRankReviewFingerprint({ ...BASE_INPUTS, totalAssetValue: 100_499 })
    expect(a).toBe(b)
  })

  it('asset values in different $1k buckets produce different fingerprints', () => {
    const a = getRankReviewFingerprint({ ...BASE_INPUTS, totalAssetValue: 100_000 })
    const b = getRankReviewFingerprint({ ...BASE_INPUTS, totalAssetValue: 110_000 })
    expect(a).not.toBe(b)
  })

  it('handles undefined optional fields gracefully', () => {
    const result = getRankReviewFingerprint({
      totalAssetValue:      50_000,
      benchmarkFingerprint: '1.1.0::default',
    })
    expect(typeof result).toBe('string')
    expect(result.length).toBeGreaterThan(0)
  })
})

// ---------------------------------------------------------------------------
// checkRankReviewDue
// ---------------------------------------------------------------------------

describe('checkRankReviewDue', () => {
  it('returns false on first call and writes baseline', () => {
    const fingerprint = fp()
    expect(checkRankReviewDue(fingerprint)).toBe(false)
    expect(localStorageMock.getItem('chosen_rank_review_seen_v1')).toBe(fingerprint)
  })

  it('returns false when fingerprint matches stored baseline', () => {
    const fingerprint = fp()
    checkRankReviewDue(fingerprint) // establish baseline
    expect(checkRankReviewDue(fingerprint)).toBe(false)
  })

  it('returns true when fingerprint differs from stored baseline', () => {
    const original = fp()
    checkRankReviewDue(original) // establish baseline
    const changed = fp({ birthYear: 1990 })
    expect(checkRankReviewDue(changed)).toBe(true)
  })

  it('returns false after dismissRankReview updates the stored fingerprint', () => {
    const original = fp()
    checkRankReviewDue(original)
    const changed = fp({ birthYear: 1990 })
    expect(checkRankReviewDue(changed)).toBe(true)
    dismissRankReview(changed)
    expect(checkRankReviewDue(changed)).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// dismissRankReview
// ---------------------------------------------------------------------------

describe('dismissRankReview', () => {
  it('writes the fingerprint to storage', () => {
    const fingerprint = fp()
    dismissRankReview(fingerprint)
    expect(localStorageMock.getItem('chosen_rank_review_seen_v1')).toBe(fingerprint)
  })

  it('overwrites a previously stored fingerprint', () => {
    dismissRankReview(fp({ birthYear: 1985 }))
    const newer = fp({ birthYear: 1990 })
    dismissRankReview(newer)
    expect(localStorageMock.getItem('chosen_rank_review_seen_v1')).toBe(newer)
  })

  it('writes a numeric timestamp to the cooldown key', () => {
    dismissRankReview(fp())
    const raw = localStorageMock.getItem(STORAGE_KEYS.rankReviewCooldown)
    expect(raw).not.toBeNull()
    expect(Number.isFinite(parseInt(raw!, 10))).toBe(true)
  })
})

// ---------------------------------------------------------------------------
// cooldown
// ---------------------------------------------------------------------------

describe('cooldown', () => {
  it('suppresses prompt when fingerprint changed within cooldown window', () => {
    const original = fp()
    checkRankReviewDue(original)   // establish baseline (no cooldown)
    dismissRankReview(original)    // starts cooldown now
    const changed = fp({ totalAssetValue: 200_000 })
    expect(checkRankReviewDue(changed)).toBe(false)
  })

  it('shows prompt after cooldown window has passed', () => {
    const original = fp()
    checkRankReviewDue(original)
    dismissRankReview(original)
    // Backdate the cooldown timestamp to simulate expiry
    localStorageMock.setItem(
      STORAGE_KEYS.rankReviewCooldown,
      String(Date.now() - RANK_REVIEW_COOLDOWN_MS - 1_000),
    )
    const changed = fp({ totalAssetValue: 200_000 })
    expect(checkRankReviewDue(changed)).toBe(true)
  })

  it('does not suppress prompt before any dismissal (initial baseline only)', () => {
    const original = fp()
    checkRankReviewDue(original)   // baseline only — no cooldown key written
    const changed = fp({ birthYear: 1990 })
    expect(checkRankReviewDue(changed)).toBe(true)
  })
})

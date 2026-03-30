# Plan.md — Phase 155: Rank Review Cooldown

## Task Summary
Add a 7-day cooldown to the rank review prompt so it doesn't resurface
immediately after minor input changes (e.g. asset value crossing a $1k
bucket). Cooldown only starts on explicit dismiss. Initial baseline write
has no cooldown.

## Goal
After the user dismisses the review prompt, suppress it for 7 days even
if the fingerprint changes slightly. Prompt returns naturally after:
  a) cooldown expires (7 days), or
  b) never: existing fingerprint-match suppression still applies

## Non-Goals
- No changes to getRankReviewFingerprint or the fingerprint format
- No changes to rank/page.tsx (API is unchanged)
- No backend, no scheduling, no notifications
- No changes to settings/page.tsx

## Design
Two separate localStorage keys:
  rankReviewSeen     — existing: stores last-dismissed fingerprint (format UNCHANGED)
  rankReviewCooldown — NEW: stores dismiss timestamp as numeric string

checkRankReviewDue:
  1. No stored fp → write baseline (no cooldown), return false
  2. fp matches → return false
  3. fp differs, no cooldown key → return true  (pre-dismiss state: initial baseline)
  4. fp differs, cooldown active  → return false (suppressed)
  5. fp differs, cooldown expired → return true

dismissRankReview:
  - writes fp to rankReviewSeen (unchanged)
  - writes Date.now() to rankReviewCooldown (new)

## Affected Files
### Modified
- `lib/constants/storage-keys.ts` — add `rankReviewCooldown` key
- `lib/utils/rank-review.ts` — add cooldown constant + logic
- `__tests__/lib/utils/rank-review.test.ts` — add 3 cooldown tests

## Backward Compatibility
Old storage (rankReviewSeen without cooldown key) → no cooldown key present
→ rule 3 applies → prompt shows if fingerprint changed. Safe migration.

## Risks
- Minimal. Additive. All existing tests pass unchanged.
- rank/page.tsx call sites unchanged.

## Validation Steps
1. Existing tests pass: npx jest rank-review.test
2. New cooldown tests pass
3. TypeScript: npx tsc --noEmit → 0 errors

# Plan.md — Phase 157: Rank Change Reason Hint

## Task Summary
Add a `reasonHint` field to MonthlySummary that shows a brief, cautious hint
about why the overall rank changed between the two compared snapshots.
Shown only when delta !== null && delta !== 0.

## Goal
Surface non-obvious change reasons (benchmark updated, profile expanded)
as a one-line hint in the Rank Change card. Asset total change is included
as the fallback reason when nothing more specific is detectable.

## Reason Detection Rules (first match wins)
1. benchmarkSource differs between snapshots → "Benchmark reference source changed since last comparison."
2. benchmarkVersion differs (same source)   → "Benchmark reference ranges were updated since last comparison."
3. Profile expanded (age/return went null→non-null) → "Comparison depth expanded — a new rank category became available."
4. totalAssetValue differs → "Asset total changed since last comparison."
5. None detectable → null (no hint shown)

Guard: reasonHint is only computed when delta !== null && delta !== 0.
If benchmarkVersion/Source are absent (older snapshots), those rules skip
safely (both sides must be defined).

## Affected Files
### New
- `lib/utils/rank-change-reason.ts`
  — `getRankChangeReason(current, previous): string | null`

### Modified
- `lib/utils/rank-monthly-summary.ts`
  — add `reasonHint: string | null` to MonthlySummary type
  — compute it from snapshots when delta is non-zero

- `app/(app)/rank/page.tsx`
  — render `monthlySummary.reasonHint` below the existing note line

## Risks
- Minimal. Additive only. reasonHint is null-guarded.
- Existing delta/note/versionNote display unchanged.
- Older snapshots without benchmarkSource/Version → those rules skip safely.

## Validation Steps
1. TypeScript: npx tsc --noEmit → 0 errors
2. No prior snapshot → reasonHint null (no hint)
3. Same state revisit → delta = 0 → reasonHint null
4. Asset change → "Asset total changed since last comparison."
5. Benchmark source change → source reason shown, asset reason suppressed

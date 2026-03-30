# Plan.md — Phase 160: Rank Maintainability Cleanup

## Task Summary
Extract two identically-duplicated formatting helpers into a shared utility
so colour thresholds and label logic have a single source of truth.

## Finding
topPctLabel(percentile):
  — identical in rank-report-section.tsx and rank-share-card.tsx

percentileColor(percentile):
  — identical in rank-report-section.tsx, rank-share-card.tsx, and rank/page.tsx

If colour thresholds change (e.g. >= 30 → >= 25), all 3 files currently
need simultaneous edits and can silently diverge.

All other candidate files (benchmark-source-note, rank-source-explanation,
rank-review, rank-change-reason) serve distinct purposes — not true duplicates.

## Fix
Extract to lib/utils/rank-format.ts.
Import in all 3 files, remove local definitions.

## Non-Goals
- No logic changes — identical copy, extract only
- No changes to PercentileBar bg-* colours (different scale, intentional)
- No changes to topPctColor in rank-overview-card.tsx (different scale: top%, not percentile)
- No changes to any other files

## Affected Files
### New
- `lib/utils/rank-format.ts`
  — export topPctLabel(percentile): string
  — export percentileColor(percentile): string

### Modified
- `components/rank/rank-report-section.tsx`  — remove 2 local fns, import from rank-format
- `components/rank/rank-share-card.tsx`       — remove 2 local fns, import from rank-format
- `app/(app)/rank/page.tsx`                   — remove 1 local fn, import from rank-format

## Risks
- Mechanical extraction only — zero logic change.
- TypeScript will catch any mismatch.

## Validation Steps
1. TypeScript: npx tsc --noEmit → 0 errors
2. Visual: rank page colours identical before/after
3. topPctLabel('<1%' edge case): percentile = 100 → 'Top <1%'

# Plan.md — Phase 154: Source-Specific Explanation Variants

## Task Summary
Add a lowest-priority source-specific explanation to the rank summary strip.
When no confidence note or input explanation is active (healthy state),
show a one-line note identifying which benchmark the comparison is based on.

## Goal
- default source  → "Compared against built-in reference benchmarks."
- curated source  → "Compared against your curated benchmark dataset."
- fallback/stub   → null (confidenceNote already covers these states)

## Non-Goals
- No changes to confidenceNote, inputExplanation, or narrative summary
- No changes to priority of existing explanation slots
- No methodology rewrite
- No new UI element — reuses existing summary strip text slot

## Explanation Priority Order (after change)
1. confidenceNote  — fallback / invalid / partial  (most critical)
2. inputExplanation — incomplete profile
3. sourceExplanation — healthy source identification  ← new, lowest priority

## Affected Files
### New
- `lib/utils/rank-source-explanation.ts`
  — `getRankSourceExplanation(sourceId, isFallbackOnly): string | null`

### Modified
- `app/(app)/rank/page.tsx`
  — import getRankSourceExplanation
  — compute `sourceExplanation` alongside other summaries
  — extend summary strip: `confidenceNote?.text ?? inputExplanation ?? sourceExplanation`

## Risks
- Minimal. sourceExplanation is only shown when both confidenceNote and
  inputExplanation are null (healthy, complete-profile user). No existing
  behaviour changes.

## Validation Steps
1. Default source, complete profile → "Compared against built-in reference benchmarks."
2. Curated source, complete profile → "Compared against your curated benchmark dataset."
3. Any source, incomplete profile → inputExplanation wins (source note suppressed)
4. Fallback/invalid/partial → confidenceNote wins (source note suppressed)
5. TypeScript: npx tsc --noEmit → 0 errors

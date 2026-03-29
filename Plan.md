# Plan.md — Phase 134: Rank Trust/Confidence Note

## Task Summary
Add a single compact note in the rank summary strip that communicates
benchmark trust level when a concern exists (fallback active, partial source).
When no concern exists, preserve the existing inputExplanation line.

## Goal
Fill the gap: benchmark fallback/health is currently only visible in Settings
diagnostics. Users on the rank page have no indication when their preferred
source failed or when some rank categories are unsupported.

## Non-Goals
- No new scoring engine
- No methodology change
- No redesign
- No AI API
- No additional UI sections or new cards

## Signal Priority (first match wins — one note at a time)
1. isUsingFallback / status 'fallback' → level 'low'   (amber)
2. benchmarkHealth 'invalid'           → level 'low'   (amber)
3. benchmarkHealth 'partial'           → level 'moderate' (gray, softer)
4. benchmarkHealth 'healthy'           → null (show inputExplanation as usual)

## Affected Files
### New
- `lib/utils/rank-confidence-note.ts`
- `__tests__/lib/utils/rank-confidence-note.test.ts`

### Modified
- `app/(app)/rank/page.tsx`
  - Import getBenchmarkCapabilities, getBenchmarkHealthStatus, getRankConfidenceNote
  - Add benchmarkCaps + benchmarkHealth memos
  - Add confidenceNote computation
  - Summary strip: show confidenceNote (amber) ?? inputExplanation (gray)

## Risks
- Low. Display-only change. Existing inputExplanation still shows when no
  benchmark concern exists. No logic changes to rank computation.

## Validation Steps
1. All tests pass (jest)
2. Default source, all inputs → inputExplanation shown (no amber)
3. Fallback active → amber note "built-in reference data" shown instead
4. Partial source → gray note about unavailable categories shown
5. No assets → no note shown

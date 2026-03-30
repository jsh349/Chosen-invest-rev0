# Plan.md — Phase 156: Rank Report Interpretation Slot Refinement

## Task Summary
Replace getRankInterpretation() in the compact rank report's explanation
slot with highlight.message — the rank-type-specific contextual message
already computed in the RankResult.

## Goal
Slot 2 (explanation) currently shows a generic band label
("Above the benchmark midpoint.") that lacks rank-type context.
highlight.message already contains the specific, contextual version:
"Top 30% nationally — above the median benchmark."

## Before / After
Before: explanation = getRankInterpretation(highlight.percentile)
After:  explanation = highlight.message

## Non-Goals
- No changes to getRankInterpretation (still used elsewhere)
- No changes to rank/page.tsx
- No changes to comparisonNote, nextAction, highlight slots
- No new interpretation logic

## Affected Files
### Modified
- `components/rank/rank-report-section.tsx`
  — in composeRankReport: use highlight.message instead of getRankInterpretation
  — remove now-unused getRankInterpretation import

## Risks
- Minimal. highlight.message is typed as non-optional string.
  composeRankReport already guards that highlight.percentile !== null,
  so message is always a fully computed contextual string at this point.

## Validation Steps
1. TypeScript: npx tsc --noEmit → 0 errors
2. Slot 2 shows rank-specific context ("nationally", "aged X–Y", etc.)
3. Slot 1 (Top X%) and Slot 2 are complementary, not duplicative
4. No regression in other slots (comparisonNote, nextAction, footer)

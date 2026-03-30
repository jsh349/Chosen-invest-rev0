# Plan.md — Phase 153: Rank Summary State Compression

## Task Summary
Reduce visible summary density on the rank page by suppressing rank actions
when the rank checklist is already showing. Both blocks serve as "what to
do next" surfaces and overlap significantly when the user profile is incomplete.

## Goal
In the incomplete-profile state (most common for new users), remove one of
two sequential action link blocks. The checklist is the higher-value surface
because it explains WHY each action is needed. Rank actions are redundant
when checklist items are present.

## Non-Goals
- No redesign
- No logic changes to getRankActions or getRankChecklist
- No changes to the checklist or action data itself
- No changes to narrative summary, explanation block, or review summary
- No new state

## Findings
Surface audit (individual mode, with assets):
1. Summary strip
2. PrimaryRankHighlight
3. Narrative summary
4. Review banner (conditional)
5. RankDetailExplanationBlock (≤2 items)
6. Rank actions  ← overlaps with #7 when checklist shows
7. Rank checklist ← higher-value: includes context + reason
8. Review Summary card
9. Rank rows

In incomplete-profile state, blocks 6 and 7 appear together with
similar/identical link targets. Suppressing 6 when 7 is active removes
1 whole redundant block.

getRankReviewSummary already returns null when all ok — Review Summary
card is already correctly gated.

## Affected Files
### Modified
- `app/(app)/rank/page.tsx`
  — add `&& rankChecklist.length === 0` to rank actions render condition

## Risks
- Minimal. Rank actions still show when checklist is empty (complete profile).
- No data loss, no logic change, no new state.

## Validation Steps
1. Incomplete profile (no age/gender/return): checklist shows, rank actions hidden
2. Complete profile: checklist empty, rank actions show normally
3. No assets: neither block shows (unchanged)
4. TypeScript: npx tsc --noEmit → 0 errors

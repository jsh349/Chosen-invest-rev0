# Plan.md — Phase 158: Rank Surface Parity Pass

## Task Summary
Align the explanation text in RankShareCard with RankReportSection.
After Phase 156, RankReportSection uses highlight.message for the
explanation slot. RankShareCard still uses getRankInterpretation(),
giving generic text on one surface and specific contextual text on the other.

## Parity Gap
RankReportSection explanation: "Top 30% nationally — above the median benchmark."
RankShareCard explanation:     "Above the benchmark midpoint."

Both surfaces show the same percentile — the contextual explanation
should be consistent.

## Fix
Replace getRankInterpretation(hero.percentile) with hero.message
in the hero block of RankShareCard. Remove now-unused import.

## Non-Goals
- No change to hero rank selection (overall_wealth is intentional for share card)
- No change to secondary rank rows
- No change to footer link copy ("Full breakdown →" suits the share card's purpose)
- No change to partial data note
- No changes to RankReportSection

## Affected Files
### Modified
- `components/rank/rank-share-card.tsx`
  — hero explanation: getRankInterpretation(hero.percentile) → hero.message
  — remove getRankInterpretation import (now unused)

## Risks
- Minimal. hero.message is always a non-empty string on RankResult.
  hero is only rendered when hero.percentile != null, which is also
  when computeOverallWealthRank produces a specific message.

## Validation Steps
1. TypeScript: npx tsc --noEmit → 0 errors
2. Hero explanation shows rank-specific text ("nationally", etc.)
3. Secondary rows unchanged
4. Partial data note unchanged
5. Footer unchanged

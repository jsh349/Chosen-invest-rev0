# Plan.md — Phase 133: Grouped Rank Explanation Block

## Task Summary
Replace four separate identical-looking explanation cards on the rank page
(nextHint, rankInsight, rankGoalInsight, rankAllocationInsight) with one compact
grouped block that shows at most 1-2 lines using a deterministic priority.

## Goal
Cleaner visual presentation — one card, one visual rhythm, no content change.

## Non-Goals
- No new explanation content
- No methodology change
- No AI API
- No new utility functions
- No changes to existing explanation generators

## Priority Rule (deterministic, 2-slot max)
Slot 1 (primary):   nextHint → rankInsight → rankGoalInsight → rankAllocationInsight
Slot 2 (secondary): next available after slot 1's pick (only if slot 1 is filled)

## Affected Files
### New
- `components/rank/rank-detail-explanation.tsx`

### Modified
- `app/(app)/rank/page.tsx`
  - Remove 4 separate explanation cards (lines ~454–486)
  - Add <RankDetailExplanationBlock> in their place

## Risks
- Low. Pure display change; same data, same priority, one card instead of four.
- nextHint link (Settings →) is preserved inside the new component.

## Validation Steps
1. All tests pass (jest)
2. With no profile inputs: nextHint visible, one Settings link
3. With all inputs + gap: rankInsight visible (nextHint is null)
4. With all inputs, no gap: goal or allocation insight visible (if any)
5. With nothing to show: block renders nothing (no empty card)

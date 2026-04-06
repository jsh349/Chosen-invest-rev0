# Plan.md — Audit Fix Pass (2026-04-06)

## Task Summary
Fix the three confirmed bugs from the codebase debugging audit.
All other audit items were verified as false positives (code already handles them correctly).

## Goal
- Eliminate confirmed edge-case bugs before they manifest with real API data
- Reduce duplicated logic that increases bug surface area

## Non-Goals
- Do NOT refactor stores, adapters, or loading patterns
- Do NOT add features or extra validation beyond what is described
- Do NOT change settings store, benchmark adapter, or loading guards (verified correct)

## Confirmed Fixes

### FIX-1: goalProgressPct — missing targetAmount NaN guard
- **File:** `lib/utils/goal-status.ts`
- **Line:** 27
- **Problem:** `targetAmount` NaN passes the `<= 0` check, then `currentAmount / NaN = NaN`, which
  propagates through `Math.max/min` and renders as "NaN%"
- **Fix:** Add `if (!Number.isFinite(goal.targetAmount)) return 0` after the `<= 0` check

### FIX-2: buildPortfolioSummary — unsafe category type cast
- **File:** `features/dashboard/helpers.ts`
- **Lines:** 22–34
- **Problem:** `category as AllocationSlice['category']` blindly casts any string. When API returns
  unknown categories, the cast silently passes TypeScript but the data model is corrupted.
- **Fix:** Add `normalizeAssetCategory()` in `lib/utils/normalize-category.ts` that maps unknown
  strings to `'other'`. Use it in `buildPortfolioSummary` instead of the bare cast.

### FIX-3: formatAmount — duplicated in two files
- **Files:** `app/(app)/transactions/page.tsx` (line 44), `components/dashboard/transaction-summary-card.tsx` (line 16)
- **Problem:** Identical formatting logic in two components. Divergence risk when edge cases (zero amounts) need handling.
- **Fix:** Extract to `lib/utils/format-amount.ts`. Update both call sites.

## P411 — getRankInterpretation compact-fit pass

### Problem
Three interpretation tiers echo their headline band label in different words:
- "Above median" + "Above the benchmark midpoint." — same meaning
- "Around median" + "Near the benchmark midpoint." — same meaning
- "Below median" + "Below the benchmark midpoint." — same meaning

### Fix
Replace the three echo lines with population-framing alternatives that add a
different angle (relative standing) rather than restating the percentile threshold.

| Tier | Before | After |
|------|--------|-------|
| ≥50 | "Above the benchmark midpoint." | "Ahead of the majority in the reference group." |
| ≥40 | "Near the benchmark midpoint." | "Comparable to the center of the reference range." |
| ≥25 | "Below the benchmark midpoint." | "Behind the majority in the reference group." |

≥75 ("Compares favorably…") and <25 ("In the lower range…") are kept — they
already add a different angle than their headlines.

### Affected Files
- `lib/utils/rank-interpretation.ts`
- `__tests__/lib/utils/rank-interpretation.test.ts`

- `lib/utils/normalize-category.ts` (new)
- `features/dashboard/helpers.ts`
- `lib/utils/format-amount.ts` (new)
- `app/(app)/transactions/page.tsx`
- `components/dashboard/transaction-summary-card.tsx`

## Risks
- FIX-1: Pure additive guard, no behavior change for valid data
- FIX-2: Additive normalization; existing valid categories are unchanged
- FIX-3: Behavioral equivalence — same output, just extracted

## Validation Steps
1. Run `npm test` — all 466 tests must pass
2. Manual: Add a goal with a large target, verify progress bar shows correct %
3. Manual: Dashboard allocation chart renders all user asset categories
4. Manual: Transactions page and dashboard "This Month" card format amounts identically

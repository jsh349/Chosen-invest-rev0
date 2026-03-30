# Plan.md — Phase 161: Bug Fix Pass (Audit Findings)

## Task Summary
Fix all confirmed bugs and errors identified in the debugging audit.
No logic rewrites, no new features, no scope expansion.

## Issues to Fix

### ISSUE-027 — Stores: missing .catch on getAll() (HIGH)
All 5 stores call `adapter.getAll().then(...)` without a `.catch`.
If the adapter rejects, `setIsLoaded(true)` is never called → permanent
loading spinner for the entire app.
Affected: assets-store, goals-store, transactions-store,
          household-store, household-notes-store

### ISSUE-024 — Missing error.tsx error boundary (MEDIUM)
`app/(app)/` has no `error.tsx`. An unhandled throw in any route
white-screens the entire app with no recovery path.
Fix: create `app/(app)/error.tsx` as a minimal error boundary.

### ISSUE-006 — buildMockTrend: hard-coded month labels (HIGH)
`lib/mock/trend.ts` uses `['Oct', 'Nov', 'Dec', 'Jan', 'Feb', 'Mar']`.
After March 2026 the labels are wrong. Fix to derive the last 6 months
dynamically from the current date.

### ISSUE-021 — topPctColor duplicates percentileColor (LOW)
`rank-overview-card.tsx` defines `topPctColor(topPct)` whose thresholds
are identical to `percentileColor(100 - topPct)` from rank-format.ts.
Fix: replace with `percentileColor(100 - topPct)`.

### ISSUE-010 — Transaction sort uses localeCompare on dates (MEDIUM)
`localeCompare` is correct for ISO YYYY-MM-DD but breaks on non-zero-padded
dates from import/API (e.g. "2024-1-5"). Fix to use Date.getTime() diff.

### ISSUE-012 — No duplicate email check in household (MEDIUM)
`addMember` allows the same email address to be added multiple times.
Fix: validate against existing members before calling `addMember`.

### ISSUE-015 — Settings import drops entire object on invalid currency (MEDIUM)
`isSafeToRestore` returns false when currency is unrecognised, silently
dropping ALL valid settings fields (birthYear, showCents, returnPct).
Fix: sanitize individual fields rather than rejecting the entire object.
Remove per-field content checks from `isSafeToRestore`; add a
`sanitizeSettingsForRestore` step in `handleImport`.

### ISSUE-019 — settings/page.tsx reads version/updatedAt from mock directly (LOW)
Lines 453-454 use `BENCHMARK_META.version/.updatedAt` instead of
`getActiveBenchmarkMeta()`, so the debug panel shows stale mock values
when a curated source is active.
Fix: import `getActiveBenchmarkMeta` and use it in those two lines.
Keep `BENCHMARK_META.sourceLabel` (static source description).

## Non-Goals
- No changes to market/page.tsx architecture (ISSUE-017 — demo-only page,
  no API seam needed until real market data exists)
- No changes to dashboard's buildMockTrend import path (ISSUE-018 —
  the fix in ISSUE-006 resolves the actual runtime bug; adapter refactor
  is a future concern)
- No logic changes to PercentileBar bg-* colors (intentional scale)
- No new features, no UI redesign

## Affected Files
### New
- `app/(app)/error.tsx`

### Modified
- `lib/mock/trend.ts`                        — ISSUE-006
- `lib/store/assets-store.tsx`               — ISSUE-027
- `lib/store/goals-store.tsx`                — ISSUE-027
- `lib/store/transactions-store.tsx`         — ISSUE-027
- `lib/store/household-store.tsx`            — ISSUE-027
- `lib/store/household-notes-store.tsx`      — ISSUE-027
- `components/dashboard/rank-overview-card.tsx` — ISSUE-021
- `app/(app)/transactions/page.tsx`          — ISSUE-010
- `app/(app)/household/page.tsx`             — ISSUE-012
- `app/(app)/settings/page.tsx`              — ISSUE-015, ISSUE-019

## Risks
- ISSUE-027: Adding .catch is purely additive — no risk
- ISSUE-024: New file only — no risk
- ISSUE-006: Replaces hard-coded array with Date-derived array — verify edge cases at month boundaries
- ISSUE-021: Mechanical substitution; percentileColor(100-topPct) is mathematically identical to topPctColor(topPct)
- ISSUE-015: Sanitization must preserve valid fields; test with edge-case export files

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Stores: simulate adapter rejection → isLoaded becomes true, no spinner
3. Trend: verify correct month labels for current date (2026-03)
4. Rank overview: colours identical before/after
5. Transaction sort: ISO and non-zero-padded dates sort correctly
6. Household: adding duplicate email shows error
7. Settings import: file with invalid currency still restores valid fields
8. Settings debug panel: shows active benchmark version, not always mock version

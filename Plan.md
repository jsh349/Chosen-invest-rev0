# Plan.md — Phase 151: Benchmark Source Readiness Note

## Task Summary
Add a compact informational note for external benchmark transition states,
specifically the case where the external source is prepared but not yet
connected. Existing local/fallback states are already communicated.

## Goal
Show a concise, user-readable note in the rank methodology section when:
- active source is `external` (stub / not yet connected) — the only missing case
- Existing "Built-in (default)" label and fallback amber note already cover the other states

## Non-Goals
- No new alert system
- No redesign
- No methodology section rewrite
- No external fetch
- No changes to existing benchmark change alert
- No changes to existing fallback note

## Constraints
- Communication layer only — no logic changes
- Note must be null-safe (returns null → nothing rendered)
- Must not interfere with existing rank behavior

## Affected Files
### New
- `lib/utils/benchmark-source-note.ts`
  — `getBenchmarkSourceNote(sourceId, isFallbackOnly)` pure function
  — returns string | null for 3 source states

### Modified
- `app/(app)/rank/page.tsx`
  — compute `benchmarkSourceNote` from active source + caps
  — render below existing fallback note in methodology section (3 lines)

## Risks
- Very low. Pure addition, no logic changes.
- Note is null-guarded — if isFallbackOnly is false, nothing shows.

## Validation Steps
1. Default source: no new note visible
2. Curated source: no new note visible
3. External source (if ever stored in localStorage): note shows
4. Fallback (curated selected but failed to load): existing amber note unchanged
5. TypeScript passes: npx tsc --noEmit

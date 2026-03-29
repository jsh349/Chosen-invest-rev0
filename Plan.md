# Plan.md — Phase 132: Benchmark Source Precedence Rule

## Task Summary
Extract a deterministic, named precedence order for benchmark source resolution.
Make getActiveBenchmarkSourceId() validate against this list instead of a hardcoded
string comparison. Add resolveAdapter() comment documenting the chain.

## Goal
Make source selection logic explicit and table-driven so the precedence is
readable in one place, and unknown stored values are guarded by a shared helper.

## Non-Goals
- No UI redesign
- No external fetch
- No new admin tooling
- No wiring of external source into resolveAdapter (it stays a stub)
- No visible behavior change

## Constraints
- External source remains not_connected — resolveAdapter() behavior unchanged
- BenchmarkSource.id (public/UI type) stays 'default' | 'curated' — no UI change
- All existing tests must pass

## Affected Files
### New
- `lib/utils/benchmark-source-precedence.ts`
- `__tests__/lib/utils/benchmark-source-precedence.test.ts`

### Modified
- `lib/adapters/rank-benchmarks-adapter.ts`
  - Import KnownBenchmarkSourceId + isKnownSourceId
  - Replace hardcoded '=== curated' guard in getActiveBenchmarkSourceId() with isKnownSourceId()
  - Add precedence comment in resolveAdapter()

## Precedence Order
curated (1st) > external (2nd, stub) > default (last, always available)

## Risks
- Minimal. getActiveBenchmarkSourceId() behavioral change: unknown stored values
  still return 'default'; known values ('curated') still return 'curated'.
  The only new behavior is 'external' would now be returned if stored —
  but since it's not in the UI, it cannot be stored by the user.

## Validation Steps
1. All existing tests pass (jest)
2. getActiveBenchmarkSourceId() returns 'default' for unknown values (unchanged)
3. getActiveBenchmarkSourceId() returns 'curated' when 'curated' is stored (unchanged)
4. Rank page renders normally — no visible change

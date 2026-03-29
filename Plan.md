# Plan.md — Phase 131: Benchmark Schema Compatibility Guard

## Task Summary
Add a lightweight compatibility guard that checks whether an incoming BenchmarkFile
has the structural characteristics each rank section actually requires — beyond what
validateBenchmarkFile already checks.

## Goal
Detect and block benchmark sources where individual sections are technically non-empty
but structurally useless (e.g., ageBased rows with no ageRange, ageGender rows with
no gender), which would silently produce empty rank results rather than hard errors.

## Non-Goals
- No schema migration / transformation
- No external validation engine
- No UI changes
- No changes to normalizeRow / validateBenchmarkFile logic
- No changes to the rank engine

## Constraints
- Pure local logic, no external API
- Must preserve current fallback behavior on incompatibility
- Single new file; minimal adapter change
- Must not break existing tests

## Affected Files
### New
- `lib/utils/benchmark-schema-guard.ts`
- `__tests__/lib/utils/benchmark-schema-guard.test.ts`

### Modified
- `lib/adapters/rank-benchmarks-adapter.ts` — call guard in resolveAdapter() and rankBenchmarksAdapterFromFile()

## Compatibility Checks
| Section          | Required characteristic per row                        |
|------------------|--------------------------------------------------------|
| overallWealth    | At least 1 row survives normalizeRow()                 |
| ageBased         | At least 1 normalized row has ageRange defined         |
| ageGender        | At least 1 normalized row has both ageRange and gender |
| investmentReturn | At least 1 row survives normalizeRow()                 |

The first two (ageBased, ageGender) are the critical ones — validateBenchmarkFile
already guarantees non-empty arrays, but does not check for the required extra fields.

## Risks
- Low. Guard is read-only; triggers fallback rather than throwing.
- resolveAdapter() already has a fallback chain — this is one more check in that chain.

## Validation Steps
1. Compatible file → no change in behavior, adapter loads normally
2. ageBased section with no ageRange rows → falls back to default, console.warn fires
3. ageGender section with no gender rows → falls back to default, console.warn fires
4. overallWealth / investmentReturn all-invalid rows → falls back to default
5. Existing tests still pass (jest)

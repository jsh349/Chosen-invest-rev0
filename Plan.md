# Plan.md — Phase 159: Rank Rollout Readiness Checklist

## Task Summary
Add a compact internal-only rollout readiness checklist inside a collapsed
<details> block in settings/page.tsx, placed below the existing
Benchmark Diagnostics section.

## Goal
Give internal reviewers a quick scan of whether the rank/benchmark system
appears ready for external benchmark rollout. All checks are deterministic
and computed from values already available in the component.

## Checklist Items (5)
1. Benchmark metadata defined   — BENCHMARK_META.version + updatedAt + sourceLabel all present
2. Active source is not a stub  — !debugCaps.isFallbackOnly
3. Full capability coverage     — all 4 caps (wealth/age/age+gender/return) = true
4. Source health known          — debugHealth.status !== 'invalid'
5. No staged update pending     — !debugRefresh.hasPending

An aggregate "All ready" / "Not ready" indicator at the top.

## Non-Goals
- No new utility file (all values are already in scope)
- No user-facing exposure
- No changes to existing diagnostics display
- No new workflow or admin feature

## Affected Files
### Modified
- `app/(app)/settings/page.tsx`
  — add <details> block after Benchmark Diagnostics, before Reset

## Risks
- Minimal. Read-only display. No state mutation.
- Collapsed by default — zero impact on non-internal users.

## Validation Steps
1. TypeScript: npx tsc --noEmit → 0 errors
2. Block renders collapsed by default
3. Expand → 5 checklist items visible with ✓/✗ indicators
4. Default source: items 1–4 all ✓, item 5 depends on pending state
5. External stub source: item 2 (stub) + item 4 (invalid) show ✗

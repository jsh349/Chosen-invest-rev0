# Plan.md — Phase 2: Turso Persistence

## Task Summary
Wire Turso (libSQL + Drizzle) as the primary data store for assets, goals, and
transactions. Replace localStorage adapters with API-backed adapters.
Includes float precision migration (real → integer minor units) as schema
foundation, applied before any real data is written.

## Goal
Users' financial data is persisted server-side in Turso, scoped to the
authenticated user ID. localStorage is no longer the source of truth for
assets, goals, or transactions.

## Implementation Order
User requested: (1) adapter swap, (2) API routes, (3) float precision.
Technically correct order used here: schema/precision first → API routes →
adapter swap. Rationale: Turso DB is currently empty; changing value storage
from REAL to INTEGER must happen before any data is written, not after.

## Non-Goals
- No household / household-notes persistence (localStorage remains)
- No settings / dashboard-prefs persistence (localStorage remains)
- No migration of existing localStorage data to Turso (no live users yet)
- No offline localStorage fallback after adapter swap
- No Turso migration execution — migration SQL is generated; user runs
  `npm run db:migrate` once after this step

## Affected Files

### Modified
- `lib/db/schema.ts`                     — value_cents INTEGER, add goals + transactions tables
- `lib/adapters/assets-adapter.ts`       — localStorage → API fetch
- `lib/adapters/goals-adapter.ts`        — localStorage → API fetch
- `lib/adapters/transactions-adapter.ts` — localStorage → API fetch
- `package.json`                         — add db:migrate script

### New
- `lib/db/migrations/` (generated)       — Drizzle migration SQL
- `lib/api/validators.ts`                — Zod schemas for all three resources
- `app/api/assets/route.ts`              — GET / POST / DELETE
- `app/api/goals/route.ts`               — GET / POST
- `app/api/transactions/route.ts`        — GET / POST

## Risks
- FK constraint: goals/transactions fail if user row missing → upsert user on every mutating request
- Float conversion: Math.round(value * 100) must be exact at all I/O boundaries
- Negative amounts (transactions): sign preserved through Math.round
- Remote Turso requires TURSO_AUTH_TOKEN — fails without it in production
- Adapter errors now produce network failures instead of localStorage errors;
  existing persist-error CustomEvent handling remains sufficient

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npm run db:migrate` → tables created in Turso
3. Sign in → add assets via portfolio input → reload dashboard → data persists
4. `GET /api/assets` in DevTools Network → correct JSON returned
5. `npm test -- --ci` → all tests pass

---

# Addendum: P241 — Interpretation headline wording refinement

## Task Summary
Align all five `getRankInterpretation` bands to consistent `benchmark median` framing.

## Goal
The ≥75 and <25 bands use "reference group" while the middle three bands use "benchmark median". Make all five consistent and directionally clear.

## Non-Goals
- No change to percentile thresholds
- No new tiers
- No UI layout changes
- No changes to any other file

## Affected Files
- `lib/utils/rank-interpretation.ts` — wording only

## Risks
- None — pure wording change, no logic

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank page: all five bands render the updated text correctly

---

# Addendum: P243 — Source/confidence co-framing pass

## Task Summary
Separate source framing from confidence framing in the rank summary strip.

## Goal
- Confidence notes currently lead with "built-in reference data" which duplicates
  the Benchmark chip in the same strip.
- The curated sourceExplanation duplicates the chip label for healthy curated source.
- Fix: confidence notes should express the condition, not restate the source identity.
  Source explanation for curated returns null (chip already identifies it).

## Non-Goals
- No layout changes
- No priority chain changes
- No other files

## Affected Files
- `lib/utils/rank-confidence-note.ts` — reword fallback + invalid texts
- `lib/utils/rank-source-explanation.ts` — return null for curated case

## Risks
- confidence note texts used elsewhere: currently only in the summary strip
  (share card receives sourceNote={null} explicitly). Safe to reword.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Fallback state: note says "Preferred source unavailable" (not "Using built-in reference data")
3. Invalid state: note says "Selected source not yet connected" (not "rank comparisons use built-in reference data")
4. Healthy curated + complete profile: no note in the strip (chip already identifies source)
5. Partial state: note unchanged

---

# Addendum: P244 — CTA emphasis consistency pass

## Task Summary
Review banner "Settings →" CTA is text-[10px] while all other primary CTAs are text-xs.
When the review banner is active, nextHint is suppressed — the banner Settings link is
the only primary CTA on the page. It should match the text-xs size of the links it replaces.

## Non-Goals
- No styling changes to secondary actions (Dismiss stays text-[10px])
- No changes to footer nav hints (text-[10px] is correct there)
- No changes to checklist or missingField links

## Affected Files
- `app/(app)/rank/page.tsx` — banner Settings link: text-[10px] → text-xs

## Risks
- None — single class name change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Review banner visible: "Settings →" is text-xs (matches explanation block CTAs)
3. Dismiss button unchanged at text-[10px] (secondary action, visually subordinate)

---

# Addendum: P247 — Fallback source explanation deduplication

## Task Summary
Benchmark Source card fallback amber line repeats "Preferred source unavailable —"
which is the exact opener of the confidence note already shown in the summary strip.
The card's unique value is the source-switch context, not the fallback state restatement.

## Non-Goals
- No changes to confidence note texts
- No changes to getBenchmarkSourceNote (methodology section)
- No other files

## Affected Files
- `app/(app)/rank/page.tsx` — one string change in the Benchmark Source card fallback line

## Risks
- None — display-only string change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Fallback + source changed: card shows "New source is also using built-in reference data."
3. Summary strip confidence note unchanged: "Preferred source unavailable — using built-in reference ranges."
4. No source change (previousLabel null): card not shown — unaffected

---

# Addendum: P250 — Final local-first rank system polish pass

## Task Summary
Three targeted wording inconsistencies across rank insight/review/goal surfaces.

## Issues
1. rank-goal-insight Rule 3: "above average" → "strong" (all other ≥75 rank descriptions use "strong")
2. rank-insight Rule 3: "Peer group comparison is unavailable" — imprecise (birth year unlocks age-based rank, not full peer group; Rule 4 correctly says "Age and gender")
3. rank-review-summary lines 63+102: "investment return rank" is verbose vs label "Return rank"; line 102 opener also drifts from line 63

## Non-Goals
- No changes to percentile-label.ts band labels (intentionally short for large headline context)
- No changes to rank-checklist.ts verb consistency (Add vs Set is intentional: Add = fill in a field, Set = create an entity)
- No other files

## Affected Files
- `lib/utils/rank-goal-insight.ts`    — Rule 3 text: "above average" → "strong"
- `lib/utils/rank-insight.ts`         — Rule 3 text: "Peer group" → "Age-based"
- `lib/utils/rank-review-summary.ts`  — lines 63+102: "investment return rank" → "return rank"; align openers

## Risks
- None — user-facing string changes only

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Return rank ≥75 + no investment/retirement goal: insight says "strong" (not "above average")
3. No birth year set: rank insight says "Age-based comparison is unavailable"
4. No return estimate in review summary: note says "Return estimate not set — return rank unavailable."

---

# Addendum: P242 — Rank summary context compression

## Task Summary
Remove two redundant micro-signals from rank summary surfaces.

## Goal
PrimaryRankHighlight shows comparisonBasis below interpretation — duplicates the detail rows.
RankReportSection Slot 1 shows raw `Xth percentile` below `Top X%` — same position twice.

## Non-Goals
- No layout changes
- No logic changes
- No other files

## Affected Files
- `app/(app)/rank/page.tsx`              — remove comparisonBasis from PrimaryRankHighlight
- `components/rank/rank-report-section.tsx` — remove Xth percentile line from Slot 1

## Risks
- None — display-only removals

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank page primary highlight: label → band label → interpretation → mode chip (no basis line)
3. Rank report section: label → Top X% → explanation (no raw percentile line)

---

# Addendum: Debugging Audit Fixes

## Task Summary
Apply the 5 confirmed bugs from the debugging audit. No new features. Minimal diffs only.

## Goal
Eliminate silent failures, missing error states, and structural fragility identified during the audit.

## Non-Goals
- No new UI surfaces or features
- No refactor of unrelated files
- Do not add the persist-error listener (PersistErrorBanner already exists and is wired into AppShell)
- Do not fix low-severity issues (direct localStorage in benchmark files, use-current-user-id race)

## Affected Files
- `lib/store/household-store.tsx`        — add isLoadError flag
- `lib/store/assets-store.tsx`           — reset assetsRef.current in clearAssets
- `lib/store/settings-store.tsx`         — move dispatchEvent outside setState updater
- `app/(app)/dashboard/page.tsx`         — check isLoadError from goals + transactions
- `lib/api/validators.ts`               — derive asset category enum from ASSET_CATEGORIES

## Risks
- household-store: adding isLoadError to context type requires updating HouseholdContextType and default value — low risk
- dashboard: adding two more isLoadError checks widens the existing error banner condition — no behavior change unless goals/tx actually fail to load
- validators.ts: category enum order must match; derive from ASSET_CATEGORIES key order

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Household page: simulate load failure → should show error state
3. Dashboard: goals/tx load error → error banner appears instead of zero-state
4. Add new asset category to ASSET_CATEGORIES → validators.ts picks it up automatically

---

# Addendum: P291 — Calmness pass for top-line summary wording

## Task Summary
Single wording refinement in the narrative summary opening sentence.
"Your overall asset position is [comparison]" reads slightly formal/stilted.
Replace with "Your overall assets rank [comparison]" across all five tiers.

## Goal
The first visible narrative summary line feels more direct and professional
without changing the factual content or benchmark framing.

## Non-Goals
- No changes to percentile thresholds or band labels
- No changes to getRankInterpretation (used in PrimaryRankHighlight)
- No redesign or logic changes
- No new strings or tiers

## Affected Files
- `lib/utils/rank-narrative-summary.ts` — opening sentence template: "asset position is" → "assets rank"
- `__tests__/lib/utils/rank-narrative-summary.test.ts` — fix 2 stale assertions still checking for "compares favorably"

## Risks
- None — user-facing string change only; no logic, no new branches

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-narrative-summary` → all 18 tests pass
3. Rank page with assets: narrative summary reads "Your overall assets rank [above/below/near/well above/well below] the benchmark median."

---

# Addendum: P292 — Restraint pass for supporting copy in rank detail

## Task Summary
Trim the second (prescriptive or speculative) sentence from insight strings
where the main interpretation already covers the observation, and where
action CTAs are separately available in the UI.

## Goal
Each insight is one factual, benchmark-grounded observation.
No speculation ("may be conservative"), no financial outcome claims
("could improve wealth position"), no risk-tolerance advice
("consider whether this concentration fits your risk outlook").

## Non-Goals
- No changes to rule logic or thresholds
- No changes to rank-next-hint.ts (action hints are intentionally prescriptive)
- No changes to rank-interpretation.ts or percentile-label.ts
- No redesign or new insights

## Affected Files
- `lib/utils/rank-insight.ts`           — trim second sentence from Rules 1 & 2
- `lib/utils/rank-goal-insight.ts`      — trim prescriptive endings from Rules 1–3
- `lib/utils/rank-allocation-insight.ts` — trim advice/prediction endings from Rules 1–2
- `__tests__/lib/utils/rank-insight.test.ts` — fix 3 stale tests (removed Rules 3 & 4)

## Risks
- None — display-only string changes; all test substrings are still present after trimming

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-insight rank-goal-insight rank-allocation-insight` → all tests pass
3. Explanation block on rank page: each insight is one sentence, no financial advice framing

---

# Addendum: P293 — Flow polish: report summary to trust framing

## Task Summary
In both compact report surfaces the source/coverage note sits without a visual
separator between the main content and the footer disclaimer, making the trust
block feel disconnected. Group them under one separator.

## Goal
Source note and footer disclaimer read as a unified "trust framing" section,
clearly separated from the main rank content above.

## Non-Goals
- No wording changes
- No logic changes
- No new components or props
- No layout changes beyond the separator grouping

## Affected Files
- `components/rank/rank-report-section.tsx` — wrap source note + footer under one border-t div
- `components/rank/rank-share-card.tsx`     — add border-t to source note paragraph
- `__tests__/lib/utils/rank-report-composer.test.ts` — fix stale explanation assertion

## Risks
- None — layout-only change; no logic, no new branches

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-report-composer` → all 8 tests pass
3. RankReportSection with source note: note and disclaimer share one border separator
4. RankReportSection without source note: single footer border unchanged
5. RankShareCard with source note: note has its own top border before disclaimer

---

# Addendum: P294 — Handoff refinement: action CTA to review CTA

## Task Summary
In RankReportSection, when an action slot is active (nextAction present), the
footer "Review in detail →" competes visually with the action link at the same
brand color and size. Differentiate them: when an action is the primary step,
the review CTA becomes informational ("See full ranking →"); when no action is
needed, "Review in detail →" is the primary invitation.

## Goal
CTA hierarchy is clear: action slot = primary, footer link = secondary/informational
when action is active; footer link = primary when profile is complete.

## Non-Goals
- No changes to routes
- No changes to RankShareCard (no competing action slot)
- No logic changes

## Affected Files
- `components/rank/rank-report-section.tsx` — footer link label conditional on nextAction

## Risks
- None — copy-only conditional; no logic

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. RankReportSection with nextAction: footer says "See full ranking →" (secondary)
3. RankReportSection without nextAction, not partial: "Review in detail →" (primary)
4. RankReportSection partial: "View full ranking →" (unchanged)

---

# Addendum: P295 — Fallback CTA wording consistency pass

## Task Summary
Two gaps in the existing isLowConfidence softening pattern:

1. getPrimaryRankNextAction gender hint has no isLowConfidence variant.
   Normal: "for a more specific peer comparison" implies reliable peer data.
   Low confidence: should drop "peer" and the reliability claim.

2. getRankActions Rule 1 label is "Complete profile for full ranking".
   "full ranking" implies a complete/reliable ranking — overstated in fallback.
   Low confidence: "Complete profile for all rank types" (factual, no promise).

## Goal
All CTA wording that carries an outcome promise has a soft fallback variant.
No new suppression logic — just wording alignment.

## Non-Goals
- No changes to other hints (age/return already have soft variants)
- No changes to getRankActions Rule 3 ('Add return estimate' is already neutral)
- No route changes
- No logic changes

## Affected Files
- `lib/utils/rank-next-hint.ts`  — add isLowConfidence branch for gender hint
- `lib/utils/rank-actions.ts`   — add isLowConfidence branch for Rule 1 label
- `__tests__/lib/utils/rank-next-hint.test.ts` — add gender isLowConfidence test
- `__tests__/lib/utils/rank-actions.test.ts`   — add Rule 1 isLowConfidence test

## Risks
- None — wording-only additions inside existing isLowConfidence pattern

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-next-hint rank-actions` → all tests pass
3. Fallback state + gender missing: hint says "for age and gender comparison" (no "peer")
4. Fallback state + profile incomplete: action label says "Complete profile for all rank types"

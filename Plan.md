# Plan.md — Phase 2: Turso Persistence

---

# Addendum: P367 — Four remaining rank system improvements

## Task Summary
Implement four items that complete the ranking system:
1. SCF-realistic benchmark data (replace illustrative placeholders)
2. Country selector (US only for now; infrastructure for future expansion)
3. Auto return calculation from asset cost basis
4. Rank snapshots persisted to database (unlimited history)

## 1. SCF-Realistic Benchmark Data
- File: `lib/mock/rank-benchmarks.ts`
- Replace current illustrative buckets with values based on
  2022 Survey of Consumer Finances published percentiles
- Same BenchmarkBucket structure, same adapter interface
- Update BENCHMARK_META sourceLabel to reflect SCF basis

## 2. Country Selector
- Add `country` field to `AppSettings` type (`lib/store/settings-store.tsx`)
- Add sanitization for country field
- Add country dropdown to Settings page (US only for now)
- Pass country through to benchmark label in rank page

## 3. Auto Return Calculation
- Add `costBasis` (optional number) to `Asset` type
- Add `cost_basis_cents` column to assets table (nullable)
- Write migration: `lib/db/migrations/0001_add_cost_basis_and_snapshots.sql`
- Update schema.ts, asset adapter, API route, and validator
- In rank page, compute weighted-average return from assets with cost basis
- Prefer computed return over manual `annualReturnPct`; fall back when unavailable

## 4. Rank Snapshots to DB
- Add `rank_snapshots` table to schema.ts (same migration file)
- Create API route: `app/api/rank-snapshots/route.ts`
- Modify `useRankSnapshots` hook to use API (localStorage fallback for unauthenticated)
- Remove MAX_SNAPSHOTS limit for DB-backed storage

## Non-Goals
- No external API for benchmark data (still local data)
- No multiple country benchmark datasets yet
- No complex portfolio return methodologies (simple cost-basis return)
- No real-time market data integration

## Risks
- DB migration adds two changes (cost_basis column + new table) in one migration
- Auto return is a simple `(current - costBasis) / costBasis` — not time-weighted
- Country field is US-only for now; other countries return same US benchmarks

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

# Addendum: Bug Fixes — Audit Round 2

## Task Summary
Fix 5 confirmed bugs from the second debugging audit. No new features, no refactors.

## Goal
Eliminate silent data loss, missing user-facing error states, a trust-breaking stale copy string, and two validator/adapter contract mismatches.

## Non-Goals
- No new UI surfaces
- No refactor of unrelated files
- Do not fix low-severity items (writeJSON in updater, DELETE missing ensureUser, GOAL_TYPES constant consolidation)

## Affected Files
- `lib/adapters/goals-adapter.ts`    — replace silent drop with warn+cap for currentAmount > targetAmount
- `lib/api/validators.ts`            — add z.refine cross-field check to GoalSchema; derive TransactionSchema.category from TRANSACTION_CATEGORIES
- `app/(app)/portfolio/input/page.tsx` — fix stale copy; add saveError state rendered below save button

## Risks
- goals-adapter cap: the `currentAmount > targetAmount` case should not reach the adapter if validation is correct; the cap is a defensive fallback, not a normal path
- validators.ts refine: rejects POST payloads that the adapter previously silently filtered — aligned behavior, no new data loss risk
- portfolio/input page: saveError is a new state variable; must be cleared on retry (setSaving(true) before the try block already re-gates the submit path)

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npm test -- --ci` → all tests pass
3. goals-adapter: goal with currentAmount > targetAmount is kept (capped) not dropped
4. GoalSchema: POST with currentAmount > targetAmount returns 400
5. TransactionSchema: POST with unknown category returns 400
6. portfolio/input: save failure shows inline error message; stale browser copy is gone

---

# Addendum: P306 — Non-overlap pass: coverage footnote vs action CTA

## Task Summary
In RankReportSection, when nextAction (Slot 4) is present, it already communicates
profile incompleteness ("Add your birth year for age-based comparison.").
The coverage footnote below ("X of N ranks available — some inputs are missing.")
repeats the same message in a weaker, generic form. Gate the coverage note on !nextAction.
The sourceNote (benchmark quality) is independent and still shows regardless.

## Non-Goals
- No changes to nextAction logic or wording
- No changes to sourceNote
- No changes to RankShareCard (no nextAction slot there)

## Affected Files
- `components/rank/rank-report-section.tsx` — gate coverage note: `!nextAction && isPartial`

## Risks
- None — purely suppressive; the CTA already covers the message more specifically

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Incomplete profile (no birth year): Slot 4 shows action, coverage note NOT shown below
3. Incomplete profile + degraded source: action shown, sourceNote still shown, coverage note suppressed
4. No nextAction + partial: coverage note still shown (unchanged)

---

# Addendum: P307 — Fallback tone parity: detail action link

## Task Summary
In fallback state, RankDetailExplanationBlock has no isLowConfidence awareness —
its action link stays text-brand-300 (the bright detail value from P296) while
the compact card mutes it to text-brand-400/60. In fallback, an action that implies
a reliable rank improvement should not feel more confident in the detail surface
than in the compact surface.

Fix: add isLowConfidence prop to RankDetailExplanationBlock. When true, step the
action link from text-brand-300 to text-brand-400 — measured, not suppressed.

## Non-Goals
- No changes to action text, routes, or suppression logic
- No changes to RankReportSection (already has its own fallback treatment)
- No changes to non-action items in the explanation block

## Affected Files
- `components/rank/rank-detail-explanation.tsx` — add isLowConfidence prop, conditional link color
- `app/(app)/rank/page.tsx`                     — pass isLowConfidence to RankDetailExplanationBlock

## Risks
- None — prop addition only; no logic change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Healthy benchmark: explanation block action link is text-brand-300 (bright, unchanged)
3. Fallback benchmark: action link steps back to text-brand-400 (measured)

---

# Addendum: P301 — Hierarchy spacing pass for primary rank headline

## Task Summary
In PrimaryRankHighlight, the interpretation line and the trust/confidence footer line
share equal `space-y-2` spacing, giving them equal visual weight. A small extra gap
before the footer makes it feel clearly subordinate to the interpretation.

## Non-Goals
- No wording changes
- No color changes
- No redesign or new elements

## Affected Files
- `app/(app)/rank/page.tsx` — add `mt-1` to trust note `<p>` in PrimaryRankHighlight

## Risks
- None — single class addition, no logic change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank page with assets: trust note (`mode · benchmark`) has a slightly larger gap below interpretation

---

# Addendum: P302 — Compact note ordering pass

## Task Summary
In compact rank surfaces (RankReportSection, RankShareCard), when both a sourceNote
and partial-coverage note are present, they are joined as `coverage · source`. Reorder
to `source · coverage` — benchmark quality is a global caveat and more fundamental;
coverage detail (which specific ranks are missing) is a specific follow-on.

## Non-Goals
- No changes to note content or conditions
- No redesign
- No new note types

## Affected Files
- `components/rank/rank-report-section.tsx` — swap note order
- `components/rank/rank-share-card.tsx`     — swap note order, update comment

## Risks
- None — display-only reorder; both notes still appear when applicable

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Fallback + incomplete profile: compact card shows source note first, coverage note second

---

# Addendum: P303 — Priority-lock: suppress comparisonNote when isLowConfidence

## Task Summary
In `composeRankReport`, the `comparisonNote` slot (cross-rank gap insight) is currently
not gated on `isLowConfidence`. When the benchmark is fallback/invalid, showing a
cross-rank comparison implies a precision level the source cannot deliver. Gate it out.
In normal healthy state, comparisonNote appears as before.

## Non-Goals
- No changes to getRankInsight logic
- No changes to how isLowConfidence is determined
- No changes to any other slot

## Affected Files
- `lib/utils/rank-report-composer.ts` — add `|| isLowConfidence` to comparisonNote gate

## Risks
- Compact cards in fallback state lose the cross-rank note; they still show interpretation
  (slot 2) and optionally the profile-completeness action (slot 4)

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Healthy state: cross-rank note still appears when present
3. Fallback state: compact card shows interpretation only (no cross-rank note)

---

# Addendum: P304 — Visual handoff separator in RankDetailExplanationBlock

## Task Summary
When an interpretation item and an action item are both visible in
RankDetailExplanationBlock, they share uniform `space-y-3` spacing.
Adding a subtle top border to the action item marks the reading→acting boundary.

## Non-Goals
- No wording changes
- No layout restructure
- No new elements outside the existing card

## Affected Files
- `components/rank/rank-detail-explanation.tsx` — add `border-t border-surface-border pt-2` to action item when it follows another item

## Risks
- None — CSS-only addition; no logic change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank page: explanation block with hint shows a thin separator between insight and action link

---

# Addendum: P305 — Severity pass for review recommendation wording

## Task Summary
Two changes:
1. Rank Assessment chip adds a middle tier for `review` status:
   any `missing` → "Needs attention"; any `review` (no missing) → "Worth reviewing"; all `ok` → unreachable (block not shown)
2. Profile review notes are reworded from imperative ("Add gender…") to observational ("Gender not set — …"),
   matching the factual tone of wealth/return review notes.

## Non-Goals
- No changes to wealth or return review notes (already calm from P297)
- No changes to status thresholds
- No changes to review trigger logic

## Affected Files
- `app/(app)/rank/page.tsx`             — chip label + color: add middle tier
- `lib/utils/rank-review-summary.ts`   — reword 4 profile notes to observational
- `__tests__/lib/utils/rank-review-summary.test.ts` — verify assertions still match new wording

## Risks
- All test assertions use regex patterns that match substrings (birth year, gender, return estimate) — verified they still match after wording change

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-review-summary` → all 18 tests pass
3. Review card with 'review' items only: chip says "Worth reviewing" (neutral gray)
4. Review card with 'missing' item: chip says "Needs attention" (amber, as before)
5. Profile 'review' notes read as observations, not imperative instructions

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

---

# Addendum: P296 — Action prominence parity pass

## Task Summary
Action links in the detail explanation block and the compact report section both
used `text-brand-400`, giving equal visual weight despite the surfaces having
different depth and intent. Two targeted class changes differentiate them.

## Goal
- Detail explanation block: action link is one step brighter (`text-brand-300`) —
  clearer forward step in the dedicated rank detail context.
- Report section action slot: action link is slightly muted (`text-brand-400/75`) —
  secondary feel appropriate for the compact embedded surface.

## Non-Goals
- No changes to rank actions card (`text-brand-400` — already in a dedicated card)
- No changes to footer link, prose text, or any logic
- No redesign

## Affected Files
- `components/rank/rank-detail-explanation.tsx` — link `text-brand-400` → `text-brand-300 hover:text-brand-200`
- `components/rank/rank-report-section.tsx`     — normal-confidence link `text-brand-400 hover:text-brand-300` → `text-brand-400/75 hover:text-brand-400`

## Risks
- None — CSS class changes only

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Detail page with nextHint: action link reads visibly brighter than before (brand-300)
3. Report section with nextAction: action link is subtly more muted than the detail link
4. Report section low-confidence: unchanged (`text-brand-400/60`) — stays most muted

---

# Addendum: P298 — Compact source-related UI harmony pass

## Task Summary
The context chip in RankReportSection and RankShareCard appended '· built-in reference'
when sourceNote was null — but null also covers healthy curated sources (P243 made curated
return null for healthy state). The chip was incorrectly claiming "built-in reference" for
curated sources, and doing double duty (mode + source) when source framing belongs in the
trust block and footer only.

## Goal
Enforce distinct roles: chip = comparison mode only; source framing stays in the trust block
(source note when degraded) and the footer disclaimer.

## Non-Goals
- No changes to RankOverviewCard (dashboard surface, separate concern)
- No changes to trust block or footer disclaimer text
- No new props or patterns

## Affected Files
- `components/rank/rank-report-section.tsx` — remove `{!sourceNote && ' · built-in reference'}` from chip
- `components/rank/rank-share-card.tsx`     — remove `{!sourceNote && ' · built-in reference'}` from chip

## Risks
- None — presentation-only removal; no logic path changes

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. RankReportSection healthy: chip shows only "individual" (no source suffix)
3. RankShareCard healthy curated: chip shows "individual" (no incorrect "built-in reference")
4. Degraded state: source note still appears in trust block — unaffected
5. Footer disclaimer unchanged on both surfaces

---

# Addendum: P299 — Internal diagnostics meaning-first ordering pass

## Task Summary
Benchmark Diagnostics expanded rows were ordered active source → fallback →
health → capabilities, leading with context (which source) before status (is it
working). Reordered to health → capabilities → fallback → active source so the
most critical readiness signal appears first when scanning the block.

## Goal
Opening the diagnostics panel immediately shows health status and capabilities
(what's broken), then fallback (what's compensating), then source (what triggered
this). Faster operational scan with no content changes.

## Non-Goals
- No changes to the summary label (already shows ready/degraded/not ready)
- No new rows or fields
- No changes below the first separator (Comparison mode, Version, Last applied, Pending)
- No changes to any other file

## Affected Files
- `app/(app)/settings/page.tsx` — reorder 4 rows in the diagnostics source group + update comment

## Risks
- None — pure render reordering; all values and logic unchanged

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Open Benchmark Diagnostics: first row is Health, second is Capabilities
3. Fallback row is third, Active source row is fourth
4. Everything below the separator (Comparison mode, Version, etc.) is unchanged
5. Summary label (ready/degraded/not ready) is unchanged

---

# Addendum: P308 — Title/chip complementarity pass

## Task Summary
Rank page header subtitle restated the mode and benchmark source that the chip
already shows, creating redundancy. Subtitles changed to describe the ranking
dimensions instead, so title describes the subject, subtitle describes the scope,
and chip describes the context.

## Goal
- Individual subtitle: "Your individual portfolio ranked against reference benchmarks"
  → "Portfolio rank across wealth, age, and return"
- Household subtitle: "Combined household wealth ranked against reference benchmarks"
  → "Combined household wealth rank"
- Chip is unchanged ("Individual · Built-in reference" / "Household · Curated data")

## Non-Goals
- No changes to chip wording
- No changes to any other surface (report section, share card, etc.)

## Affected Files
- `app/(app)/rank/page.tsx` — two subtitle strings

## Risks
- None — string-only change in presentation layer

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Individual mode: subtitle reads "Portfolio rank across wealth, age, and return"
3. Household mode: subtitle reads "Combined household wealth rank"
4. Chip unchanged

---

# Addendum: P309 — Terminology compatibility pass

## Task Summary
`getRankConfidenceNote` for 'invalid' status said "not connected", which implies
a network or connectivity failure rather than a configuration/availability gap.
Changed to "not yet available" — calmer and accurate without implying a broken link.

## Goal
- `invalid` note: "Selected source not connected — using built-in ranges."
  → "Selected source not yet available — using built-in ranges."

## Non-Goals
- No changes to 'fallback' or 'partial' notes
- No changes to settings diagnostics page (uses separate internal labels)
- No test changes — `/not connected|built-in ranges/i` regex still matches "built-in ranges"

## Affected Files
- `lib/utils/rank-confidence-note.ts` — one string

## Risks
- None — the test assertion uses an OR pattern; "built-in ranges" still satisfies it

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest --ci rank-confidence-note` → all pass
3. Settings diagnostics: unchanged (uses separate vocabulary)

---

# Addendum: P310 — Pre-external polish pass (doc/comment/label consistency)

## Task Summary
Four narrow fixes across three files before external benchmark rollout:

1. `rank-interpretation.ts` — JSDoc incorrectly states isLowConfidence produces
   "reference estimate". Tests confirm it always uses "benchmark median"
   (confidence is communicated by getRankConfidenceNote, not the interpretation band).
   Fix: correct the JSDoc to match the actual tested behavior.

2. `rank-share-card.tsx` — isLowConfidence prop JSDoc repeats the same incorrect
   claim. Fix: remove the misleading sentence.

3. `rank-report-composer.ts` — comment references "Rules 3 & 4" of getRankInsight
   that no longer exist (profile-gap rules were removed in a prior pass). Fix:
   remove the stale parenthetical so the comment matches the current 2-rule state.

4. `rank-report-section.tsx` — footer link label uses "View full ranking →" for
   isPartial and "See full ranking →" for nextAction. Near-identical strings that
   will drift. Fix: unify both to "View full ranking →".

## Goal
No JSDoc or comment describes behavior that doesn't exist. No two labels for the
same destination diverge for no reason.

## Non-Goals
- No changes to getRankInterpretation logic or output
- No changes to any test assertions
- No changes to any other surface

## Affected Files
- `lib/utils/rank-interpretation.ts` — JSDoc only
- `components/rank/rank-share-card.tsx` — prop JSDoc only
- `lib/utils/rank-report-composer.ts` — inline comment only
- `components/rank/rank-report-section.tsx` — one label string

## Risks
- None for doc fixes (zero runtime impact)
- "See full ranking" → "View full ranking" is a copy-only change; no logic path changes

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest --ci rank-interpretation rank-report-composer rank-report-section` → all pass
3. Manual: compact card footer link reads "View full ranking →" in both partial and nextAction states

---

# Addendum: Audit Bug Fixes (Round 3)

## Task Summary
Fix 7 confirmed bugs identified in the Round 3 debugging audit.
No features, no refactors, no unrelated changes.

## Goal
All confirmed bugs are resolved. Each fix is the smallest safe change.

## Non-Goals
- No changes to store architecture (fire-and-forget remains intentional)
- No new UI for persistence errors (persist-error-banner already exists)
- No household API migration (out of scope per Plan.md non-goals)

## Affected Files + Fix Summary

1. `app/api/goals/route.ts`
   DELETE handler: add ensureUser() + use returned userId in WHERE

2. `app/api/transactions/route.ts`
   DELETE handler: same as above

3. `app/(app)/rank/page.tsx`
   useState(readPersistedMode) → useState('individual') + useEffect to restore

4. `lib/adapters/assets-adapter.ts`
   Mutates a.category in-place → return { ...a, category: 'other' } via .map()

5. `lib/adapters/goals-adapter.ts`
   Mutates g.currentAmount in-place → return { ...g, currentAmount: g.targetAmount } via .map()

6. `lib/adapters/transactions-adapter.ts`
   Unknown category drops transaction → coerce to 'Other' (match assets pattern)

7. `app/(app)/transactions/page.tsx`
   handleSubmit success path missing setError('') → add after setForm(EMPTY_FORM)

8. `app/(app)/household/page.tsx`
   ROLE_COLORS[m.role] has no fallback → add ?? 'text-gray-400 bg-surface-muted'

Note: audit-store.tsx window guard was reported as missing but is already present (lines 40-42). No change needed.

## Risks
- DELETE route fix: additive only — adds ensureUser() which already exists in POST
- Rank hydration fix: mode briefly shows 'individual' before useEffect fires; acceptable
- Adapter .filter().map() refactor: same logic, different structure; output identical
- Transactions coerce-vs-skip: changes behaviour for malformed API data; no data loss

## Validation Steps
1. npx tsc --noEmit → 0 errors
2. npx jest --ci → all previously passing tests still pass
3. Manual: Goals "Clear All" — data clears (DELETE route fix)
4. Manual: Rank page with household mode stored — no hydration warning in console
5. Manual: Add transaction with invalid state → success → error banner gone

---

# Addendum: P311 — Summary card header compactness pass

## Task Summary
In RankReportSection and RankShareCard, the comparison mode ("individual" /
"household") sits as an orphaned standalone paragraph directly under the section
title. This creates three metadata rows before the rank headline number and makes
the mode feel like a competing element rather than a title qualifier.

## Goal
Inline the mode text next to the section title on the same baseline row,
removing the standalone paragraph. The change is structural only — content and
wording are identical.

## Non-Goals
- No changes to rank logic, wording, or props
- No changes to PrimaryRankHighlight (already correct)
- No changes to RankOverviewCard (no mode text shown there)

## Affected Files
- `components/rank/rank-report-section.tsx` — header area (lines 58–59)
- `components/rank/rank-share-card.tsx`     — header area (lines 67–71)

## Risks
- None — pure layout restructuring; same text content

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Compact card: "Rank Report" and "individual" appear on the same row
3. Share card: "Rank Summary" and "individual" appear on the same row, date stays right
4. Household mode: "household" appears inline correctly

---

# Addendum: P312 — Detail explanation block hierarchy pass

## Task Summary
In RankDetailExplanationBlock, interpretation/insight text and action prose both
use text-gray-400. The action link (text-brand-300) becomes the most visually
prominent element, making the CTA feel primary even though the explanation should
be the primary signal. Bump interpretation text one step brighter (text-gray-300)
so it reads as the principal content; action prose stays at text-gray-400.

## Goal
- Insight/interpretation items (no href): text-gray-300 — reading-grade
- Action items (has href) prose: text-gray-400 — secondary
- Action link color unchanged

## Non-Goals
- No changes to link colors, ordering logic, or structure

## Affected Files
- `components/rank/rank-detail-explanation.tsx` — one className change in text rendering

## Risks
- None — single CSS class change; no logic path changes

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Detail block with interpretation + hint: interpretation text is visibly slightly brighter
3. Detail block with hint only: hint prose uses text-gray-400 (unchanged)
4. Detail block with insight only: insight prose uses text-gray-300

---

# Addendum: P313 — Compact report trust-before-action sequencing pass

## Task Summary
When both sourceNote and nextAction are present in the compact report, the
flow is: explanation → action → sourceNote. But sourceNote (confidence qualifier)
should precede the action recommendation so the user understands benchmark quality
before being directed to act. Only the nextAction+sourceNote coexistence case is
affected.

## Goal
When nextAction && sourceNote:
  render sourceNote as a prefix inside the nextAction slot (before action text)
  remove sourceNote from the trust block footer (already shown above)

When !nextAction && sourceNote:
  render sourceNote in the trust block as before (no change)

## Non-Goals
- No changes to the trust block disclaimer or review link
- No changes to coverage note logic
- No changes to composeRankReport or slot ordering

## Affected Files
- `components/rank/rank-report-section.tsx` — nextAction slot + trust block condition

## Risks
- None — content identical; only render order changes for the specific case where
  nextAction and sourceNote coexist

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Card with sourceNote + nextAction: sourceNote appears above the action text, not in footer
3. Card with sourceNote, no nextAction: sourceNote stays in trust block footer as usual
4. Card with nextAction, no sourceNote: no change — action renders exactly as before
5. Card with coverage note only: coverage note in footer as usual

---

# Addendum: Debugging Audit Fixes

## Task Summary
Apply confirmed bug fixes from the comprehensive debugging audit. Four targeted
fixes covering validator strictness, a settings type safety gap, an adapter
filter gap, and an SSR guard.

## Goal
Close the confirmed bugs without touching unrelated code.

## Non-Goals
- No refactoring of unrelated store files
- No changes to route logic or error handling
- No amount precision refine (floating-point false-positive risk, UI already constrains input)
- No changes to handleEditSave (optimistic UI is by design)
- No changes to use-format-currency deps (symbol already captures currency — not a bug)

## Affected Files
- `lib/api/validators.ts`           — createdAt/updatedAt → z.string().datetime()
- `app/(app)/settings/page.tsx`     — typeof check before currency Set.has()
- `lib/adapters/assets-adapter.ts`  — add currency field presence check
- `lib/store/audit-store.tsx`       — add top-level SSR guard in recordAudit

## Risks
- `z.string().datetime()` is stricter than `z.string().min(1)`; any client sending
  non-ISO timestamps would now receive a 400. All stores use `new Date().toISOString()`
  so no existing client is affected.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npm test -- --ci` → all tests pass
3. POST /api/assets with `createdAt: "not-a-date"` → 400 validation error
4. POST /api/assets with `createdAt: "2024-01-15T10:30:00.000Z"` → 200 ok

---

# Addendum: P351–P354 — Hierarchy, quietness, breathing-room, confidence-fit passes

## Task Summary
Four small, focused presentation refinements across rank summary and detail surfaces.

## Goal
- P351: First-glance hierarchy lock — most important number reads clearly first on summary surfaces
- P352: Quietness pass — supporting state elements in rank detail don't compete with the primary
- P353: Breathing-room — cleaner transition from interpretation to CTA in compact reports
- P354: Confidence-fit — review-entry link wording matches the active confidence level

## Non-Goals
- No redesign, no new surfaces, no new logic
- No AI API, no methodology changes
- No changes to routing, slot order, or report composition

## Affected Files
- `components/dashboard/rank-overview-card.tsx`   — P351: "total assets" text-sm → text-xs
- `components/rank/rank-share-card.tsx`            — P351: secondary values text-sm → text-xs
- `app/(app)/rank/page.tsx`                        — P352: RankRow percentile + detail block; P354: review banner link
- `components/rank/rank-report-section.tsx`        — P353: nextAction pt-2 → pt-3

## Risks
- None — visual-only changes; no logic, no data, no routing

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Dashboard: "total assets" reads clearly below the hero number, not at the same visual level
3. Rank page detail rows: raw percentile number (right side) is gray, clearly secondary to the band label
4. Rank report card: action slot feels slightly less cramped after explanation text
5. Review banner with healthy benchmark: "Review inputs →"; with fallback benchmark: "Check inputs →"

---

# Addendum: P355–P360 — Duplication cap, escalation, vocabulary, diagnostics, QA freeze

## Task Summary
Six focused passes: source deduplication, badge escalation fix, vocabulary alignment,
diagnostics differentiation, and final QA continuity freeze.

## Goal
- P355: Suppress duplicate benchmark label from PrimaryRankHighlight in low-confidence state
- P356: Fix inverted badge escalation (missing → stronger label, review → lighter label)
- P357/358: Align review notes to "midpoint" vocabulary matching P341/P350 interpretation
- P359: Differentiate `partial` vs `invalid` in internal diagnostics chip (text + color)
- P360: Make review notes band-aware (40-49 "around" zone gets "Around the benchmark midpoint.")

## Non-Goals
- No redesign, no new surfaces, no new logic, no AI API
- No changes to routing, interpretation thresholds, or report composition

## Affected Files
- `app/(app)/rank/page.tsx`                                  — P355 + P356
- `lib/utils/rank-review-summary.ts`                         — P357+P358+P360
- `__tests__/lib/utils/rank-review-summary.test.ts`          — update assertions for P360
- `app/(app)/settings/page.tsx`                              — P359

## Risks
- P360 changes the boundary condition: percentile 40 goes from "Tracking below" to "Around."
  The affected test case uses `overall(40)` — updating to `overall(39)` preserves test intent.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npm test -- --ci` → all tests pass
3. Rank page fallback state: PrimaryRankHighlight shows mode only (no "Built-in reference" suffix)
4. Review card with missing items: badge shows "Worth reviewing"; review-only shows "Worth a look"
5. Overall percentile 45: review note shows "Around the benchmark midpoint."
6. Overall percentile 39: review note shows "Tracking below the benchmark midpoint."
7. Settings diagnostics partial source: chip shows "· partial" in amber-400/60
8. Settings diagnostics invalid source: chip shows "· not connected" in amber-500

---

# Addendum: P361 — Final quiet-lock pass for narrative summary main meaning line

## Task Summary
Small wording-lock on the opening (main meaning) line of `getRankNarrativeSummary`.
In low-confidence mode at the two extreme tiers (≥75 and <25), the opening
currently drops "well" but then reads identically to a neutral mid-band
sentence (e.g. "Your overall assets rank above the benchmark median." — same
string a normal-confidence 50–74 user sees). Prefix these two cases with
"likely" so the hedge matches the active confidence level and mirrors the
existing "Likely above / Likely below" pattern in `getRankInterpretation`.

## Goal
Main meaning line stays concise, benchmark-based, and calm, and does not
state more than the current confidence level supports. Supporting sentence
and visual hierarchy unchanged.

## Non-Goals
- No changes to percentile thresholds, tier selection, or rank selection logic
- No changes to normal-confidence wording
- No changes to middle bands (50–74, 40–49, 25–39) in either confidence mode
- No changes to the supporting second sentence (return gap / profile note)
- No changes to `getRankInterpretation`, `getRankReviewSummary`, or any other surface
- No redesign, no new summary system, no AI API

## Affected Files
- `lib/utils/rank-narrative-summary.ts` — prefix "likely" on the two
  `isLowConfidence` branches (≥75 and <25); JSDoc updated to match
- `__tests__/lib/utils/rank-narrative-summary.test.ts` — add 5 small
  assertions that lock the new wording (present at extremes low-conf;
  absent in middle bands and in normal confidence)

## Risks
- None — wording-only change in two low-confidence branches. All existing
  regex assertions (`/rank above|below the benchmark median/`, `!/well above|below/`)
  still match because "likely" is a prefix word, not a substring overlap.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. `npx jest rank-narrative-summary` → all tests pass (existing + 5 new)
3. Rank page with fallback benchmark + overall ≥ 75: narrative reads
   "Your overall assets likely rank above the benchmark median."
4. Rank page with fallback benchmark + overall < 25: narrative reads
   "Your overall assets likely rank below the benchmark median."
5. Rank page with fallback benchmark + overall 50–74: narrative unchanged
   ("Your overall assets rank above the benchmark median.")
6. Rank page with healthy benchmark: all five tiers unchanged (no "likely")

---

# Addendum: P362 — Single-purpose lock for compact support lines

## Task Summary
In RankReportSection and RankShareCard, when both `sourceNote` and `isPartial`
are active the trust footer renders a merged sentence that stacks two distinct
caveats into one line (two em-dashes, three clauses):

  "3/4 ranks available — selected source not yet available — using built-in ranges."

This violates "one clear purpose per compact support line" and doubles a signal
that is already visible elsewhere (share card secondary rows render "—";
report section exposes the full view via "View full ranking →"). Collapse the
merged case to `sourceNote` only, so each compact support line carries a
single purpose: reliability (source) OR coverage (count fallback) — never
both stacked in one sentence.

## Goal
Compact surfaces show one caveat per line. The coverage count remains
reachable via the secondary rows (share card) or the full-ranking link
(report section). Richer nuance (both caveats side-by-side) stays in the
full rank page, not the compact cards.

## Non-Goals
- No changes to visibility gates (`!nextAction || isLowConfidence`,
  `isPartial || sourceNote`) — preserved exactly
- No changes to sourceNote content, coverage-only fallback string, nextAction,
  comparisonNote, interpretation, or any other slot
- No redesign, no new props, no new signal types
- No changes to RankShareCard / RankReportSection footer links or disclaimer

## Affected Files
- `components/rank/rank-report-section.tsx` — merged-case ternary collapses
  to `sourceNote ?? coverageFallback`; comment updated
- `components/rank/rank-share-card.tsx` — same simplification; comment updated

## Risks
- State D (sourceNote + isPartial) on RankReportSection loses the "X/Y" count.
  Mitigation: "View full ranking →" is already shown when `isPartial`, so the
  detailed view is one click away (exactly "richer nuance in deeper surfaces").
- No existing tests assert these merged strings; no test updates required.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Compact card, fallback benchmark + incomplete profile: trust line reads
   only the sourceNote (no "X/Y ranks available —" prefix, no trailing
   "— using built-in ranges" stacking)
3. Compact card, fallback benchmark + full profile: trust line shows
   sourceNote only (unchanged)
4. Compact card, healthy benchmark + incomplete profile: trust line shows
   "X/Y ranks — some inputs missing." (unchanged)
5. Compact card, healthy benchmark + full profile: trust line hidden (unchanged)
6. RankReportSection with nextAction + healthy source: trust line still
   suppressed under the outer gate; action slot prefix behavior unchanged

---

# Addendum: P363 — Presentation-freeze so primary interpretation stays the strongest anchor

## Task Summary
On the rank detail page, every support element below `PrimaryRankHighlight`
sits at `text-gray-400` or dimmer — except the narrative summary paragraph,
which is at `text-gray-300`. That makes the narrative the single-brightest
gray text on the page, directly under the primary anchor, verbally restating
the same tier meaning. Step the narrative one shade back to `text-gray-400`
so the primary is the undisputed visual anchor and all support text shares
one consistent brightness family.

## Goal
Primary interpretation remains the strongest anchor. No support element
(verbal or visual) competes with it. Support-text colors align into a single
tier family (gray-400 interpretation, gray-500 action prose).

## Non-Goals
- No changes to text content, `getRankNarrativeSummary`, suppression rules,
  routes, layout, card border, spacing, or structure
- No changes to `PrimaryRankHighlight`, `RankDetailExplanationBlock`, or
  per-row `RankRow`
- No new sections, no new layout patterns
- No changes to text size — narrative stays `text-sm` (one step larger than
  the explanation block's `text-xs`) to preserve its synthesis tier above
  the specific interpretation tier
- No AI API, no new UI system

## Affected Files
- `app/(app)/rank/page.tsx` — one class token on the narrative summary `<p>`:
  `text-gray-300` → `text-gray-400`

## Risks
- Cosmetic only. `text-gray-400` is the same color already used by per-row
  interpretation and the explanation block's interpretation line, so the
  narrative blends into the existing support-text family. No behavior, logic,
  or accessibility regression.
- No tests reference the narrative summary's styling (verified via grep), so
  no test updates required.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank detail page with overall + at least one other rank available,
   healthy benchmark, no rankReviewSummary, no rankInsight: narrative
   summary visibly one shade dimmer than before; primary highlight remains
   clearly the brightest/largest element
3. Narrative summary suppression rules (low-data mode, rankReviewSummary
   active, rankInsight active) behave unchanged
4. Explanation block interpretation line and per-row interpretation line
   match the narrative color (all at `text-gray-400`)
5. Action prose in explanation block still reads dimmer than interpretation
   (`text-gray-500`) — unchanged

---

# Addendum: P364 — Continuity lock across `report → detail → review`

## Task Summary
The compact surfaces (RankReportSection, RankShareCard, RankOverviewCard)
link to the rank detail page with noun-phrase labels — `'Full ranking →'`
when partial, `'Ranking detail →'` otherwise. The rank detail page's review
banner uses verb+noun labels — `'Review inputs →'` healthy, `'Check inputs →'`
fallback. The two rungs are grammatically mismatched, so the journey
report → detail → review doesn't read as one ladder. Unify the compact
labels to the verb-led `'Review ranking →'` so the healthy path shares the
verb `Review` across both rungs.

## Goal
Two healthy-path transitions, one verb family: `Review ranking →` →
`Review inputs →`. Partial/fallback states keep their existing softer
variants (partial coverage is already signaled by the trust line and rank
rows, so removing the `'Full ranking'` label variant does not lose info).

## Non-Goals
- No changes to routes (`ROUTES.rank`, `ROUTES.settings`) — preserved
- No changes to link visibility gates (`isPartial || percentile < 50` etc.)
- No changes to the detail→review banner wording (already in the
  Review/Check family)
- No changes to other in-page links, nav elements, or surface roles
- No redesign, no workflow redesign, no new labels elsewhere

## Affected Files
- `components/rank/rank-share-card.tsx` — footer link label → `'Review ranking →'`
- `components/rank/rank-report-section.tsx` — footer link label → `'Review ranking →'`
- `components/dashboard/rank-overview-card.tsx` — footer link label →
  `'Review ranking →'`; drop the now-unused `isPartial` local (was only
  referenced by the ternary label being replaced)

## Risks
- Very low. `'Review ranking →'` is the same character-count class as the
  labels it replaces, so compact surfaces don't grow heavier.
- `isPartial` stays used in RankShareCard and RankReportSection (gates the
  link visibility and the trust-line condition) — only removed in
  RankOverviewCard where it was no longer referenced after the change.
- No tests reference `'Full ranking'` / `'Ranking detail'` / `'Review ranking'`
  (verified via grep).

## Validation Steps
1. `npx tsc --noEmit` → 0 errors (and no unused-local warning from lint)
2. Dashboard: rank overview card footer reads `Review ranking →` in all
   states (partial and complete)
3. RankReportSection (compact report): footer reads `Review ranking →`
   whenever the link is shown (isPartial || primary percentile < 50)
4. RankShareCard: footer reads `Review ranking →` whenever the link is shown
5. Rank detail page review banner: healthy → `Review inputs →` (unchanged);
   fallback → `Check inputs →` (unchanged)
6. Journey check: from dashboard → rank card → `Review ranking →` →
   detail page → `Review inputs →` reads as one verbal ladder

---

# Addendum: P366 — Rank trend chart (visual percentile graph over time)

## Task Summary
Add a visual line chart showing rank percentile changes over time.
The data infrastructure already exists (useRankSnapshots stores up to 10
historical snapshots with overallPercentile and returnPercentile). But no
chart component existed — changes were only visible as text deltas and a
table. This adds a recharts LineChart rendered on the rank detail page.

## Goal
Users can see at a glance how their wealth rank and return rank have
changed over time via a simple line graph.

## Non-Goals
- No new data storage (existing snapshots are sufficient)
- No real-time data fetching (local snapshots only)
- No complex interactions (no zoom, pan, filter)
- No changes to computation logic
- No new benchmark data

## Affected Files
- `components/rank/rank-trend-chart.tsx` — NEW: recharts LineChart
  component showing two lines (wealth rank, return rank) over time
- `app/(app)/rank/page.tsx` — import + render RankTrendChart when 2+
  snapshots exist (dynamic import, SSR-disabled for recharts)

## Risks
- recharts is already in package.json (^2.15.0); no new dependency
- Dynamic import avoids SSR issues with recharts
- Chart only renders when 2+ snapshots exist (same gate as table)
- Percentile data is user's own stored data (no fabricated values)

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Rank page with 0-1 snapshots: no chart visible
3. Rank page with 2+ snapshots: line chart visible showing wealth (blue)
   and return (green) percentile lines
4. Hover tooltip shows "Top X%" per data point
5. Chart uses reversed Y-axis (lower number = better rank = higher on chart)
6. Legend shows color-coded labels for both lines

---

# Addendum: P365 — Calm-read merge for mixed low-data + fallback states

## Task Summary
In the rank detail page's summary-strip trust line, the current ternary
prioritises `confidenceNote` over `inputExplanation`. In the mixed state
(degraded benchmark source + partial profile inputs) the input caveat is
silently suppressed, forcing the user to piece together the full picture
from the Profile chip + Explanation block + missing-value markers in rank
rows. Keep the prioritisation but, in the mixed state, append
`inputExplanation` as a second short sentence inside the same trust line,
wrapped in a neutral-gray span so the source clause's severity tone is
not carried onto the factual input clause.

## Goal
Mixed states read as one calm trust sentence that keeps source and input
limitations visibly distinct, so the user doesn't have to reconcile three
scattered caveats.

## Non-Goals
- No changes to `getRankConfidenceNote`, `getRankInputExplanation`,
  `sourceNoteColor`, or any signal logic
- No changes to the other two trust-line branches (fallback + null)
- No changes to compact surfaces — the P362 single-purpose lock on
  `RankReportSection` / `RankShareCard` stays
- No changes to Profile chip, Explanation block, rank rows, or
  PrimaryRankHighlight
- No new note system, no methodology change, no AI API
- No route or structural changes

## Affected Files
- `app/(app)/rank/page.tsx` — `confidenceNote` branch of the trust-line
  ternary now appends `{inputExplanation && <span className="text-gray-600">}`
  when present; comment updated

## Risks
- Mixed-state line is one short sentence longer. At `text-xs w-full` this
  may wrap on narrow viewports (acceptable — one extra wrapped line).
- For level 'moderate' (the most common degraded state), `sourceNoteColor`
  already returns `text-gray-600`, so the new span introduces no visible
  color shift — the appended clause just flows in.
- For level 'low' (source invalid, rarer), the first clause renders in
  amber and the appended clause in gray — the color transition correctly
  marks the source-vs-input distinction.
- No tests assert the rendered line's structure.

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Healthy benchmark + full profile: trust line hidden — unchanged
3. Healthy benchmark + partial profile: trust line reads the
   `inputExplanation` only (e.g. "Based on your asset total and age.") —
   unchanged
4. Degraded benchmark (fallback/invalid/partial) + full profile: trust
   line reads the `confidenceNote` only (e.g. "Source unavailable — using
   built-in benchmarks.") — unchanged
5. Mixed state (degraded benchmark + partial profile): trust line now
   reads confidenceNote followed by the inputExplanation in one line
   (e.g. "Source unavailable — using built-in benchmarks. Based on your
   asset total and age."). First clause in severity tone; second clause
   in `text-gray-600`.
6. Visual check: on a wide viewport the line fits on one row; on narrow
   viewports it wraps to two rows — acceptable

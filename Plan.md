# Plan.md — Phase 152: Rank Report Section Detail Link

## Task Summary
Add a "View rank details →" link to RankReportSection so compact rank report
blocks have a clean entry path into the main rank detail view (/rank).

## Goal
When RankReportSection is placed on any surface (dashboard, summary widget, etc.),
users can navigate directly to the full rank detail page from it.

## Non-Goals
- No new pages or routes
- No navigation redesign
- No changes to RankOverviewCard (already has "Full breakdown →")
- No changes to rank/page.tsx
- No layout redesign of RankReportSection

## Affected Files
### Modified
- `components/rank/rank-report-section.tsx`
  — add `import { ROUTES }` from routes constants
  — change footer <p> to flex row: benchmark framing text (left) + "View rank details →" link (right)

## Risks
- Minimal. Single component, additive change only.
- RankReportSection is currently not mounted anywhere — no existing UI is affected.

## Validation Steps
1. TypeScript passes: npx tsc --noEmit
2. Component renders without error when placed on any surface
3. "View rank details →" link navigates to /rank
4. Footer layout: benchmark text left, link right
5. Existing slots (highlight, explanation, comparisonNote, nextAction) unchanged

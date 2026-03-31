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

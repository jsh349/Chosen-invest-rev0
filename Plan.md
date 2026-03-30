# Plan.md — Phase 2 Prerequisite: LOCAL_USER_ID → session.user.id

## Task Summary
Replace the hardcoded `LOCAL_USER_ID = 'local_user'` placeholder with the real
authenticated user ID from the session across all 6 usage sites in client
components and stores.

## Goal
Ensure real session user IDs flow through all data-tagging paths before Phase 2
persistence work begins. Without this, switching from localStorage to Turso would
tag all records with the string `'local_user'` regardless of who is signed in,
making per-user data isolation impossible.

## Non-Goals
- No Turso or server-side persistence changes
- No schema migration
- No new features or UI changes
- No changes to the data adapter layer
- No removal of the `LOCAL_USER_ID` constant (still used as fallback during loading)

## Constraints
- All affected files are client components (`'use client'`) — cannot call `auth()` directly
- Must use `useSession()` from `next-auth/react` (SessionProvider already wraps the app in `app/layout.tsx`)
- Fall back to `LOCAL_USER_ID` when session is unavailable (SSR hydration / loading state)
- Do not break existing functionality

## Affected Files

### New
- `lib/hooks/use-current-user-id.ts`

### Modified
- `features/ai/advisor-context.ts`        — add `userId` param, remove internal `LOCAL_USER_ID` import
- `app/(app)/dashboard/page.tsx`          — use hook, pass `userId` to `buildAdvisorContext`
- `app/(app)/portfolio/input/page.tsx`    — use hook, replace `LOCAL_USER_ID`
- `app/(app)/rank/page.tsx`               — use hook, replace `LOCAL_USER_ID`
- `lib/store/household-store.tsx`         — use hook, replace `LOCAL_USER_ID`
- `lib/store/household-notes-store.tsx`   — use hook, replace `LOCAL_USER_ID`

## Risks
- `useSession()` returns `null` during SSR hydration — fallback to `LOCAL_USER_ID` prevents blank IDs
- Adding `currentUserId` to `useCallback` deps in stores recreates callbacks on session change — acceptable and correct
- No data migration needed: localStorage is per-browser, userId change only affects newly created records

## Validation Steps
1. `npx tsc --noEmit` → 0 errors
2. Sign in → open dashboard → no runtime errors
3. Portfolio input → saved asset in localStorage has real user ID (DevTools → Application → localStorage)
4. `npm test -- --ci` → all tests pass

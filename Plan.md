# Plan.md — Category Consistency Pass

## Task Summary
Eliminate duplicate transaction category constants and add missing asset
category validation at read time, so both adapters behave consistently
before real API data is introduced.

## Goal
Single source of truth for each category list; both adapters validate
categories when reading from localStorage (or eventually an API).

## Non-Goals
- No rename of category IDs (asset slugs are already correct)
- No redesign of UI
- No schema migration
- No new features

## Findings
Asset categories are already correctly separated (slug ID stored, label
displayed via CATEGORY_MAP). Two concrete problems remain:

1. `TransactionCategory` values are defined as a union type in
   `lib/types/transaction.ts` but the equivalent runtime array is
   duplicated: once as `CATEGORIES` in `transactions/page.tsx` and once
   as `VALID_CATEGORIES` in `transactions-adapter.ts`. One constant,
   one source of truth.

2. `assets-adapter.ts` has no category validation on `getAll()` read.
   The transactions adapter gained this in the last bug fix pass.
   Assets should be consistent.

## Affected Files
### Modified
- `lib/types/transaction.ts`
  — export `TRANSACTION_CATEGORIES` array (runtime companion to the union type)
- `lib/adapters/transactions-adapter.ts`
  — import from types; remove local `VALID_CATEGORIES` Set
- `app/(app)/transactions/page.tsx`
  — import from types; remove local `CATEGORIES` array
- `lib/adapters/assets-adapter.ts`
  — add `getAll()` filter using `ASSET_CATEGORIES` keys; warn on unknown

## Risks
- Low. No stored data changes. No UI changes. Adapters become stricter on
  read, matching existing behaviour for transactions.

## Validation Steps
1. All tests pass (jest)
2. Portfolio page loads existing assets without any console warns
3. Transactions page: existing transactions load, filter dropdown works
4. Invalid category in localStorage → skipped with console.warn, rest loads

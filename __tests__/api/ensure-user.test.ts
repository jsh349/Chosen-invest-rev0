/**
 * Unit tests for ensureUser — focuses on the email UNIQUE conflict path.
 *
 * Regression: before the fix, a user who had previously signed in via one
 * OAuth provider (e.g. GitHub) and then signed in via a second provider
 * (e.g. Google) with the same email address would hit a SQLITE_CONSTRAINT_UNIQUE
 * error on `users.email`. The API route caught this as a generic 500 and
 * returned "Failed to resolve user record".
 *
 * Fix (lib/api/ensure-user.ts): catch SQLITE_CONSTRAINT_UNIQUE on users.email,
 * look up the existing user by email, and return the canonical userId so that
 * subsequent DB writes use the correct FK target.
 */

import { ensureUser } from '@/lib/api/ensure-user'

// ---------------------------------------------------------------------------
// Mock @/lib/db/turso — prevents real DB/env-var access during unit tests.
// We mock at the module level; jest.mock() is hoisted before imports.
// ---------------------------------------------------------------------------

// Track calls per operation for assertions
const calls = { insert: 0, select: 0, update: 0 }

// Configurable return values set per test
let insertResult: Promise<unknown> = Promise.resolve(undefined)
let selectResult: Promise<unknown> = Promise.resolve([])
let updateResult: Promise<unknown> = Promise.resolve(undefined)

// Drizzle chains: each method returns `this` so we need a fluent mock.
// Only `.then()` / `.catch()` / `.finally()` need to resolve the real value.
function makeInsertChain(): object {
  const p = insertResult
  const chain = {
    values:             () => chain,
    onConflictDoUpdate: () => p,
  }
  return chain
}

function makeSelectChain(): object {
  const p = selectResult
  const chain = {
    from:  () => chain,
    where: () => chain,
    limit: () => p,
  }
  return chain
}

function makeUpdateChain(): object {
  const p = updateResult
  const chain = {
    set:   () => chain,
    where: () => p,
  }
  return chain
}

jest.mock('@/lib/db/turso', () => ({
  db: {
    insert: () => { calls.insert++; return makeInsertChain() },
    select: () => { calls.select++; return makeSelectChain() },
    update: () => { calls.update++; return makeUpdateChain() },
  },
}))

// ---------------------------------------------------------------------------

beforeEach(() => {
  calls.insert = 0
  calls.select = 0
  calls.update = 0
  // Reset to safe defaults
  insertResult = Promise.resolve(undefined)
  selectResult = Promise.resolve([])
  updateResult = Promise.resolve(undefined)
})

// ---------------------------------------------------------------------------

describe('ensureUser', () => {
  it('returns the given id on successful upsert (happy path)', async () => {
    insertResult = Promise.resolve(undefined)
    const result = await ensureUser('user-abc', 'alice@example.com', 'Alice')
    expect(result).toBe('user-abc')
    expect(calls.insert).toBe(1)
    expect(calls.select).toBe(0)
  })

  it('returns the given id when no email is provided (placeholder email)', async () => {
    insertResult = Promise.resolve(undefined)
    const result = await ensureUser('user-xyz', null, null)
    expect(result).toBe('user-xyz')
    expect(calls.insert).toBe(1)
  })

  it('resolves the canonical id when the email already exists under a different user id', async () => {
    // INSERT fails with email UNIQUE constraint
    const emailConflict = Object.assign(
      new Error('UNIQUE constraint failed: users.email'),
      { code: 'SQLITE_CONSTRAINT_UNIQUE' },
    )
    insertResult = Promise.reject(emailConflict)
    // SELECT finds the existing user with a different id
    selectResult = Promise.resolve([{ id: 'canonical-user-id' }])
    updateResult = Promise.resolve(undefined)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    const result = await ensureUser('new-oauth-id', 'alice@example.com', 'Alice')
    warnSpy.mockRestore()

    expect(result).toBe('canonical-user-id')
    expect(calls.insert).toBe(1)
    expect(calls.select).toBe(1)
    expect(calls.update).toBe(1)
  })

  it('logs a warn message when the email conflict is resolved', async () => {
    const emailConflict = Object.assign(
      new Error('UNIQUE constraint failed: users.email'),
      { code: 'SQLITE_CONSTRAINT_UNIQUE' },
    )
    insertResult = Promise.reject(emailConflict)
    selectResult = Promise.resolve([{ id: 'canonical-user-id' }])
    updateResult = Promise.resolve(undefined)

    const warnSpy = jest.spyOn(console, 'warn').mockImplementation(() => {})
    await ensureUser('new-oauth-id', 'alice@example.com', 'Alice')

    expect(warnSpy).toHaveBeenCalledWith(
      expect.stringContaining('Email conflict resolved'),
    )
    warnSpy.mockRestore()
  })

  it('re-throws UNIQUE error on a non-email column (e.g. PK conflict)', async () => {
    const pkConflict = Object.assign(
      new Error('UNIQUE constraint failed: users.id'),
      { code: 'SQLITE_CONSTRAINT_UNIQUE' },
    )
    insertResult = Promise.reject(pkConflict)

    await expect(
      ensureUser('user-abc', 'alice@example.com', 'Alice'),
    ).rejects.toThrow('UNIQUE constraint failed: users.id')

    // SELECT must NOT be called — we don't try to resolve PK conflicts
    expect(calls.select).toBe(0)
  })

  it('re-throws when email conflict cannot be resolved (no matching row found)', async () => {
    const emailConflict = Object.assign(
      new Error('UNIQUE constraint failed: users.email'),
      { code: 'SQLITE_CONSTRAINT_UNIQUE' },
    )
    insertResult = Promise.reject(emailConflict)
    // No existing user found for this email — race condition or data corruption
    selectResult = Promise.resolve([])

    await expect(
      ensureUser('new-oauth-id', 'ghost@example.com', 'Ghost'),
    ).rejects.toThrow('UNIQUE constraint failed: users.email')
  })
})

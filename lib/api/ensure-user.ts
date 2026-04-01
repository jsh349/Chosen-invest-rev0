import { db } from '@/lib/db/turso'
import { users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'

/**
 * Upserts the authenticated user into the users table before any write.
 * Required because all data tables reference users.id via FK constraint.
 *
 * Returns the canonical userId to use for subsequent DB operations.
 * In the normal case this is the same as `id`. When an email conflict exists
 * (e.g. the user previously signed in via a different OAuth provider and a
 * record already exists under a different id), the existing record's id is
 * returned so FK constraints remain satisfied.
 */
export async function ensureUser(
  id: string,
  email: string | null | undefined,
  displayName: string | null | undefined,
): Promise<string> {
  const now = new Date().toISOString()
  const emailValue = email ?? `user-${id}@placeholder.local`

  try {
    await db
      .insert(users)
      .values({
        id,
        email:       emailValue,
        displayName: displayName ?? null,
        createdAt:   now,
        updatedAt:   now,
      })
      .onConflictDoUpdate({ target: users.id, set: { updatedAt: now } })
    return id
  } catch (err: unknown) {
    // Email uniqueness conflict — a record with this email already exists
    // under a different user id (e.g. a previous OAuth provider was used).
    // Find the canonical id and use it for the rest of the request.
    const isEmailConflict =
      err instanceof Error &&
      'code' in (err as Record<string, unknown>) &&
      (err as Record<string, unknown>).code === 'SQLITE_CONSTRAINT_UNIQUE' &&
      err.message.includes('users.email')

    if (!isEmailConflict) throw err

    const existing = await db
      .select({ id: users.id })
      .from(users)
      .where(eq(users.email, emailValue))
      .limit(1)

    if (existing.length > 0) {
      await db.update(users).set({ updatedAt: now }).where(eq(users.id, existing[0].id))
      console.warn(
        `[ensureUser] Email conflict resolved: session id "${id}" → canonical id "${existing[0].id}" for email "${emailValue}".`,
      )
      return existing[0].id
    }

    // Email conflict but no matching row found — race condition or data corruption.
    throw err
  }
}

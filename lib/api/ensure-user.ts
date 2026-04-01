import { db } from '@/lib/db/turso'
import { users } from '@/lib/db/schema'

/**
 * Upserts the authenticated user into the users table before any write.
 * Required because all data tables reference users.id via FK constraint.
 * email defaults to a placeholder when the auth provider does not supply one.
 */
export async function ensureUser(
  id: string,
  email: string | null | undefined,
  displayName: string | null | undefined,
): Promise<void> {
  const now = new Date().toISOString()
  await db
    .insert(users)
    .values({
      id,
      email:       email ?? `user-${id}@placeholder.local`,
      displayName: displayName ?? null,
      createdAt:   now,
      updatedAt:   now,
    })
    .onConflictDoUpdate({ target: users.id, set: { updatedAt: now } })
}

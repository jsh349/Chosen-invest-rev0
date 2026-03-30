import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { goals, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { GoalsPayloadSchema } from '@/lib/api/validators'
import type { Goal } from '@/lib/types/goal'

async function ensureUser(id: string, email: string, displayName: string | null | undefined) {
  const now = new Date().toISOString()
  await db
    .insert(users)
    .values({ id, email, displayName: displayName ?? null, createdAt: now, updatedAt: now })
    .onConflictDoUpdate({ target: users.id, set: { updatedAt: now } })
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(goals)
    .where(eq(goals.userId, session.user.id))

  const result: Goal[] = rows.map((row) => ({
    id:            row.id,
    name:          row.name,
    type:          row.type as Goal['type'],
    targetAmount:  row.targetAmountCents / 100,
    currentAmount: row.currentAmountCents / 100,
    targetDate:    row.targetDate ?? undefined,
    shared:        row.shared ?? undefined,
    createdAt:     row.createdAt,
    updatedAt:     row.updatedAt,
  }))

  return Response.json(result)
}

export async function POST(request: Request) {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let body: unknown
  try {
    body = await request.json()
  } catch {
    return Response.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = GoalsPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const userId = session.user.id
  const now    = new Date().toISOString()

  await ensureUser(userId, session.user.email ?? '', session.user.name)

  await db.delete(goals).where(eq(goals.userId, userId))

  if (parsed.data.length > 0) {
    await db.insert(goals).values(
      parsed.data.map((g) => ({
        id:                 g.id,
        userId,
        name:               g.name,
        type:               g.type,
        targetAmountCents:  Math.round(g.targetAmount * 100),
        currentAmountCents: Math.round(g.currentAmount * 100),
        targetDate:         g.targetDate ?? null,
        shared:             g.shared ?? false,
        createdAt:          g.createdAt,
        updatedAt:          g.updatedAt ?? now,
      })),
    )
  }

  return Response.json({ ok: true })
}

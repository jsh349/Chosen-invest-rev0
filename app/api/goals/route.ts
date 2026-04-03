import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { goals } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { GoalsPayloadSchema } from '@/lib/api/validators'
import { ensureUser } from '@/lib/api/ensure-user'
import type { Goal } from '@/lib/types/goal'

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
    userId:        row.userId,
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
    console.error('[POST /api/goals] Validation failed:', JSON.stringify(parsed.error.issues, null, 2))
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const now = new Date().toISOString()

  let userId: string
  try {
    userId = await ensureUser(session.user.id, session.user.email, session.user.name)
  } catch (err) {
    console.error('[POST /api/goals] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(goals).where(eq(goals.userId, userId))
      if (parsed.data.length > 0) {
        await tx.insert(goals).values(
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
    })
  } catch (err) {
    console.error('[POST /api/goals] DB transaction failed:', err)
    return Response.json({ error: 'Failed to save goals' }, { status: 500 })
  }

  return Response.json({ ok: true })
}

export async function DELETE() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  let userId: string
  try {
    userId = await ensureUser(session.user.id, session.user.email, session.user.name)
  } catch (err) {
    console.error('[DELETE /api/goals] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  await db.delete(goals).where(eq(goals.userId, userId))
  return Response.json({ ok: true })
}

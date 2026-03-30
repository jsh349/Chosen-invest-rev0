import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { transactions, users } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TransactionsPayloadSchema } from '@/lib/api/validators'
import type { Transaction } from '@/lib/types/transaction'

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
    .from(transactions)
    .where(eq(transactions.userId, session.user.id))

  const result: Transaction[] = rows.map((row) => ({
    id:          row.id,
    date:        row.date,
    description: row.description,
    amount:      row.amountCents / 100,
    category:    row.category as Transaction['category'],
    createdAt:   row.createdAt,
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

  const parsed = TransactionsPayloadSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const userId = session.user.id

  await ensureUser(userId, session.user.email ?? '', session.user.name)

  await db.delete(transactions).where(eq(transactions.userId, userId))

  if (parsed.data.length > 0) {
    await db.insert(transactions).values(
      parsed.data.map((t) => ({
        id:          t.id,
        userId,
        date:        t.date,
        description: t.description,
        amountCents: Math.round(t.amount * 100),
        category:    t.category,
        createdAt:   t.createdAt,
      })),
    )
  }

  return Response.json({ ok: true })
}

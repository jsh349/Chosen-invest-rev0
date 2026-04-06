import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { transactions } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { TransactionsPayloadSchema } from '@/lib/api/validators'
import { ensureUser } from '@/lib/api/ensure-user'
import type { Transaction } from '@/lib/types/transaction'
import { TRANSACTION_CATEGORIES } from '@/lib/types/transaction'

const VALID_TRANSACTION_CATEGORY_SET = new Set<string>(TRANSACTION_CATEGORIES)

function toTransactionCategory(raw: string, id: string): Transaction['category'] {
  if (VALID_TRANSACTION_CATEGORY_SET.has(raw)) return raw as Transaction['category']
  console.warn(`[GET /api/transactions] Unknown category "${raw}" on transaction "${id}" — coerced to 'Other'.`)
  return 'Other' as Transaction['category']
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
    userId:      row.userId,
    date:        row.date,
    description: row.description,
    amount:      row.amountCents / 100,
    category:    toTransactionCategory(row.category, row.id),
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
    console.error('[POST /api/transactions] Validation failed:', JSON.stringify(parsed.error.issues, null, 2))
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  let userId: string
  try {
    userId = await ensureUser(session.user.id, session.user.email, session.user.name)
  } catch (err) {
    console.error('[POST /api/transactions] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(transactions).where(eq(transactions.userId, userId))
      if (parsed.data.length > 0) {
        await tx.insert(transactions).values(
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
    })
  } catch (err) {
    console.error('[POST /api/transactions] DB transaction failed:', err)
    return Response.json({ error: 'Failed to save transactions' }, { status: 500 })
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
    console.error('[DELETE /api/transactions] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  await db.delete(transactions).where(eq(transactions.userId, userId))
  return Response.json({ ok: true })
}

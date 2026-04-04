import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { assets } from '@/lib/db/schema'
import { eq } from 'drizzle-orm'
import { AssetsPayloadSchema } from '@/lib/api/validators'
import { ensureUser } from '@/lib/api/ensure-user'
import type { Asset } from '@/lib/types/asset'
import { ASSET_CATEGORIES } from '@/lib/constants/asset-categories'

const VALID_ASSET_CATEGORY_SET = new Set<string>(ASSET_CATEGORIES.map((c) => c.key))

function toAssetCategory(raw: string, id: string): Asset['category'] {
  if (VALID_ASSET_CATEGORY_SET.has(raw)) return raw as Asset['category']
  console.warn(`[GET /api/assets] Unknown category "${raw}" on asset "${id}" — coerced to 'other'.`)
  return 'other' as Asset['category']
}

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(assets)
    .where(eq(assets.userId, session.user.id))

  const result: Asset[] = rows.map((row) => ({
    id:        row.id,
    userId:    row.userId,
    name:      row.name,
    category:  toAssetCategory(row.category, row.id),
    value:     row.valueCents / 100,
    currency:  row.currency,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
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

  const parsed = AssetsPayloadSchema.safeParse(body)
  if (!parsed.success) {
    console.error('[POST /api/assets] Validation failed:', JSON.stringify(parsed.error.issues, null, 2))
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  const now = new Date().toISOString()

  let userId: string
  try {
    userId = await ensureUser(session.user.id, session.user.email, session.user.name)
  } catch (err) {
    console.error('[POST /api/assets] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  try {
    await db.transaction(async (tx) => {
      await tx.delete(assets).where(eq(assets.userId, userId))
      if (parsed.data.length > 0) {
        await tx.insert(assets).values(
          parsed.data.map((a) => ({
            id:         a.id,
            userId,
            name:       a.name,
            category:   a.category,
            valueCents: Math.round(a.value * 100),
            currency:   a.currency,
            createdAt:  a.createdAt,
            updatedAt:  a.updatedAt ?? now,
          })),
        )
      }
    })
  } catch (err) {
    console.error('[POST /api/assets] DB transaction failed:', err)
    return Response.json({ error: 'Failed to save assets' }, { status: 500 })
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
    console.error('[DELETE /api/assets] ensureUser failed:', err)
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  await db.delete(assets).where(eq(assets.userId, userId))
  return Response.json({ ok: true })
}

import { auth } from '@/auth'
import { db } from '@/lib/db/turso'
import { rankSnapshots } from '@/lib/db/schema'
import { eq, desc } from 'drizzle-orm'
import { ensureUser } from '@/lib/api/ensure-user'
import { z } from 'zod'

const SnapshotSchema = z.object({
  id:                z.string().min(1),
  totalAssetValue:   z.number().finite().nonnegative(),
  overallPercentile: z.number().int().min(0).max(100).nullable(),
  agePercentile:     z.number().int().min(0).max(100).nullable(),
  returnPercentile:  z.number().int().min(0).max(100).nullable(),
  benchmarkVersion:  z.string().optional(),
  benchmarkSource:   z.string().optional(),
  savedAt:           z.string().datetime(),
})

export async function GET() {
  const session = await auth()
  if (!session?.user?.id) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const rows = await db
    .select()
    .from(rankSnapshots)
    .where(eq(rankSnapshots.userId, session.user.id))
    .orderBy(desc(rankSnapshots.savedAt))
    .limit(50)

  return Response.json(rows.map((r) => ({
    id:                r.id,
    totalAssetValue:   r.totalAssetValue / 100,
    overallPercentile: r.overallPercentile,
    agePercentile:     r.agePercentile,
    returnPercentile:  r.returnPercentile,
    benchmarkVersion:  r.benchmarkVersion,
    benchmarkSource:   r.benchmarkSource,
    savedAt:           r.savedAt,
  })))
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

  const parsed = SnapshotSchema.safeParse(body)
  if (!parsed.success) {
    return Response.json({ error: 'Invalid input', details: parsed.error.issues }, { status: 400 })
  }

  let userId: string
  try {
    userId = await ensureUser(session.user.id, session.user.email, session.user.name)
  } catch {
    return Response.json({ error: 'Failed to resolve user record' }, { status: 500 })
  }

  const d = parsed.data
  await db.insert(rankSnapshots).values({
    id:                d.id,
    userId,
    totalAssetValue:   Math.round(d.totalAssetValue * 100),
    overallPercentile: d.overallPercentile,
    agePercentile:     d.agePercentile,
    returnPercentile:  d.returnPercentile,
    benchmarkVersion:  d.benchmarkVersion ?? null,
    benchmarkSource:   d.benchmarkSource ?? null,
    savedAt:           d.savedAt,
  })

  return Response.json({ ok: true })
}

// Role: primary app data store (assets, transactions, goals, settings, users).
// Active from Phase 2+. Do NOT use Supabase for these tables. See doc/decisions.md.
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import * as schema from './schema'

const connectionUrl = process.env.TURSO_CONNECTION_URL
if (!connectionUrl) {
  throw new Error(
    '[db] Missing required environment variable: TURSO_CONNECTION_URL\n' +
    'Set TURSO_CONNECTION_URL=file:local.db for local development.',
  )
}

const turso = createClient({
  url:       connectionUrl,
  authToken: process.env.TURSO_AUTH_TOKEN,
})

export const db = drizzle(turso, { schema })

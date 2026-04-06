/**
 * Database migration script — bypasses drizzle-kit CLI.
 *
 * drizzle-kit CLI compiles drizzle.config.ts at runtime using its own
 * TypeScript loader, which can hang on Windows. This script loads .env.local
 * manually and calls drizzle-orm/libsql/migrator directly — no TypeScript
 * compilation step, works cross-platform.
 *
 * Usage: node scripts/migrate.mjs
 */
import { readFileSync, existsSync } from 'node:fs'
import { resolve } from 'node:path'
import { createClient } from '@libsql/client'
import { drizzle } from 'drizzle-orm/libsql'
import { migrate } from 'drizzle-orm/libsql/migrator'

// Load .env.local — drizzle-kit CLI may not pick it up on all platforms.
// Only sets vars that are not already set in the environment.
const envPath = resolve(process.cwd(), '.env.local')
if (existsSync(envPath)) {
  for (const line of readFileSync(envPath, 'utf8').split('\n')) {
    const trimmed = line.trim()
    if (!trimmed || trimmed.startsWith('#')) continue
    const eqIdx = trimmed.indexOf('=')
    if (eqIdx === -1) continue
    const key = trimmed.slice(0, eqIdx).trim()
    const val = trimmed.slice(eqIdx + 1).trim()
    if (key && !(key in process.env)) process.env[key] = val
  }
}

const url       = process.env.TURSO_CONNECTION_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url) {
  console.error('[migrate] Error: TURSO_CONNECTION_URL is not set in .env.local')
  process.exit(1)
}

const isLocal = url.startsWith('file:') || url.startsWith('http://localhost') || url.startsWith('libsql://localhost')
console.log(`[migrate] Target: ${isLocal ? url : url.replace(/\/\/(.+?)\./, '//***.').split('.')[0] + '…'}`)

const client = createClient({ url, authToken })
const db     = drizzle(client)

try {
  await migrate(db, { migrationsFolder: './lib/db/migrations' })
  console.log('[migrate] ✓ All migrations applied successfully')
} catch (err) {
  console.error('[migrate] Failed:', err instanceof Error ? err.message : String(err))
  process.exit(1)
} finally {
  client.close()
}

import type { Config } from 'drizzle-kit'

export default {
  schema:    './lib/db/schema.ts',
  out:       './lib/db/migrations',
  dialect:   'turso',
  dbCredentials: {
    url:       process.env.TURSO_CONNECTION_URL ?? 'file:local.db',
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
} satisfies Config

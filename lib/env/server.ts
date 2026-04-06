// Server-only: this module must never be imported from client components.
// Validated at first import — throws a clear error if any required var is absent.
import 'server-only'

function requireEnv(name: string): string {
  const value = process.env[name]
  if (!value) {
    throw new Error(
      `[env] Missing required server environment variable: ${name}\n` +
      `Check .env.local (development) or your deployment environment variables.`,
    )
  }
  return value
}

/**
 * Validated server-only environment variables.
 * Throws at module load time if any required value is missing.
 *
 * Only the highest-risk server secrets are included here.
 * Add others only if they are equally critical and server-only.
 */
export const serverEnv = {
  /** Finnhub API key — must never use NEXT_PUBLIC_ prefix */
  FINNHUB_API_KEY: requireEnv('FINNHUB_API_KEY'),
  /** Supabase service role key — bypasses row-level security */
  SUPABASE_SERVICE_ROLE_KEY: requireEnv('SUPABASE_SERVICE_ROLE_KEY'),
  /** Auth.js secret — used to sign and verify session tokens */
  AUTH_SECRET: requireEnv('AUTH_SECRET'),
}

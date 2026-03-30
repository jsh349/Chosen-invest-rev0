/**
 * Secret-leakage regression tests.
 *
 * These are static source checks — no build or real secret values required.
 *
 * Two classes of check:
 *
 *   1. Wrong-prefix scan: server-only secret names must never appear with the
 *      NEXT_PUBLIC_ prefix in any source or config file. NEXT_PUBLIC_ causes
 *      Next.js to inline the actual value into the client bundle at build time.
 *
 *   2. server-only guard present: the three entry-point files that hold or
 *      expose server secrets must still import 'server-only'. If removed,
 *      Next.js no longer enforces the server/client boundary for those modules.
 */

import fs from 'fs'
import path from 'path'

const ROOT = path.resolve(__dirname, '../..')

// ── 1. NEXT_PUBLIC_ wrong-prefix scan ──────────────────────────────────────

/**
 * Secret env var names that must NEVER use the NEXT_PUBLIC_ prefix.
 * If they did, Next.js would inline their real values into client bundles.
 */
const SERVER_ONLY_SECRETS = [
  'AUTH_SECRET',
  'SUPABASE_SERVICE_ROLE_KEY',
  'FINNHUB_API_KEY',
  'TURSO_AUTH_TOKEN',
  'AUTH_GOOGLE_SECRET',
  'AUTH_GOOGLE_ID',
]

/** Directories to scan for source files (relative to ROOT). */
const SOURCE_DIRS = ['app', 'lib', 'features', 'components']
/** Top-level files to include directly. */
const EXTRA_FILES = ['.env.local.example']

function walkDir(dir: string): string[] {
  const results: string[] = []
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      results.push(...walkDir(full))
    } else if (/\.(ts|tsx|js|mjs)$/.test(entry.name)) {
      results.push(full)
    }
  }
  return results
}

function readSourceFiles(): Array<{ file: string; content: string }> {
  const paths: string[] = []
  for (const dir of SOURCE_DIRS) {
    const abs = path.join(ROOT, dir)
    if (fs.existsSync(abs)) paths.push(...walkDir(abs))
  }
  for (const extra of EXTRA_FILES) {
    const abs = path.join(ROOT, extra)
    if (fs.existsSync(abs)) paths.push(abs)
  }
  return paths.map(abs => ({
    file: path.relative(ROOT, abs),
    content: fs.readFileSync(abs, 'utf8'),
  }))
}

describe('secret leakage — NEXT_PUBLIC_ prefix on server-only names', () => {
  const sourceFiles = readSourceFiles()

  for (const secretName of SERVER_ONLY_SECRETS) {
    const badPattern = `NEXT_PUBLIC_${secretName}`

    it(`${badPattern} must not appear in any source file`, () => {
      const violations = sourceFiles.filter(({ content }) => content.includes(badPattern))
      if (violations.length > 0) {
        const list = violations.map(v => `  ${v.file}`).join('\n')
        throw new Error(
          `"${badPattern}" found in source files.\n` +
          `The NEXT_PUBLIC_ prefix would inline the actual secret value into the client bundle.\n` +
          `Affected files:\n${list}`,
        )
      }
      expect(violations).toHaveLength(0)
    })
  }
})

// ── 2. server-only guard present ───────────────────────────────────────────

/**
 * Files that hold or expose server-only secrets must keep `import 'server-only'`.
 * If removed, Next.js no longer enforces the server/client boundary for that module.
 */
const SERVER_ONLY_GUARDED_FILES = [
  'lib/env/server.ts',       // holds AUTH_SECRET, SUPABASE_SERVICE_ROLE_KEY, FINNHUB_API_KEY
  'lib/supabase/server.ts',  // exposes createServiceClient (service role key)
  'lib/market/finnhub.ts',   // uses FINNHUB_API_KEY
]

describe('secret leakage — server-only guard intact', () => {
  for (const relPath of SERVER_ONLY_GUARDED_FILES) {
    it(`${relPath} must import 'server-only'`, () => {
      const fullPath = path.join(ROOT, relPath)
      const content = fs.readFileSync(fullPath, 'utf8')
      expect(content).toContain("import 'server-only'")
    })
  }
})

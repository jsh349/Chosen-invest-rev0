/**
 * Regression tests for the three auth release-blocking behaviors in auth.ts.
 *
 *   1. Unauthenticated /api/* requests return 401 JSON — not a browser redirect.
 *   2. AUTH_TRUST_HOST=true is rejected at startup in production.
 *   3. AUTH_URL missing or pointing at localhost is rejected at startup in production.
 *
 * Strategy: same jest.mock pattern as session-callback.test.ts. Each production
 * guard test calls jest.resetModules() + require('@/auth') so auth.ts re-runs its
 * module-level checks against the env vars set for that specific test.
 */

let capturedConfig: {
  callbacks: {
    authorized: (args: { auth: unknown; request: { nextUrl: URL } }) => unknown
  }
}

jest.mock('next-auth', () =>
  jest.fn((config: typeof capturedConfig) => {
    capturedConfig = config
    return { handlers: {}, auth: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }
  }),
)
jest.mock('next-auth/providers/google', () => jest.fn(() => ({ id: 'google' })))

/** Resets module cache and re-requires auth.ts, re-running its module-level guards. */
function loadAuth() {
  jest.resetModules()
  require('@/auth')
}

// ── 1. authorized callback ────────────────────────────────────────────────────

describe('auth.ts — authorized callback', () => {
  beforeAll(() => {
    process.env.AUTH_GOOGLE_ID     = 'test-client-id'
    process.env.AUTH_GOOGLE_SECRET = 'test-client-secret'
    // NODE_ENV is 'test' here — production guards are skipped.
    loadAuth()
  })

  it('returns 401 JSON for unauthenticated API requests', async () => {
    const nextUrl = new URL('http://localhost/api/assets')
    const result = capturedConfig.callbacks.authorized({
      auth:    null,
      request: { nextUrl },
    }) as Response
    expect(result.status).toBe(401)
    const body = await result.json()
    expect(body).toEqual({ error: 'Unauthorized' })
  })

  it('returns false (browser redirect) for unauthenticated non-API routes', () => {
    const nextUrl = new URL('http://localhost/dashboard')
    const result = capturedConfig.callbacks.authorized({
      auth:    null,
      request: { nextUrl },
    })
    expect(result).toBe(false)
  })

  it('returns true for authenticated requests', () => {
    const nextUrl = new URL('http://localhost/dashboard')
    const result = capturedConfig.callbacks.authorized({
      auth:    { user: { id: 'u1', name: 'Test' } },
      request: { nextUrl },
    })
    expect(result).toBe(true)
  })
})

// ── 2 & 3. Production startup guards ─────────────────────────────────────────

describe('auth.ts — production startup guards', () => {
  const orig = {
    NODE_ENV:       process.env.NODE_ENV,
    AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST,
    AUTH_URL:        process.env.AUTH_URL,
    NEXTAUTH_URL:    process.env.NEXTAUTH_URL,
  }

  beforeEach(() => {
    process.env.AUTH_GOOGLE_ID     = 'test-client-id'
    process.env.AUTH_GOOGLE_SECRET = 'test-client-secret'
    process.env.NODE_ENV = 'production'
    delete process.env.AUTH_TRUST_HOST
    delete process.env.AUTH_URL
    delete process.env.NEXTAUTH_URL
  })

  afterEach(() => {
    process.env.NODE_ENV = orig.NODE_ENV
    if (orig.AUTH_TRUST_HOST !== undefined) {
      process.env.AUTH_TRUST_HOST = orig.AUTH_TRUST_HOST
    } else {
      delete process.env.AUTH_TRUST_HOST
    }
    if (orig.AUTH_URL !== undefined) {
      process.env.AUTH_URL = orig.AUTH_URL
    } else {
      delete process.env.AUTH_URL
    }
    if (orig.NEXTAUTH_URL !== undefined) {
      process.env.NEXTAUTH_URL = orig.NEXTAUTH_URL
    } else {
      delete process.env.NEXTAUTH_URL
    }
  })

  // Guard 2 — AUTH_TRUST_HOST
  it('throws when AUTH_TRUST_HOST=true in production', () => {
    process.env.AUTH_TRUST_HOST = 'true'
    process.env.AUTH_URL        = 'https://app.example.com'
    expect(() => loadAuth()).toThrow('AUTH_TRUST_HOST=true must not be set in production')
  })

  // Guard 3a — AUTH_URL absent
  it('throws when AUTH_URL is not set in production', () => {
    expect(() => loadAuth()).toThrow('AUTH_URL is not set in production')
  })

  // Guard 3b — AUTH_URL pointing at localhost
  it('throws when AUTH_URL is localhost in production', () => {
    process.env.AUTH_URL = 'http://localhost:3001'
    expect(() => loadAuth()).toThrow('AUTH_URL is set to a local address in production')
  })

  // Guard 3c — AUTH_URL pointing at 127.0.0.1
  it('throws when AUTH_URL is 127.0.0.1 in production', () => {
    process.env.AUTH_URL = 'http://127.0.0.1:3001'
    expect(() => loadAuth()).toThrow('AUTH_URL is set to a local address in production')
  })

  // Happy path — valid production URL clears all guards
  it('does not throw when AUTH_URL is a valid production URL', () => {
    process.env.AUTH_URL = 'https://app.example.com'
    expect(() => loadAuth()).not.toThrow()
  })
})

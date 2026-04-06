// Tests the session callback in auth.ts in isolation.
//
// Strategy: mock next-auth so NextAuth(config) captures the callbacks without
// making real HTTP calls. Set required env vars before require('@/auth') so
// the module-level credential check does not throw.

let capturedConfig: { callbacks: { session: Function } }

jest.mock('next-auth', () =>
  jest.fn((config: typeof capturedConfig) => {
    capturedConfig = config
    return { handlers: {}, auth: jest.fn(), signIn: jest.fn(), signOut: jest.fn() }
  }),
)

jest.mock('next-auth/providers/google', () => jest.fn(() => ({ id: 'google' })))

describe('auth session callback — token.sub safety', () => {
  beforeAll(() => {
    process.env.AUTH_GOOGLE_ID     = 'test-client-id'
    process.env.AUTH_GOOGLE_SECRET = 'test-client-secret'
    // Load auth.ts after env vars are set so the startup credential guard passes.
    // jest.mock hoisting ensures next-auth is already mocked at this point.
    require('@/auth')
  })

  // Core Tier-1 regression: missing token.sub must throw, not silently set
  // session.user.id to undefined and leak an unresolvable identity downstream.
  it('throws when session.user is present but token.sub is missing', async () => {
    const session = { user: { name: 'Test', email: 'test@example.com' } }
    const token   = {}
    await expect(
      capturedConfig.callbacks.session({ session, token }),
    ).rejects.toThrow('[auth] session callback: token.sub is missing')
  })

  it('sets session.user.id from token.sub when both are present', async () => {
    const session = { user: { name: 'Test', email: 'test@example.com', id: '' } }
    const token   = { sub: 'google_uid_123' }
    const result  = await capturedConfig.callbacks.session({ session, token })
    expect(result.user.id).toBe('google_uid_123')
  })

  it('returns session unchanged when session.user is absent', async () => {
    const session = {}
    const token   = {}
    const result  = await capturedConfig.callbacks.session({ session, token })
    expect(result).toEqual({})
  })
})

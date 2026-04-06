/**
 * Health endpoint unit tests.
 *
 * Verifies the response contract so future changes to the route cannot silently
 * break shape, status, or cache directives.
 */

import { GET } from '@/app/api/health/route'

describe('GET /api/health', () => {
  it('returns HTTP 200', async () => {
    const res = await GET()
    expect(res.status).toBe(200)
  })

  it('returns JSON with status "ok"', async () => {
    const res = await GET()
    const body = await res.json()
    expect(body.status).toBe('ok')
  })

  it('returns a valid ISO timestamp', async () => {
    const res = await GET()
    const body = await res.json()
    expect(typeof body.timestamp).toBe('string')
    expect(new Date(body.timestamp).toISOString()).toBe(body.timestamp)
  })

  it('sets Cache-Control: no-store to prevent stale health responses', async () => {
    const res = await GET()
    expect(res.headers.get('cache-control')).toBe('no-store')
  })
})

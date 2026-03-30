import nextConfig from '@/next.config'

// Calls the headers() function defined in next.config.ts and returns a flat
// map of { headerKey -> headerValue } for the catch-all '/(.*)'  route.
async function getConfiguredHeaders(): Promise<Record<string, string>> {
  const rules = await nextConfig.headers!()
  const catchAll = rules.find((r) => r.source === '/(.*)')
  if (!catchAll) throw new Error('No catch-all header rule found in next.config.ts')
  return Object.fromEntries(catchAll.headers.map((h) => [h.key, h.value]))
}

describe('HTTP security headers — next.config.ts', () => {
  let headers: Record<string, string>

  beforeAll(async () => {
    headers = await getConfiguredHeaders()
  })

  it('sets X-Frame-Options to DENY', () => {
    expect(headers['X-Frame-Options']).toBe('DENY')
  })

  it('sets X-Content-Type-Options to nosniff', () => {
    expect(headers['X-Content-Type-Options']).toBe('nosniff')
  })

  it('sets Referrer-Policy to strict-origin-when-cross-origin', () => {
    expect(headers['Referrer-Policy']).toBe('strict-origin-when-cross-origin')
  })

  it('sets Content-Security-Policy-Report-Only (present and non-empty)', () => {
    const csp = headers['Content-Security-Policy-Report-Only']
    expect(csp).toBeTruthy()
    expect(typeof csp).toBe('string')
  })

  it('CSP includes default-src self', () => {
    expect(headers['Content-Security-Policy-Report-Only']).toContain("default-src 'self'")
  })

  it('CSP includes frame-ancestors none (clickjacking fallback)', () => {
    expect(headers['Content-Security-Policy-Report-Only']).toContain("frame-ancestors 'none'")
  })

  it('CSP allows Google Fonts stylesheet origin', () => {
    expect(headers['Content-Security-Policy-Report-Only']).toContain('https://fonts.googleapis.com')
  })

  it('CSP allows Google Fonts file origin', () => {
    expect(headers['Content-Security-Policy-Report-Only']).toContain('https://fonts.gstatic.com')
  })
})

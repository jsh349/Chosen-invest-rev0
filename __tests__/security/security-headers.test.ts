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

  it('sets Strict-Transport-Security (HSTS)', () => {
    expect(headers['Strict-Transport-Security']).toContain('max-age=')
    expect(headers['Strict-Transport-Security']).toContain('includeSubDomains')
  })

  it('sets Permissions-Policy restricting unused browser features', () => {
    const pp = headers['Permissions-Policy']
    expect(pp).toBeTruthy()
    expect(pp).toContain('camera=()')
    expect(pp).toContain('microphone=()')
    expect(pp).toContain('geolocation=()')
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

// ── Clickjacking protection ───────────────────────────────────────────────────
// Two independent mechanisms guard against framing attacks:
//   X-Frame-Options     : legacy header, honoured by all browsers — actively blocks.
//   CSP frame-ancestors : modern override for CSP Level 2+ browsers.
//
// IMPORTANT: frame-ancestors is currently in Content-Security-Policy-Report-Only
// (violations are logged but NOT blocked). X-Frame-Options is therefore the
// sole active clickjacking barrier until CSP is promoted to enforcement mode.
describe('clickjacking protection', () => {
  let headers: Record<string, string>

  beforeAll(async () => {
    headers = await getConfiguredHeaders()
  })

  it('X-Frame-Options DENY is present — active blocking mechanism', () => {
    expect(headers['X-Frame-Options']).toBe('DENY')
  })

  it('CSP frame-ancestors none is declared — ready for enforcement promotion', () => {
    expect(headers['Content-Security-Policy-Report-Only']).toContain("frame-ancestors 'none'")
  })

  // This test documents that CSP is still in report-only mode.
  // When promoting CSP to enforcement (Content-Security-Policy key), remove this
  // assertion and add a test that Content-Security-Policy also contains frame-ancestors.
  it('CSP enforcement header is not yet active — X-Frame-Options carries the full load', () => {
    expect(headers['Content-Security-Policy']).toBeUndefined()
  })
})

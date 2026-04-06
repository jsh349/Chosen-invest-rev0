export const ROUTES = {
  home:           '/',
  login:          '/login',
  signup:         '/signup',
  dashboard:      '/dashboard',
  portfolioInput: '/portfolio/input',
  portfolioList:  '/portfolio/list',
  market:         '/market',
  goals:          '/goals',
  transactions:   '/transactions',
  household:      '/household',
  taxOpportunity: '/tax-opportunity',
  rank:           '/rank',
  analysis:       '/analysis',
  ai:             '/ai',
  settings:       '/settings',
} as const

/**
 * Route prefixes that are publicly accessible without authentication.
 * The auth middleware protects every other path — add new public routes here.
 * Note: '/' is excluded from the middleware matcher entirely (see middleware.ts).
 *
 * API routes: list only the specific paths that are intentionally public.
 * Do NOT use '/api/' as a blanket prefix — new API routes must be protected
 * by default. The api/auth/* callbacks are already excluded from the middleware
 * matcher in middleware.ts and do not need to be listed here.
 */
export const PUBLIC_PATHS = [
  ROUTES.login,       // /login
  ROUTES.signup,      // /signup
  '/api/health',      // health check — intentionally public, no auth required
] as const

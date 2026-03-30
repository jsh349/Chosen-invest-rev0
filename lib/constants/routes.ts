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
 */
export const PUBLIC_PATHS = [
  ROUTES.login,    // /login
  ROUTES.signup,   // /signup
  '/api/',         // all API routes (auth callbacks, etc.)
] as const

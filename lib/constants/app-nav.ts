import { ROUTES } from './routes'

export type NavItem = {
  label: string
  href: string
  icon: string
  active: boolean
}

export const APP_NAV_ITEMS = [
  { label: 'Dashboard',  href: ROUTES.dashboard,      icon: 'LayoutDashboard' },
  { label: 'Portfolio',  href: ROUTES.portfolioInput,  icon: 'Briefcase' },
  { label: 'Analysis',   href: ROUTES.analysis,        icon: 'BarChart2' },
  { label: 'AI Advisor', href: ROUTES.ai,              icon: 'Sparkles' },
  { label: 'Settings',   href: ROUTES.settings,        icon: 'Settings' },
] as const

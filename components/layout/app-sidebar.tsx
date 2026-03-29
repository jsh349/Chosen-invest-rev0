'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  Briefcase,
  TrendingUp,
  BarChart2,
  Sparkles,
  Settings,
  Target,
  ArrowLeftRight,
  Users,
  Trophy,
} from 'lucide-react'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'

const NAV_ITEMS = [
  { label: 'Dashboard',  href: ROUTES.dashboard,      Icon: LayoutDashboard },
  { label: 'Portfolio',  href: ROUTES.portfolioList,   Icon: Briefcase       },
  { label: 'Goals',        href: ROUTES.goals,          Icon: Target          },
  { label: 'Transactions', href: ROUTES.transactions,   Icon: ArrowLeftRight  },
  { label: 'Household',   href: ROUTES.household,       Icon: Users           },
  { label: 'Rank',       href: ROUTES.rank,             Icon: Trophy          },
  { label: 'Market',     href: ROUTES.market,          Icon: TrendingUp      },
  { label: 'Analysis',   href: ROUTES.analysis,        Icon: BarChart2       },
  { label: 'AI Advisor', href: ROUTES.ai,              Icon: Sparkles        },
  { label: 'Settings',   href: ROUTES.settings,        Icon: Settings        },
]

export function AppSidebar() {
  const pathname = usePathname()

  return (
    <aside className="hidden w-56 flex-shrink-0 border-r border-surface-border bg-surface-card lg:flex lg:flex-col">
      {/* Logo */}
      <div className="flex h-16 items-center px-5 border-b border-surface-border">
        <Link href={ROUTES.dashboard} className="text-base font-bold text-white">
          Chosen<span className="text-brand-400">Invest</span>
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto p-3">
        {NAV_ITEMS.map(({ label, href, Icon }) => {
          const active = pathname === href || pathname.startsWith(href + '/')
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors',
                active
                  ? 'bg-brand-950 text-brand-300 font-medium'
                  : 'text-gray-400 hover:bg-surface-muted hover:text-white'
              )}
            >
              <Icon className="h-4 w-4 flex-shrink-0" />
              {label}
            </Link>
          )
        })}
      </nav>

      <div className="border-t border-surface-border p-4">
        <p className="text-xs text-gray-600">MVP · Phase 2</p>
      </div>
    </aside>
  )
}

'use client'

import Link from 'next/link'
import { signOut, useSession } from 'next-auth/react'
import { LogOut, User } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

export function AppHeader() {
  const { data: session } = useSession()

  return (
    <header className="flex h-16 items-center justify-between border-b border-surface-border bg-surface-card px-4 lg:px-6">
      {/* Mobile logo */}
      <Link href={ROUTES.dashboard} className="text-sm font-bold text-white lg:hidden">
        Chosen<span className="text-brand-400">Invest</span>
      </Link>

      <div className="hidden lg:block" />

      {/* Right actions */}
      <div className="flex items-center gap-3">
        {session?.user?.name && (
          <span className="hidden text-sm text-gray-400 sm:block">
            {session.user.name}
          </span>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => signOut({ callbackUrl: ROUTES.login })}
          title="Sign out"
        >
          <LogOut className="h-4 w-4" />
        </Button>
      </div>
    </header>
  )
}

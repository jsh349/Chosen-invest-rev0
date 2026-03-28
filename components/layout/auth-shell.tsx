import Link from 'next/link'
import { ROUTES } from '@/lib/constants/routes'

interface AuthShellProps {
  children: React.ReactNode
}

export function AuthShell({ children }: AuthShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-surface">
      <header className="flex h-14 items-center px-6">
        <Link href={ROUTES.home} className="text-sm font-semibold text-white">
          Chosen<span className="text-brand-400">Invest</span>
        </Link>
      </header>
      <main className="flex flex-1 items-center justify-center px-4 py-12">
        {children}
      </main>
    </div>
  )
}

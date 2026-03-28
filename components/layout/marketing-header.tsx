import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Container } from '@/components/ui/container'
import { ROUTES } from '@/lib/constants/routes'

export function MarketingHeader() {
  return (
    <header className="sticky top-0 z-40 border-b border-surface-border bg-surface/80 backdrop-blur-md">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <Link href={ROUTES.home} className="flex items-center gap-2">
            <span className="text-lg font-bold text-white tracking-tight">
              Chosen<span className="text-brand-400">Invest</span>
            </span>
          </Link>
          <nav className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild>
              <Link href={ROUTES.login}>Sign In</Link>
            </Button>
            <Button size="sm" asChild>
              <Link href={ROUTES.login}>Get Started</Link>
            </Button>
          </nav>
        </div>
      </Container>
    </header>
  )
}

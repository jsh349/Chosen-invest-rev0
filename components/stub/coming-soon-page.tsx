import { Clock } from 'lucide-react'
import Link from 'next/link'
import { buttonVariants } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

interface ComingSoonPageProps {
  title: string
  description?: string
}

export function ComingSoonPage({
  title,
  description = 'This feature is being built. Check back soon.',
}: ComingSoonPageProps) {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4">
      <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-2xl border border-surface-border bg-surface-card">
        <Clock className="h-6 w-6 text-gray-500" />
      </div>
      <h1 className="mb-2 text-xl font-semibold text-white">{title}</h1>
      <p className="mb-6 max-w-sm text-sm text-gray-500">{description}</p>
      <Link href={ROUTES.dashboard} className={buttonVariants({ variant: 'outline' })}>
        Back to Dashboard
      </Link>
    </div>
  )
}

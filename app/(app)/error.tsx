'use client'

import { useEffect } from 'react'
import { buttonVariants } from '@/components/ui/button'

/**
 * Route-level error boundary for the (app) layout.
 * Catches unhandled throws in any page under this layout group
 * and shows a recovery UI instead of a blank white screen.
 */
export default function AppError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('[app] unhandled error:', error)
  }, [error])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center text-center px-4 gap-4">
      <p className="text-sm font-semibold text-white">Something went wrong</p>
      <p className="max-w-xs text-xs text-gray-500 leading-relaxed">
        An unexpected error occurred. Your data is not affected — try refreshing the page.
      </p>
      <div className="flex gap-3">
        <button onClick={reset} className={buttonVariants({ size: 'sm' })}>
          Try again
        </button>
        <button
          onClick={() => window.location.assign('/')}
          className={buttonVariants({ variant: 'outline', size: 'sm' })}
        >
          Go home
        </button>
      </div>
      {error.digest && (
        <p className="text-[10px] text-gray-700">Error ID: {error.digest}</p>
      )}
    </div>
  )
}

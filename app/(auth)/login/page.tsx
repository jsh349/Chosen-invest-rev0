'use client'

import { signIn } from 'next-auth/react'
import { useState, Suspense } from 'react'
import { useSearchParams } from 'next/navigation'
import { Chrome, AlertCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

function oauthErrorMessage(code: string | null): string | null {
  if (!code) return null
  if (code === 'AccessDenied') return 'Access was denied. Please try again or use a different account.'
  if (code === 'OAuthAccountNotLinked') return 'This email is already linked to another sign-in method.'
  // Covers OAuthSignin, OAuthCallback, Configuration, Default, and unknown codes
  return 'Sign-in failed. Please try again.'
}

function LoginForm() {
  const [loading, setLoading] = useState(false)
  const searchParams = useSearchParams()
  const errorMessage = oauthErrorMessage(searchParams.get('error'))

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: ROUTES.portfolioInput })
    setLoading(false)
  }

  return (
    <div className="rounded-2xl border border-surface-border bg-surface-card p-8 space-y-4">
      {errorMessage && (
        <div className="flex items-start gap-2 rounded-lg border border-red-900/50 bg-red-950/40 px-3 py-2.5 text-xs text-red-300">
          <AlertCircle className="mt-0.5 h-3.5 w-3.5 shrink-0 text-red-400" />
          {errorMessage}
        </div>
      )}

      <Button
        size="lg"
        variant="outline"
        className="w-full"
        onClick={handleGoogleSignIn}
        disabled={loading}
      >
        <Chrome className="h-4 w-4" />
        {loading ? 'Signing in…' : 'Continue with Google'}
      </Button>

      <p className="text-center text-xs text-gray-600">
        By continuing, you agree to our terms of service.
      </p>
    </div>
  )
}

export default function LoginPage() {
  return (
    <div className="w-full max-w-sm space-y-6">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-gray-400">
          Access your financial dashboard
        </p>
      </div>

      <Suspense fallback={
        <div className="rounded-2xl border border-surface-border bg-surface-card p-8 space-y-4">
          <div className="h-10 animate-pulse rounded-lg bg-surface-muted" />
        </div>
      }>
        <LoginForm />
      </Suspense>

      <p className="text-center text-xs text-gray-600">
        ChosenInvest is for informational purposes only.
        <br />
        Not financial advice.
      </p>
    </div>
  )
}

'use client'

import { signIn } from 'next-auth/react'
import { useState } from 'react'
import { Chrome } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ROUTES } from '@/lib/constants/routes'

export default function LoginPage() {
  const [loading, setLoading] = useState(false)

  async function handleGoogleSignIn() {
    setLoading(true)
    await signIn('google', { callbackUrl: ROUTES.dashboard })
    setLoading(false)
  }

  return (
    <div className="w-full max-w-sm space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-2xl font-bold text-white">Sign in</h1>
        <p className="mt-2 text-sm text-gray-400">
          Access your financial dashboard
        </p>
      </div>

      {/* Card */}
      <div className="rounded-2xl border border-surface-border bg-surface-card p-8 space-y-4">
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

      <p className="text-center text-xs text-gray-600">
        ChosenInvest is for informational purposes only.
        <br />
        Not financial advice.
      </p>
    </div>
  )
}

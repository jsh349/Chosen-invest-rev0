'use client'

import { ShieldAlert, CheckCircle2, AlertTriangle } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import type { Asset } from '@/lib/types/asset'

// Categories that commonly have tax implications
const TAXABLE_CATEGORIES = new Set(['stock', 'etf', 'crypto'])

type TaxStatus = 'none' | 'review'

function evaluateTaxOpportunity(assets: Asset[]): {
  status: TaxStatus
  headline: string
  explanation: string
} {
  const taxableAssets = assets.filter((a) => TAXABLE_CATEGORIES.has(a.category))

  if (taxableAssets.length === 0) {
    return {
      status: 'none',
      headline: 'No taxable investment assets detected',
      explanation:
        'Your portfolio does not currently include stocks, ETFs, or crypto. No tax-loss harvesting opportunities identified at this time.',
    }
  }

  const categories = [...new Set(taxableAssets.map((a) => a.category))]
  const categoryLabel = categories
    .map((c) => (c === 'etf' ? 'ETF' : c.charAt(0).toUpperCase() + c.slice(1)))
    .join(', ')

  return {
    status: 'review',
    headline: 'Tax review opportunity detected',
    explanation: `You hold taxable investment assets (${categoryLabel}). Consider reviewing unrealised gains or losses with a tax advisor before year-end to identify potential tax optimisation opportunities.`,
  }
}

export function TaxOpportunityCard({ assets }: { assets: Asset[] }) {
  const { status, headline, explanation } = evaluateTaxOpportunity(assets)

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldAlert className="h-4 w-4 text-gray-400" />
          Tax Opportunity
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">

        {/* Status row */}
        <div className="flex items-center gap-2">
          {status === 'none' ? (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-500" />
          ) : (
            <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
          )}
          <span className={`text-sm font-medium ${status === 'none' ? 'text-gray-400' : 'text-yellow-300'}`}>
            {headline}
          </span>
        </div>

        {/* Explanation */}
        <p className="text-sm text-gray-500">{explanation}</p>

        {/* Caution note */}
        <p className="rounded-lg bg-surface-muted/40 px-3 py-2 text-xs text-gray-500">
          This is informational only. Chosen Invest does not execute trades or provide personalised tax advice. Consult a qualified tax professional before making any decisions.
        </p>

      </CardContent>
    </Card>
  )
}

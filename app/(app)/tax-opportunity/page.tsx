'use client'

import Link from 'next/link'
import { ArrowLeft, ShieldAlert, CheckCircle2, AlertTriangle, Calendar } from 'lucide-react'
import { useAssets } from '@/lib/store/assets-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { ROUTES } from '@/lib/constants/routes'
import type { Asset } from '@/lib/types/asset'
import { LoadingSpinner } from '@/components/ui/loading-spinner'

const TAXABLE_CATEGORIES = new Set(['stock', 'etf', 'crypto'])

type TaxStatus = 'none' | 'review'

type TaxDetail = {
  status: TaxStatus
  headline: string
  explanation: string
  cautions: string[]
  nextReview: string
}

function evaluateTaxDetail(assets: Asset[]): TaxDetail {
  const taxableAssets = assets.filter((a) => TAXABLE_CATEGORIES.has(a.category))

  if (taxableAssets.length === 0) {
    return {
      status:      'none',
      headline:    'No taxable investment assets detected',
      explanation: 'Your portfolio does not currently include stocks, ETFs, or crypto holdings. There are no tax-loss harvesting opportunities to review at this time.',
      cautions: [
        'If you add investment assets in the future, return here to review your tax position.',
        'Cash, real estate, and retirement accounts may have their own tax considerations — consult a tax professional for personalised guidance.',
      ],
      nextReview: 'Review again after adding investment assets.',
    }
  }

  const categories = [...new Set(taxableAssets.map((a) => a.category))]
  const categoryLabel = categories
    .map((c) => (c === 'etf' ? 'ETF' : c.charAt(0).toUpperCase() + c.slice(1)))
    .join(', ')

  const totalTaxableValue = taxableAssets.reduce((s, a) => s + a.value, 0)
  const formattedValue = totalTaxableValue.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

  return {
    status:      'review',
    headline:    'Tax review opportunity identified',
    explanation: `You hold ${taxableAssets.length} taxable investment asset${taxableAssets.length > 1 ? 's' : ''} (${categoryLabel}) with a combined recorded value of ${formattedValue}. Before year-end, consider reviewing unrealised gains and losses with a qualified tax advisor to identify potential optimisation opportunities.`,
    cautions: [
      'This summary is based on your manually entered asset values. It does not reflect real-time market prices or lot-level cost basis.',
      'Tax-loss harvesting involves selling assets at a loss to offset gains. Timing, wash-sale rules, and jurisdiction-specific rules apply — always consult a tax professional.',
      'Chosen Invest does not execute trades or submit tax filings on your behalf.',
    ],
    nextReview: 'Consider reviewing your tax position quarterly, or before significant portfolio changes.',
  }
}

function CautionItem({ text }: { text: string }) {
  return (
    <li className="flex items-start gap-2 text-xs text-gray-400">
      <span className="mt-1 h-1.5 w-1.5 shrink-0 rounded-full bg-yellow-500" />
      {text}
    </li>
  )
}

export default function TaxOpportunityPage() {
  const { assets, isLoaded } = useAssets()

  if (!isLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  const detail = evaluateTaxDetail(assets)

  return (
    <div className="space-y-6">
      <Link href={ROUTES.dashboard} className="flex items-center gap-1.5 text-sm text-gray-400 hover:text-white transition-colors w-fit">
        <ArrowLeft className="h-4 w-4" />
        Back to Dashboard
      </Link>

      <div className="flex items-start gap-3">
        <ShieldAlert className="mt-0.5 h-5 w-5 shrink-0 text-gray-400" />
        <div>
          <h1 className="text-xl font-bold text-white">Tax Opportunity</h1>
          <p className="mt-0.5 text-sm text-gray-500">Advisory summary — informational only</p>
        </div>
      </div>

      {/* Status card */}
      <Card>
        <CardHeader>
          <CardTitle>Current Status</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center gap-2">
            {detail.status === 'none' ? (
              <CheckCircle2 className="h-4 w-4 shrink-0 text-gray-500" />
            ) : (
              <AlertTriangle className="h-4 w-4 shrink-0 text-yellow-400" />
            )}
            <span className={`text-sm font-medium ${detail.status === 'none' ? 'text-gray-400' : 'text-yellow-300'}`}>
              {detail.headline}
            </span>
          </div>
          <p className="text-sm text-gray-400 leading-relaxed">{detail.explanation}</p>
        </CardContent>
      </Card>

      {/* Caution notes */}
      <Card>
        <CardHeader>
          <CardTitle>Important Cautions</CardTitle>
        </CardHeader>
        <CardContent>
          <ul className="space-y-3">
            {detail.cautions.map((c, i) => (
              <CautionItem key={i} text={c} />
            ))}
          </ul>
        </CardContent>
      </Card>

      {/* Next review */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-gray-400" />
            Next Review Suggestion
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-gray-400">{detail.nextReview}</p>
        </CardContent>
      </Card>

      {/* Disclaimer */}
      <p className="rounded-xl border border-surface-border bg-surface-muted/20 px-4 py-3 text-xs text-gray-600 leading-relaxed">
        Chosen Invest is not a licensed tax advisor. All content on this page is for informational purposes only and does not constitute tax, legal, or financial advice. Consult a qualified professional before making any decisions.
      </p>
    </div>
  )
}

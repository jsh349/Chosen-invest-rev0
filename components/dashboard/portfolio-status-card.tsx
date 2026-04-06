'use client'

import { Card, CardContent } from '@/components/ui/card'
import type { PortfolioSummary } from '@/lib/types/dashboard'

type StatusLevel = 'incomplete' | 'concentrated' | 'low_liquidity' | 'needs_review' | 'stable'

type PortfolioStatus = {
  level: StatusLevel
  label: string
  notes: string[]
}

const STYLE: Record<StatusLevel, { badge: string; dot: string }> = {
  incomplete:    { badge: 'bg-gray-800 text-gray-400',           dot: 'bg-gray-500'   },
  concentrated:  { badge: 'bg-amber-950/60 text-amber-400',      dot: 'bg-amber-400'  },
  low_liquidity: { badge: 'bg-amber-950/60 text-amber-400',      dot: 'bg-amber-400'  },
  needs_review:  { badge: 'bg-amber-950/60 text-amber-400',      dot: 'bg-amber-400'  },
  stable:        { badge: 'bg-emerald-950/60 text-emerald-400',  dot: 'bg-emerald-400'},
}

function evaluate(summary: PortfolioSummary): PortfolioStatus {
  if (summary.assetCount === 0) {
    return {
      level: 'incomplete',
      label: 'Incomplete',
      notes: ['No assets have been added yet.'],
    }
  }

  const notes: string[] = []

  // Concentration check: any category over 70%
  const top = summary.categoryBreakdown[0]
  const isConcentrated = top && top.percentage > 70

  if (isConcentrated) {
    notes.push(`${top.label} makes up ${top.percentage.toFixed(0)}% of your portfolio.`)
  }

  // Liquidity check: cash & savings under 5%
  const cash = summary.categoryBreakdown.find((s) => s.category === 'cash')
  const cashPct = cash ? cash.percentage : 0
  const isLowLiquidity = cashPct < 5

  if (isLowLiquidity) {
    notes.push('Less than 5% held in cash and savings.')
  }

  if (isConcentrated && isLowLiquidity) {
    return { level: 'needs_review', label: 'Needs Review', notes: notes.slice(0, 2) }
  }
  if (isConcentrated) {
    return { level: 'concentrated', label: 'Concentrated', notes }
  }
  if (isLowLiquidity) {
    return { level: 'low_liquidity', label: 'Low Liquidity', notes }
  }

  return {
    level: 'stable',
    label: 'Stable',
    notes: ['Portfolio appears reasonably diversified.'],
  }
}

interface PortfolioStatusCardProps {
  summary: PortfolioSummary
}

export function PortfolioStatusCard({ summary }: PortfolioStatusCardProps) {
  const status = evaluate(summary)
  const style = STYLE[status.level]

  return (
    <Card>
      <CardContent className="flex flex-col gap-3 pt-5">
        <div className="flex items-center justify-between">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            Portfolio Status
          </p>
          <span className={`flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-semibold ${style.badge}`}>
            <span className={`h-1.5 w-1.5 rounded-full ${style.dot}`} />
            {status.label}
          </span>
        </div>

        <ul className="space-y-1">
          {status.notes.map((note) => (
            <li key={note} className="text-sm text-gray-400">
              {note}
            </li>
          ))}
        </ul>

        <p className="text-xs text-gray-600">
          For reference only. Not financial advice.
        </p>
      </CardContent>
    </Card>
  )
}

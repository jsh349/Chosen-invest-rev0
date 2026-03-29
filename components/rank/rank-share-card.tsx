'use client'

import type { RankResult } from '@/lib/types/rank'

// The three ranks shown in the share card — age+gender omitted (optional profile data)
const SHARE_TYPES = ['overall_wealth', 'age_based', 'investment_return'] as const

type Props = {
  ranks: RankResult[]
}

function ShareRow({ result }: { result: RankResult }) {
  const topPct = result.percentile != null ? 100 - result.percentile : null
  return (
    <div className="flex items-center justify-between py-2.5">
      <span className="text-xs text-gray-400">{result.label}</span>
      {topPct != null ? (
        <span className="text-sm font-semibold text-white tabular-nums">Top {topPct}%</span>
      ) : (
        <span className="text-xs text-gray-600">—</span>
      )}
    </div>
  )
}

export function RankShareCard({ ranks }: Props) {
  const displayed = SHARE_TYPES
    .map((type) => ranks.find((r) => r.type === type))
    .filter((r): r is RankResult => r != null)

  const dateStr = new Date().toLocaleDateString('en-US', {
    month: 'short', day: 'numeric', year: 'numeric',
  })

  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Summary</p>
        <span className="text-[10px] text-gray-600">{dateStr}</span>
      </div>
      <div className="divide-y divide-surface-border">
        {displayed.map((r) => <ShareRow key={r.type} result={r} />)}
      </div>
      <p className="pt-1 text-[10px] text-gray-600 leading-relaxed">
        Benchmark-based estimate · not financial advice · Chosen Invest
      </p>
    </div>
  )
}

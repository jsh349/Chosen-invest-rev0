'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Settings, Users } from 'lucide-react'
import { useAssets } from '@/lib/store/assets-store'
import { useHousehold } from '@/lib/store/household-store'
import { useSettings } from '@/lib/store/settings-store'
import { computeOverallWealthRank, computeAgeBasedRank, computeAgeGenderRank, computeReturnRank } from '@/features/dashboard/rank'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { LOCAL_USER_ID } from '@/lib/constants/auth'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { RankResult } from '@/lib/types/rank'

type RankMode = 'individual' | 'household'

function percentileColor(percentile: number): string {
  if (percentile >= 75) return 'text-emerald-400'
  if (percentile >= 50) return 'text-brand-400'
  if (percentile >= 30) return 'text-amber-400'
  return 'text-gray-400'
}

function PercentileBar({ percentile }: { percentile: number }) {
  const color =
    percentile >= 75 ? 'bg-emerald-500' :
    percentile >= 50 ? 'bg-brand-500' :
    percentile >= 30 ? 'bg-amber-400' :
    'bg-gray-500'
  return (
    <div className="h-1.5 w-full rounded-full bg-surface-muted">
      <div
        className={cn('h-full rounded-full transition-all', color)}
        style={{ width: `${Math.min(100, percentile)}%` }}
      />
    </div>
  )
}

function RankRow({ result }: { result: RankResult }) {
  const hasPct = result.percentile != null
  const topPct = hasPct ? 100 - result.percentile! : null

  return (
    <div className="border-b border-surface-border py-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {result.label}
          </p>
          {topPct != null ? (
            <p className={cn('text-3xl font-bold tracking-tight', percentileColor(result.percentile!))}>
              Top {topPct}%
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-600">—</p>
          )}
          <p className="text-sm text-gray-400 leading-relaxed">{result.message}</p>
          {hasPct && (
            <div className="pt-1">
              <PercentileBar percentile={result.percentile!} />
              <div className="mt-1 flex justify-between text-[10px] text-gray-600">
                <span>0th</span>
                <span>50th</span>
                <span>100th</span>
              </div>
            </div>
          )}
        </div>
        {hasPct && (
          <div className="shrink-0 text-right">
            <span className={cn('text-sm font-semibold tabular-nums', percentileColor(result.percentile!))}>
              {result.percentile}th pct.
            </span>
          </div>
        )}
      </div>
      {result.missingField && (
        <Link
          href={ROUTES.settings}
          className="mt-3 inline-flex items-center gap-1.5 text-xs text-brand-400 hover:text-brand-300 transition-colors"
        >
          <Settings className="h-3 w-3" />
          Set {result.missingField} in Settings
        </Link>
      )}
    </div>
  )
}

function ModeToggle({ mode, onChange }: { mode: RankMode; onChange: (m: RankMode) => void }) {
  return (
    <div className="flex gap-1 rounded-lg border border-surface-border bg-surface-muted p-1 w-fit">
      {(['individual', 'household'] as RankMode[]).map((m) => (
        <button
          key={m}
          onClick={() => onChange(m)}
          className={cn(
            'rounded-md px-3 py-1.5 text-xs font-medium capitalize transition-colors',
            mode === m
              ? 'bg-surface-card text-white shadow-sm'
              : 'text-gray-500 hover:text-gray-300'
          )}
        >
          {m}
        </button>
      ))}
    </div>
  )
}

export default function RankPage() {
  const { assets, isLoaded: assetsLoaded } = useAssets()
  const { members, isLoaded: householdLoaded } = useHousehold()
  const { settings } = useSettings()
  const { compact } = useFormatCurrency()
  const [mode, setMode] = useState<RankMode>('individual')

  if (!assetsLoaded || !householdLoaded) return <LoadingSpinner />

  const summary = buildPortfolioSummary(LOCAL_USER_ID, assets)
  const userAge = settings.birthYear
    ? new Date().getFullYear() - settings.birthYear
    : undefined

  const ranks: RankResult[] = [
    computeOverallWealthRank(summary.totalAssetValue),
    computeAgeBasedRank(summary.totalAssetValue, userAge),
    computeAgeGenderRank(summary.totalAssetValue, userAge, settings.gender),
    computeReturnRank(settings.annualReturnPct),
  ]

  const availableCount = ranks.filter((r) => r.percentile != null).length
  const hasHouseholdMembers = members.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Wealth Rank</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            How your portfolio compares to reference benchmark ranges
          </p>
        </div>
        <ModeToggle mode={mode} onChange={setMode} />
      </div>

      {/* Household mode — informational state */}
      {mode === 'household' && (
        <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-6 space-y-3">
          <div className="flex items-center gap-2 text-gray-400">
            <Users className="h-4 w-4 shrink-0" />
            <p className="text-sm font-medium">Household Rank</p>
          </div>
          {!hasHouseholdMembers ? (
            <>
              <p className="text-sm text-gray-500">
                No household members have been added yet.
              </p>
              <Link
                href={ROUTES.household}
                className="inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Set up household →
              </Link>
            </>
          ) : (
            <>
              <p className="text-sm text-gray-500">
                You have {members.length} household {members.length === 1 ? 'member' : 'members'}.
                Household rank comparison requires individual asset values per member, which are not tracked yet.
              </p>
              <p className="text-xs text-gray-600">
                Combined household rank will be available when per-member asset tracking is added.
              </p>
            </>
          )}
        </div>
      )}

      {/* Individual mode content */}
      {mode === 'individual' && (
        <>
          {/* Summary strip */}
          {summary.assetCount > 0 && (
            <div className="flex flex-wrap gap-4 rounded-xl border border-surface-border bg-surface-card px-5 py-4">
              <div>
                <p className="text-xs text-gray-500">Total Assets</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{compact(summary.totalAssetValue)}</p>
              </div>
              <div>
                <p className="text-xs text-gray-500">Ranks Available</p>
                <p className="mt-0.5 text-sm font-semibold text-white">{availableCount} / {ranks.length}</p>
              </div>
              {userAge && (
                <div>
                  <p className="text-xs text-gray-500">Age Used</p>
                  <p className="mt-0.5 text-sm font-semibold text-white">{userAge}</p>
                </div>
              )}
            </div>
          )}

          {/* No assets */}
          {summary.assetCount === 0 && (
            <div className="rounded-xl border border-dashed border-surface-border py-16 text-center">
              <p className="text-sm font-medium text-gray-400">No assets recorded</p>
              <p className="mt-1 text-xs text-gray-600">Add your portfolio to see wealth rank comparisons.</p>
              <Link
                href={ROUTES.portfolioInput}
                className="mt-4 inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Add assets →
              </Link>
            </div>
          )}

          {/* Rank rows */}
          {summary.assetCount > 0 && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5">
              {ranks.map((r) => (
                <RankRow key={r.type} result={r} />
              ))}
            </div>
          )}
        </>
      )}

      {/* Methodology note */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">How this works</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Rank estimates are based on local reference benchmark ranges, not real-time government or market data.
          Results depend on your total asset value and any profile inputs you have set (birth year, gender, estimated return).
        </p>
        <p className="text-xs text-gray-600">
          Missing profile fields will show an unavailable state rather than an estimate. Not financial advice.
        </p>
      </div>
    </div>
  )
}

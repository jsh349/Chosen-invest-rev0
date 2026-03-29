'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Settings, Users } from 'lucide-react'
import { useAssets } from '@/lib/store/assets-store'
import { useHousehold } from '@/lib/store/household-store'
import { useSettings } from '@/lib/store/settings-store'
import { useRankSnapshots } from '@/lib/hooks/use-rank-snapshots'
import { useGoals } from '@/lib/store/goals-store'
import { computeOverallWealthRank, computeAgeBasedRank, computeAgeGenderRank, computeReturnRank } from '@/features/dashboard/rank'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { RankShareCard } from '@/components/rank/rank-share-card'
import { LOCAL_USER_ID } from '@/lib/constants/auth'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import { BENCHMARK_META } from '@/lib/mock/rank-benchmarks'
import { getActiveBenchmarkSourceId, isUsingFallbackBenchmark } from '@/lib/adapters/rank-benchmarks-adapter'
import { percentileBandLabel } from '@/lib/utils/percentile-label'
import { getRankInsight } from '@/lib/utils/rank-insight'
import { getRankBadges } from '@/lib/utils/rank-badges'
import { getRankActions } from '@/lib/utils/rank-actions'
import { getRankGoalInsight } from '@/lib/utils/rank-goal-insight'
import { buildMonthlySummary } from '@/lib/utils/rank-monthly-summary'
import { buildMilestoneHistory } from '@/lib/utils/rank-milestone-history'
import { checkBenchmarkChanged, dismissBenchmarkAlert, benchmarkVersionNote, getBenchmarkFingerprint } from '@/lib/utils/benchmark-change-alert'
import { getNextRankHint } from '@/lib/utils/rank-next-hint'
import { getRankInterpretation } from '@/lib/utils/rank-interpretation'
import { getRankInputExplanation } from '@/lib/utils/rank-input-explanation'
import { getRankNarrativeSummary } from '@/lib/utils/rank-narrative-summary'
import { getPrimaryRank } from '@/lib/utils/rank-priority'
import { getRankReviewSummary } from '@/lib/utils/rank-review-summary'
import { getRankReviewFingerprint, checkRankReviewDue, dismissRankReview } from '@/lib/utils/rank-review'
import type { RankResult } from '@/lib/types/rank'

type RankMode = 'individual' | 'household'

function rankCompleteness(availableCount: number): { label: string; color: string } {
  if (availableCount <= 1) return { label: 'Basic',         color: 'text-gray-400' }
  if (availableCount <= 2) return { label: 'Partial',       color: 'text-amber-400' }
  return                          { label: 'More complete', color: 'text-emerald-400' }
}

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

  return (
    <div className="border-b border-surface-border py-5 last:border-0">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1 space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
            {result.label}
          </p>
          {hasPct ? (
            <p className={cn('text-3xl font-bold tracking-tight', percentileColor(result.percentile!))}>
              {percentileBandLabel(result.percentile!)}
            </p>
          ) : (
            <p className="text-2xl font-bold text-gray-600">—</p>
          )}
          <p className="text-sm text-gray-400 leading-relaxed">{result.message}</p>
          {hasPct && (
            <p className="text-[11px] text-gray-500">{getRankInterpretation(result.percentile!)}</p>
          )}
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
          {result.detail && (
            <div className="mt-2 rounded-md bg-surface-muted/40 px-3 py-2 space-y-0.5">
              <p className="text-[11px] text-gray-500">
                <span className="text-gray-600">Basis: </span>{result.detail.comparisonBasis}
              </p>
              <p className="text-[11px] text-gray-500">
                <span className="text-gray-600">Band matched: </span>{result.detail.bandLabel}
              </p>
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

/**
 * Compact highlight for the highest-priority rank with a real percentile.
 * Shows the band label prominently + one supporting interpretation line.
 * Returns null when no rank is available.
 */
function PrimaryRankHighlight({ ranks }: { ranks: RankResult[] }) {
  const primary = getPrimaryRank(ranks)
  if (!primary) return null
  return (
    <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-1.5">
      <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
        {primary.label}
      </p>
      <p className={cn('text-4xl font-bold tracking-tight', percentileColor(primary.percentile!))}>
        {percentileBandLabel(primary.percentile!)}
      </p>
      <p className="text-xs text-gray-500 leading-relaxed">
        {getRankInterpretation(primary.percentile!)}
      </p>
      {primary.detail && (
        <p className="text-[11px] text-gray-600">{primary.detail.comparisonBasis}</p>
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
  const { settings, isLoaded: settingsLoaded } = useSettings()
  const { compact } = useFormatCurrency()
  const { snapshots, isLoaded: snapshotsLoaded, saveSnapshot } = useRankSnapshots()
  const { goals, isLoaded: goalsLoaded } = useGoals()
  const [mode, setMode] = useState<RankMode>('individual')
  const [benchmarkAlertVisible, setBenchmarkAlertVisible] = useState(false)
  const [reviewVisible, setReviewVisible] = useState(false)

  const isFullyLoaded = assetsLoaded && householdLoaded && settingsLoaded && snapshotsLoaded
  const activeBenchmarkSource = getActiveBenchmarkSourceId()
  const usingFallbackBenchmark = isUsingFallbackBenchmark()

  // Compute early (safe with defaults) so useEffect can be placed before the loading guard.
  // buildPortfolioSummary is safe to call with an empty array while loading.
  const summary = buildPortfolioSummary(LOCAL_USER_ID, assets)
  const userAge = settings.birthYear
    ? new Date().getFullYear() - settings.birthYear
    : undefined

  const ranks: RankResult[] = isFullyLoaded ? [
    computeOverallWealthRank(summary.totalAssetValue),
    computeAgeBasedRank(summary.totalAssetValue, userAge),
    computeAgeGenderRank(summary.totalAssetValue, userAge, settings.gender),
    computeReturnRank(settings.annualReturnPct),
  ] : []

  const rankInsight = isFullyLoaded && summary.assetCount > 0
    ? getRankInsight(ranks)
    : null

  const rankBadges = isFullyLoaded && summary.assetCount > 0
    ? getRankBadges(ranks)
    : []

  const milestoneHistory = isFullyLoaded && snapshotsLoaded
    ? buildMilestoneHistory(snapshots)
    : []

  const rankActions = isFullyLoaded && goalsLoaded && summary.assetCount > 0
    ? getRankActions(ranks, { hasGoals: goals.length > 0 })
    : []

  const rankGoalInsight = isFullyLoaded && goalsLoaded && summary.assetCount > 0
    ? getRankGoalInsight(ranks, goals)
    : null

  const monthlySummary = isFullyLoaded && snapshotsLoaded
    ? buildMonthlySummary(snapshots)
    : null

  const versionNote = snapshotsLoaded ? benchmarkVersionNote(snapshots) : null

  const narrativeSummary = isFullyLoaded && summary.assetCount > 0
    ? getRankNarrativeSummary(ranks)
    : null

  const rankReviewSummary = isFullyLoaded && summary.assetCount > 0
    ? getRankReviewSummary(ranks, {
        hasAge:    !!settings.birthYear,
        hasGender: !!settings.gender,
        hasReturn: settings.annualReturnPct !== undefined,
      })
    : null

  const nextHint = isFullyLoaded && summary.assetCount > 0
    ? getNextRankHint({
        hasAge:    !!settings.birthYear,
        hasGender: !!settings.gender,
        hasReturn: settings.annualReturnPct !== undefined,
      })
    : null

  const inputExplanation = isFullyLoaded && summary.assetCount > 0
    ? getRankInputExplanation({
        hasAge:    !!settings.birthYear,
        hasGender: !!settings.gender,
        hasReturn: settings.annualReturnPct !== undefined,
      })
    : null

  // Rules of Hooks: useEffect must be before any conditional return.
  // Guard inside the effect so it only fires once all data is loaded.
  useEffect(() => {
    if (isFullyLoaded && summary.assetCount > 0) saveSnapshot(ranks, summary.totalAssetValue)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullyLoaded, summary.totalAssetValue, userAge, settings.gender, settings.annualReturnPct])

  useEffect(() => {
    setBenchmarkAlertVisible(checkBenchmarkChanged())
  }, [])

  useEffect(() => {
    if (!isFullyLoaded || summary.assetCount === 0) return
    const fp = getRankReviewFingerprint({
      totalAssetValue:      summary.totalAssetValue,
      birthYear:            settings.birthYear,
      gender:               settings.gender,
      annualReturnPct:      settings.annualReturnPct,
      benchmarkFingerprint: getBenchmarkFingerprint(),
    })
    setReviewVisible(checkRankReviewDue(fp))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFullyLoaded, summary.totalAssetValue, settings.birthYear, settings.gender, settings.annualReturnPct])

  if (!isFullyLoaded) return <LoadingSpinner />

  const availableCount = ranks.filter((r) => r.percentile != null).length
  const hasHouseholdMembers = members.length > 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white">Wealth Rank</h1>
          <p className="mt-0.5 text-sm text-gray-500">
            {mode === 'individual'
              ? 'Your individual portfolio ranked against reference benchmarks'
              : 'Combined household wealth ranked against reference benchmarks'}
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
                <p className="text-xs text-gray-500">Comparison</p>
                <p className="mt-0.5 text-sm font-semibold text-white">Individual</p>
              </div>
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
              <div>
                <p className="text-xs text-gray-500">Profile</p>
                <p className={cn('mt-0.5 text-sm font-semibold', rankCompleteness(availableCount).color)}>
                  {rankCompleteness(availableCount).label}
                </p>
              </div>
              {inputExplanation && (
                <p className="w-full border-t border-surface-border pt-3 text-xs text-gray-500">
                  {inputExplanation}
                </p>
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

          {/* Primary rank highlight — most relevant available rank, prominently displayed */}
          {summary.assetCount > 0 && <PrimaryRankHighlight ranks={ranks} />}

          {/* Narrative summary — one or two sentences synthesising available rank signals */}
          {narrativeSummary && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-3">
              <p className="text-sm text-gray-300 leading-relaxed">{narrativeSummary}</p>
            </div>
          )}

          {/* Rank review prompt — shown when rank-relevant inputs have changed since last dismissal */}
          {reviewVisible && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-brand-500/20 bg-brand-500/5 px-5 py-3">
              <p className="text-xs text-brand-300 leading-relaxed">
                Your rank inputs have changed — review your updated insights.
              </p>
              <button
                onClick={() => {
                  const fp = getRankReviewFingerprint({
                    totalAssetValue:      summary.totalAssetValue,
                    birthYear:            settings.birthYear,
                    gender:               settings.gender,
                    annualReturnPct:      settings.annualReturnPct,
                    benchmarkFingerprint: getBenchmarkFingerprint(),
                  })
                  dismissRankReview(fp)
                  setReviewVisible(false)
                }}
                className="shrink-0 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Next-step hint — one actionable sentence toward full rank completeness */}
          {nextHint && (
            <div className="flex items-center justify-between gap-3 rounded-xl border border-surface-border bg-surface-card px-5 py-3">
              <p className="text-xs text-gray-400 leading-relaxed">{nextHint.text}</p>
              <Link
                href={nextHint.href}
                className="shrink-0 text-xs text-brand-400 hover:text-brand-300 transition-colors"
              >
                Settings →
              </Link>
            </div>
          )}

          {/* Rank insight — shown only when a meaningful gap or profile gap is detected */}
          {rankInsight && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-3">
              <p className="text-xs text-gray-400 leading-relaxed">{rankInsight}</p>
            </div>
          )}

          {/* Rank–goal bridge insight */}
          {rankGoalInsight && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-3">
              <p className="text-xs text-gray-400 leading-relaxed">{rankGoalInsight}</p>
            </div>
          )}

          {/* Rank actions — contextual navigation links derived from rank state */}
          {rankActions.length > 0 && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-3 flex flex-wrap gap-x-5 gap-y-2">
              {rankActions.map((action) => (
                <Link
                  key={action.label}
                  href={action.href}
                  className="text-xs text-brand-400 hover:text-brand-300 transition-colors"
                >
                  {action.label} →
                </Link>
              ))}
            </div>
          )}

          {/* Advisor review summary — structured 3-item status for profile / wealth / return */}
          {rankReviewSummary && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Review Summary</p>
              <ul className="space-y-2.5">
                {rankReviewSummary.map((item) => (
                  <li key={item.topic} className="flex items-start gap-2.5">
                    <span className={cn(
                      'mt-1 h-2 w-2 shrink-0 rounded-full',
                      item.status === 'ok'      ? 'bg-emerald-500' :
                      item.status === 'review'  ? 'bg-amber-400' :
                                                  'bg-gray-500'
                    )} />
                    <p className="text-xs leading-relaxed">
                      <span className="font-medium text-gray-300">{item.label}</span>
                      <span className="text-gray-500"> — {item.note}</span>
                    </p>
                  </li>
                ))}
              </ul>
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

          {/* Rank milestone history — compact list of first-recorded badges */}
          {snapshotsLoaded && (
            <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Milestones</p>
              {milestoneHistory.length === 0 ? (
                <p className="text-xs text-gray-600">
                  No milestones recorded yet. Milestones appear here after rank data is saved across visits.
                </p>
              ) : (
                <ul className="divide-y divide-surface-border">
                  {milestoneHistory.map((entry) => (
                    <li key={entry.id} className="flex items-start justify-between gap-4 py-2.5 first:pt-0 last:pb-0">
                      <div className="min-w-0 space-y-0.5">
                        <p className="text-xs font-medium text-gray-300">{entry.label}</p>
                        <p className="text-[11px] text-gray-600 leading-relaxed">{entry.description}</p>
                      </div>
                      <time
                        dateTime={entry.firstSeenAt}
                        className="shrink-0 text-[11px] tabular-nums text-gray-600"
                      >
                        {new Date(entry.firstSeenAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </time>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}

          {/* Share card — compact summary preview */}
          {summary.assetCount > 0 && <RankShareCard ranks={ranks} />}
        </>
      )}

      {/* Monthly rank summary — shown when at least one snapshot exists */}
      {monthlySummary && (
        <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Rank Change</p>
          <div className="grid grid-cols-2 gap-x-4 gap-y-3">
            {/* Overall wealth rank */}
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wide">Overall wealth</p>
              {monthlySummary.currentOverall !== null ? (
                <p className={cn('text-sm font-semibold tabular-nums', percentileColor(monthlySummary.currentOverall))}>
                  Top {100 - monthlySummary.currentOverall}%
                </p>
              ) : (
                <p className="text-sm text-gray-600">—</p>
              )}
              <p className={cn('text-xs tabular-nums',
                monthlySummary.delta === null  ? 'text-gray-600' :
                monthlySummary.delta > 0       ? 'text-emerald-400' :
                monthlySummary.delta < 0       ? 'text-red-400' :
                'text-gray-500'
              )}>
                {monthlySummary.delta === null
                  ? 'No prior snapshot'
                  : monthlySummary.delta > 0  ? `+${monthlySummary.delta} pts · improved`
                  : monthlySummary.delta < 0  ? `${monthlySummary.delta} pts · lower`
                  : 'Unchanged'}
              </p>
            </div>
            {/* Return rank */}
            <div className="space-y-0.5">
              <p className="text-[10px] text-gray-600 uppercase tracking-wide">Return rank</p>
              <p className="text-sm text-gray-500">—</p>
              <p className={cn('text-xs tabular-nums',
                monthlySummary.returnDelta === null ? 'text-gray-600' :
                monthlySummary.returnDelta > 0      ? 'text-emerald-400' :
                monthlySummary.returnDelta < 0      ? 'text-red-400' :
                'text-gray-500'
              )}>
                {monthlySummary.returnDelta === null
                  ? 'No return data'
                  : monthlySummary.returnDelta > 0  ? `+${monthlySummary.returnDelta} pts · improved`
                  : monthlySummary.returnDelta < 0  ? `${monthlySummary.returnDelta} pts · lower`
                  : 'Unchanged'}
              </p>
            </div>
          </div>
          <p className="text-xs text-gray-600 leading-relaxed border-t border-surface-border pt-2">
            {monthlySummary.note}
          </p>
          {versionNote && (
            <p className="text-[10px] text-amber-500/70 leading-relaxed">{versionNote}</p>
          )}
        </div>
      )}

      {/* Snapshot history — only shown when 2+ snapshots exist */}
      {snapshots.length >= 2 && (
        <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-3">
          <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">Recent Snapshots</p>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr className="text-left text-gray-600 border-b border-surface-border">
                  <th className="pb-2 pr-4 font-medium">Date</th>
                  <th className="pb-2 pr-4 font-medium">Overall</th>
                  <th className="pb-2 pr-4 font-medium">Return</th>
                  <th className="pb-2 font-medium">Change</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-surface-border">
                {snapshots.slice(0, 5).map((s, idx) => {
                  const prev  = snapshots[idx + 1]
                  const delta =
                    s.overallPercentile != null && prev?.overallPercentile != null
                      ? s.overallPercentile - prev.overallPercentile
                      : null
                  const d = new Date(s.savedAt)
                  const dateLabel = d.toLocaleDateString('en-US', {
                    month: 'short',
                    day:   'numeric',
                    ...(d.getFullYear() !== new Date().getFullYear() && { year: 'numeric' }),
                  })
                  return (
                    <tr key={s.id} className="text-gray-400">
                      <td className="py-2 pr-4 tabular-nums text-gray-500 whitespace-nowrap">{dateLabel}</td>
                      <td className="py-2 pr-4 tabular-nums">
                        {s.overallPercentile != null ? `Top ${100 - s.overallPercentile}%` : '—'}
                      </td>
                      <td className="py-2 pr-4 tabular-nums">
                        {s.returnPercentile != null ? `Top ${100 - s.returnPercentile}%` : '—'}
                      </td>
                      <td className={cn(
                        'py-2 tabular-nums whitespace-nowrap',
                        delta === null ? 'text-gray-600' :
                        delta > 0     ? 'text-emerald-400' :
                        delta < 0     ? 'text-red-400' :
                                        'text-gray-500'
                      )}>
                        {delta === null ? '—' :
                         delta > 0     ? `+${delta} pts` :
                         delta < 0     ? `${delta} pts` :
                                         'no change'}
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
          <p className="text-[10px] text-gray-600">
            Saved locally on each visit when rank values change. Max 10 stored.
          </p>
        </div>
      )}

      {/* Benchmark change alert — shown once when version or source changes */}
      {benchmarkAlertVisible && (
        <div className="flex items-start justify-between gap-3 rounded-xl border border-amber-500/30 bg-amber-500/5 px-4 py-3">
          <p className="text-xs text-amber-300 leading-relaxed">
            Benchmark reference ranges were updated.
          </p>
          <button
            onClick={() => {
              dismissBenchmarkAlert()
              setBenchmarkAlertVisible(false)
            }}
            className="shrink-0 text-[10px] text-gray-500 hover:text-gray-300 transition-colors"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Methodology note */}
      <div className="rounded-xl border border-surface-border bg-surface-card px-5 py-4 space-y-1.5">
        <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">How this works</p>
        <p className="text-xs text-gray-400 leading-relaxed">
          Rank estimates are based on local reference benchmark ranges, not real-time government or market data.
          Results depend on your total asset value and any profile inputs you have set (birth year, gender, estimated return).
        </p>
        <p className="text-xs text-gray-600">
          Missing profile fields will show an unavailable state rather than an estimate. These are estimates only and not financial advice.
        </p>
        <div className="mt-2 border-t border-surface-border pt-2 flex flex-wrap gap-x-4 gap-y-1">
          <span className="text-[10px] text-gray-600">
            <span className="text-gray-500">Benchmark: </span>
            {BENCHMARK_META.sourceLabel}
          </span>
          <span className="text-[10px] text-gray-600">
            <span className="text-gray-500">Version: </span>
            {BENCHMARK_META.version}
          </span>
          <span className="text-[10px] text-gray-600">
            <span className="text-gray-500">Updated: </span>
            {BENCHMARK_META.updatedAt}
          </span>
          <span className="text-[10px] text-gray-600">
            <span className="text-gray-500">Active source: </span>
            {usingFallbackBenchmark
              ? 'Built-in (default) — curated source could not be loaded'
              : activeBenchmarkSource === 'curated' ? 'Curated dataset' : 'Built-in (default)'}
          </span>
          {BENCHMARK_META.notes && (
            <span className="text-[10px] text-gray-600 w-full">{BENCHMARK_META.notes}</span>
          )}
          {usingFallbackBenchmark && (
            <span className="text-[10px] text-amber-500/70 w-full">
              Results are based on the built-in reference dataset. Check the benchmark source in Settings.
            </span>
          )}
        </div>
      </div>
    </div>
  )
}

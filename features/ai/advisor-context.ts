import type { Asset } from '@/lib/types/asset'
import type { Goal } from '@/lib/types/goal'
import type { Transaction } from '@/lib/types/transaction'
import type { PortfolioSummary } from '@/lib/types/dashboard'
import type { RankResult } from '@/lib/types/rank'
import { buildPortfolioSummary } from '@/features/dashboard/helpers'
import { computeCashFlow, type CashFlowSummary } from '@/lib/utils/transaction-summary'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

export type RankSummary = {
  overallPercentile: number | null
  agePercentile: number | null
  returnPercentile: number | null
}

export type AdvisorContext = {
  portfolio: PortfolioSummary
  hasGoals: boolean
  goalCount: number
  cashFlow: CashFlowSummary | null
  rankSummary?: RankSummary
  currencySymbol?: string
  showCents?: boolean
}

/** Build a normalized context object for the advisor from raw store data. */
export function buildAdvisorContext(
  assets: Asset[],
  goals: Goal[],
  transactions: Transaction[],
): AdvisorContext {
  return {
    portfolio: buildPortfolioSummary(LOCAL_USER_ID, assets),
    hasGoals: goals.length > 0,
    goalCount: goals.length,
    cashFlow: transactions.length > 0 ? computeCashFlow(transactions) : null,
  }
}

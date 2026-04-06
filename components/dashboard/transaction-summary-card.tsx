'use client'

import Link from 'next/link'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTransactions } from '@/lib/store/transactions-store'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import type { TransactionCategory } from '@/lib/types/transaction'
import { computeCashFlow } from '@/lib/utils/transaction-summary'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { currentYearMonth } from '@/lib/utils/current-month'
import { formatSignedAmount } from '@/lib/utils/format-amount'

export function TransactionSummaryCard() {
  const { transactions, isLoaded } = useTransactions()
  const { fmt, symbol } = useFormatCurrency()
  const formatAmount = (amount: number) => formatSignedAmount(amount, fmt)

  if (!isLoaded) return null

  const ym = currentYearMonth()
  const monthly = transactions.filter((t) => t.date.startsWith(ym))

  if (monthly.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>This Month</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <p className="text-sm text-gray-500">No transactions recorded this month. Track your income and expenses to see a monthly summary.</p>
          <Link href={ROUTES.transactions} className="inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Record a transaction →
          </Link>
        </CardContent>
      </Card>
    )
  }

  const { income, expenses, net } = computeCashFlow(monthly)

  // Top spending category
  const expenseMap: Partial<Record<TransactionCategory, number>> = {}
  for (const t of monthly) {
    if (t.amount < 0) {
      expenseMap[t.category] = (expenseMap[t.category] ?? 0) + Math.abs(t.amount)
    }
  }
  const topCategory = Object.entries(expenseMap).sort((a, b) => b[1] - a[1])[0]

  return (
    <Card>
      <CardHeader>
        <CardTitle>This Month</CardTitle>
        <span className="text-xs text-gray-500">{monthly.length} transactions</span>
      </CardHeader>
      <CardContent className="space-y-4">

        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg bg-surface-muted/40 px-3 py-2">
            <p className="text-xs text-gray-500">Income</p>
            <p className="mt-0.5 text-sm font-semibold text-green-400">{formatAmount(income)}</p>
          </div>
          <div className="rounded-lg bg-surface-muted/40 px-3 py-2">
            <p className="text-xs text-gray-500">Expenses</p>
            <p className="mt-0.5 text-sm font-semibold text-red-400">{formatAmount(expenses)}</p>
          </div>
          <div className="rounded-lg bg-surface-muted/40 px-3 py-2">
            <p className="text-xs text-gray-500">Net</p>
            <p className={cn('mt-0.5 text-sm font-semibold', net >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatAmount(net)}
            </p>
          </div>
        </div>

        {topCategory && (
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-500">Top spending category</span>
            <span className="font-medium text-gray-300">
              {topCategory[0]}&nbsp;
              <span className="text-gray-500">({fmt(topCategory[1])})</span>
            </span>
          </div>
        )}

      </CardContent>
    </Card>
  )
}

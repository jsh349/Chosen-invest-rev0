'use client'

import Link from 'next/link'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { useTransactions } from '@/lib/store/transactions-store'
import { ROUTES } from '@/lib/constants/routes'
import { cn } from '@/lib/utils/cn'
import { computeCashFlow } from '@/lib/utils/transaction-summary'

function formatUSD(value: number) {
  return Math.abs(value).toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
}

type Insight = {
  icon: React.ReactNode
  headline: string
  supporting: string
  color: string
}

function deriveInsight(income: number, expenses: number, net: number, count: number): Insight {
  if (count === 0) {
    return {
      icon:       <Minus className="h-4 w-4" />,
      headline:   'No transaction data yet.',
      supporting: 'Add transactions to see your cash flow insight.',
      color:      'text-gray-400',
    }
  }

  if (income === 0 && expenses < 0) {
    return {
      icon:       <TrendingDown className="h-4 w-4" />,
      headline:   'Only expenses recorded — no income logged yet.',
      supporting: `Total spending: ${formatUSD(expenses)}`,
      color:      'text-red-400',
    }
  }

  const spendRatio = income > 0 ? Math.abs(expenses) / income : 0

  if (net < 0) {
    return {
      icon:       <TrendingDown className="h-4 w-4" />,
      headline:   'Spending exceeds income this period.',
      supporting: `Net: -${formatUSD(Math.abs(net))} · Spend ratio: ${(spendRatio * 100).toFixed(0)}% of income`,
      color:      'text-red-400',
    }
  }

  if (spendRatio > 0.8) {
    return {
      icon:       <TrendingDown className="h-4 w-4" />,
      headline:   'Cash flow is positive, but spending is unusually high.',
      supporting: `${(spendRatio * 100).toFixed(0)}% of income spent · Net surplus: ${formatUSD(net)}`,
      color:      'text-yellow-400',
    }
  }

  return {
    icon:       <TrendingUp className="h-4 w-4" />,
    headline:   'Cash flow is positive.',
    supporting: `Net surplus: ${formatUSD(net)} · Spend ratio: ${(spendRatio * 100).toFixed(0)}% of income`,
    color:      'text-green-400',
  }
}

export function CashFlowInsightCard() {
  const { transactions, isLoaded } = useTransactions()

  if (!isLoaded) return null

  const { income, expenses, net } = computeCashFlow(transactions)
  const insight  = deriveInsight(income, expenses, net, transactions.length)

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cash Flow Insight</CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className={cn('flex items-center gap-2', insight.color)}>
          {insight.icon}
          <span className="text-sm font-medium">{insight.headline}</span>
        </div>
        <p className="text-xs text-gray-500">{insight.supporting}</p>
        {transactions.length === 0 && (
          <Link href={ROUTES.transactions} className="inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors">
            Record a transaction →
          </Link>
        )}
      </CardContent>
    </Card>
  )
}

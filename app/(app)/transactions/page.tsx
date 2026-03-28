'use client'

import { useState } from 'react'
import { Trash2, ArrowLeftRight } from 'lucide-react'
import { useTransactions } from '@/lib/store/transactions-store'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { TransactionCategory } from '@/lib/types/transaction'

const CATEGORIES: TransactionCategory[] = [
  'Income', 'Housing', 'Groceries', 'Utilities', 'Subscriptions',
  'Transport', 'Travel', 'Family', 'Taxes', 'Investments', 'Other',
]

type SortKey = 'date-desc' | 'date-asc' | 'amount-desc' | 'amount-asc'

const SORT_OPTIONS: { value: SortKey; label: string }[] = [
  { value: 'date-desc',   label: 'Newest first'  },
  { value: 'date-asc',    label: 'Oldest first'  },
  { value: 'amount-desc', label: 'Highest amount'},
  { value: 'amount-asc',  label: 'Lowest amount' },
]

const EMPTY_FORM = {
  date:        '',
  description: '',
  amount:      '',
  type:        'expense' as 'income' | 'expense',
  category:    'Other' as TransactionCategory,
}

function formatAmount(amount: number) {
  const abs = Math.abs(amount).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
  return amount >= 0 ? `+$${abs}` : `-$${abs}`
}

const SELECT_CLASS = 'rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none'

export default function TransactionsPage() {
  const { transactions, isLoaded, addTransaction, removeTransaction } = useTransactions()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [filterCategory, setFilterCategory] = useState<TransactionCategory | 'All'>('All')
  const [sortKey, setSortKey] = useState<SortKey>('date-desc')

  if (!isLoaded) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
      </div>
    )
  }

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!form.date) { setError('Date is required.'); return }
    if (!/^\d{4}-\d{2}-\d{2}$/.test(form.date)) { setError('Use YYYY-MM-DD format.'); return }
    if (!form.description.trim()) { setError('Description is required.'); return }
    const raw = parseFloat(form.amount)
    if (isNaN(raw) || raw <= 0) { setError('Amount must be a positive number.'); return }

    const amount = form.type === 'expense' ? -raw : raw
    addTransaction({
      id:          crypto.randomUUID(),
      date:        form.date,
      description: form.description.trim(),
      amount,
      category:    form.category,
      createdAt:   new Date().toISOString(),
    })
    setForm(EMPTY_FORM)
  }

  // Summary always uses all transactions
  const totalIncome  = transactions.filter((t) => t.amount > 0).reduce((s, t) => s + t.amount, 0)
  const totalExpense = transactions.filter((t) => t.amount < 0).reduce((s, t) => s + t.amount, 0)
  const net = totalIncome + totalExpense

  // Filter then sort
  const filtered = filterCategory === 'All'
    ? transactions
    : transactions.filter((t) => t.category === filterCategory)

  const sorted = [...filtered].sort((a, b) => {
    switch (sortKey) {
      case 'date-desc':   return b.date.localeCompare(a.date)
      case 'date-asc':    return a.date.localeCompare(b.date)
      case 'amount-desc': return Math.abs(b.amount) - Math.abs(a.amount)
      case 'amount-asc':  return Math.abs(a.amount) - Math.abs(b.amount)
    }
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Transactions</h1>
        <p className="mt-0.5 text-sm text-gray-500">Manually track your income and expenses</p>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Date *</label>
                <input
                  name="date"
                  value={form.date}
                  onChange={handleChange}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  maxLength={10}
                  className={cn(SELECT_CLASS, 'w-full placeholder-gray-600')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Category *</label>
                <select name="category" value={form.category} onChange={handleChange} className={cn(SELECT_CLASS, 'w-full')}>
                  {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Description *</label>
                <input
                  name="description"
                  value={form.description}
                  onChange={handleChange}
                  placeholder="e.g. Monthly rent"
                  className={cn(SELECT_CLASS, 'w-full placeholder-gray-600')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Amount *</label>
                <input
                  name="amount"
                  value={form.amount}
                  onChange={handleChange}
                  type="number"
                  min="0"
                  step="any"
                  placeholder="0.00"
                  className={cn(SELECT_CLASS, 'w-full placeholder-gray-600')}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Type *</label>
                <select name="type" value={form.type} onChange={handleChange} className={cn(SELECT_CLASS, 'w-full')}>
                  <option value="expense">Expense</option>
                  <option value="income">Income</option>
                </select>
              </div>
            </div>
            {error && <p className="text-xs text-red-400">{error}</p>}
            <button type="submit" className={cn(buttonVariants({ size: 'sm' }), 'w-full sm:w-auto')}>
              Add Transaction
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Summary row — always full dataset */}
      {transactions.length > 0 && (
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
            <p className="text-xs text-gray-500">Income</p>
            <p className="mt-0.5 text-sm font-semibold text-green-400">{formatAmount(totalIncome)}</p>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
            <p className="text-xs text-gray-500">Expenses</p>
            <p className="mt-0.5 text-sm font-semibold text-red-400">{formatAmount(totalExpense)}</p>
          </div>
          <div className="rounded-xl border border-surface-border bg-surface-card px-4 py-3">
            <p className="text-xs text-gray-500">Net</p>
            <p className={cn('mt-0.5 text-sm font-semibold', net >= 0 ? 'text-green-400' : 'text-red-400')}>
              {formatAmount(net)}
            </p>
          </div>
        </div>
      )}

      {/* Transaction list */}
      {transactions.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-16 text-center">
          <ArrowLeftRight className="mb-3 h-8 w-8 text-gray-600" />
          <p className="text-sm font-medium text-gray-400">No transactions yet</p>
          <p className="mt-1 text-xs text-gray-600">Add your first transaction above.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>History</CardTitle>
            {/* Filter + sort controls */}
            <div className="flex flex-wrap gap-2">
              <select
                value={filterCategory}
                onChange={(e) => setFilterCategory(e.target.value as TransactionCategory | 'All')}
                className={cn(SELECT_CLASS, 'text-xs py-1 px-2')}
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
              </select>
              <select
                value={sortKey}
                onChange={(e) => setSortKey(e.target.value as SortKey)}
                className={cn(SELECT_CLASS, 'text-xs py-1 px-2')}
              >
                {SORT_OPTIONS.map((o) => <option key={o.value} value={o.value}>{o.label}</option>)}
              </select>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            {sorted.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                <p className="text-sm text-gray-500">No transactions match this filter.</p>
              </div>
            ) : (
              <div className="divide-y divide-surface-border">
                {sorted.map((t) => (
                  <div key={t.id} className="flex items-center gap-3 px-4 py-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">{t.description}</span>
                        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-gray-400">
                          {t.category}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs text-gray-600">{t.date}</p>
                    </div>
                    <span className={cn('shrink-0 text-sm font-semibold tabular-nums', t.amount >= 0 ? 'text-green-400' : 'text-red-400')}>
                      {formatAmount(t.amount)}
                    </span>
                    <button
                      onClick={() => removeTransaction(t.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-600 hover:bg-red-950 hover:text-red-400 transition-colors"
                      aria-label="Delete transaction"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { Trash2, Target } from 'lucide-react'
import { useGoals } from '@/lib/store/goals-store'
import { formatCurrency } from '@/lib/utils/currency'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import type { Goal, GoalType } from '@/lib/types/goal'

const GOAL_TYPES: { value: GoalType; label: string }[] = [
  { value: 'savings',    label: 'Savings'    },
  { value: 'investment', label: 'Investment' },
  { value: 'retirement', label: 'Retirement' },
  { value: 'purchase',   label: 'Purchase'   },
  { value: 'debt',       label: 'Debt Payoff'},
  { value: 'other',      label: 'Other'      },
]

const EMPTY_FORM = {
  name:          '',
  type:          'savings' as GoalType,
  targetAmount:  '',
  currentAmount: '',
  targetDate:    '',
}

function progressPct(goal: Goal) {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

export default function GoalsPage() {
  const { goals, isLoaded, addGoal, removeGoal } = useGoals()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')

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
    const name = form.name.trim()
    if (!name) { setError('Goal name is required.'); return }
    const targetAmount = parseFloat(form.targetAmount)
    if (isNaN(targetAmount) || targetAmount <= 0) { setError('Target amount must be a positive number.'); return }
    const currentAmount = form.currentAmount === '' ? 0 : parseFloat(form.currentAmount)
    if (isNaN(currentAmount) || currentAmount < 0) { setError('Saved amount must be 0 or more.'); return }

    const now = new Date().toISOString()
    const goal: Goal = {
      id:            crypto.randomUUID(),
      name,
      type:          form.type,
      targetAmount,
      currentAmount,
      targetDate:    form.targetDate || undefined,
      createdAt:     now,
      updatedAt:     now,
    }
    addGoal(goal)
    setForm(EMPTY_FORM)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Goals</h1>
        <p className="mt-0.5 text-sm text-gray-500">Set and track your financial goals</p>
      </div>

      {/* Add form */}
      <Card>
        <CardHeader>
          <CardTitle>Add New Goal</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Goal Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="e.g. Emergency Fund"
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Type *</label>
                <select
                  name="type"
                  value={form.type}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                >
                  {GOAL_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Target Amount *</label>
                <input
                  name="targetAmount"
                  value={form.targetAmount}
                  onChange={handleChange}
                  placeholder="10000"
                  type="number"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Saved So Far</label>
                <input
                  name="currentAmount"
                  value={form.currentAmount}
                  onChange={handleChange}
                  placeholder="0"
                  type="number"
                  min="0"
                  step="any"
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1 sm:col-span-2">
                <label className="text-xs text-gray-400">Target Date (optional)</label>
                <input
                  name="targetDate"
                  value={form.targetDate}
                  onChange={handleChange}
                  type="text"
                  placeholder="YYYY-MM-DD"
                  maxLength={10}
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
                />
              </div>
            </div>

            {error && <p className="text-xs text-red-400">{error}</p>}

            <button type="submit" className={cn(buttonVariants({ size: 'sm' }), 'w-full sm:w-auto')}>
              Add Goal
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Goal list */}
      {goals.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-16 text-center">
          <Target className="mb-3 h-8 w-8 text-gray-600" />
          <p className="text-sm font-medium text-gray-400">No goals yet</p>
          <p className="mt-1 text-xs text-gray-600">Add your first goal above to start tracking progress.</p>
        </div>
      ) : (
        <div className="space-y-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            {goals.length} {goals.length === 1 ? 'Goal' : 'Goals'}
          </h2>
          {goals.map((goal) => {
            const pct = progressPct(goal)
            return (
              <Card key={goal.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1 space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-white">{goal.name}</span>
                        <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-gray-400 capitalize">
                          {goal.type}
                        </span>
                      </div>
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>{formatCurrency(goal.currentAmount)} saved</span>
                          <span>{pct.toFixed(0)}% of {formatCurrency(goal.targetAmount)}</span>
                        </div>
                        <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                          <div
                            className="h-full rounded-full bg-brand-500 transition-all duration-300"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                      </div>
                      {goal.targetDate && (
                        <p className="text-xs text-gray-600">Target: {goal.targetDate}</p>
                      )}
                    </div>
                    <button
                      onClick={() => removeGoal(goal.id)}
                      className="shrink-0 rounded-lg p-1.5 text-gray-600 hover:bg-red-950 hover:text-red-400 transition-colors"
                      aria-label="Delete goal"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

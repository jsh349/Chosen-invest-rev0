'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Trash2, Target, Pencil, Check, X } from 'lucide-react'
import { useGoals } from '@/lib/store/goals-store'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { isRequired, parsePositive, parseNonNegative, isDateFormat } from '@/lib/utils/validation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FormError } from '@/components/ui/form-error'
import type { Goal, GoalType } from '@/lib/types/goal'
import { getGoalStatus, GOAL_STATUS_STYLES } from '@/lib/utils/goal-status'
import { ROUTES } from '@/lib/constants/routes'

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
  shared:        false,
}

type FormState = typeof EMPTY_FORM

function progressPct(goal: Goal) {
  if (goal.targetAmount <= 0) return 0
  return Math.min(100, (goal.currentAmount / goal.targetAmount) * 100)
}

function goalToForm(goal: Goal): FormState {
  return {
    name:          goal.name,
    type:          goal.type,
    targetAmount:  String(goal.targetAmount),
    currentAmount: String(goal.currentAmount),
    targetDate:    goal.targetDate ?? '',
    shared:        goal.shared ?? false,
  }
}

function FormFields({
  form,
  onChange,
  onSharedChange,
}: {
  form: FormState
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void
  onSharedChange: (checked: boolean) => void
}) {
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <div className="space-y-1">
        <label className="text-xs text-gray-400">Goal Name *</label>
        <input
          name="name"
          value={form.name}
          onChange={onChange}
          placeholder="e.g. Emergency Fund"
          className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="space-y-1">
        <label className="text-xs text-gray-400">Type *</label>
        <select
          name="type"
          value={form.type}
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
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
          onChange={onChange}
          type="text"
          placeholder="YYYY-MM-DD"
          maxLength={10}
          className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none"
        />
      </div>
      <div className="sm:col-span-2">
        <label className="flex items-center gap-2 cursor-pointer w-fit">
          <input
            type="checkbox"
            checked={form.shared}
            onChange={(e) => onSharedChange(e.target.checked)}
            className="h-4 w-4 rounded border-surface-border accent-brand-500"
          />
          <span className="text-sm text-gray-400">Share with household</span>
        </label>
      </div>
    </div>
  )
}

function parseForm(form: FormState): { targetAmount: number; currentAmount: number } | null {
  const targetAmount = parsePositive(form.targetAmount)
  const currentAmount = parseNonNegative(form.currentAmount)
  if (targetAmount === null || currentAmount === null) return null
  return { targetAmount, currentAmount }
}

export default function GoalsPage() {
  const { goals, isLoaded, addGoal, updateGoal, removeGoal } = useGoals()
  const { fmt } = useFormatCurrency()
  const [addForm, setAddForm] = useState<FormState>(EMPTY_FORM)
  const [addError, setAddError] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editForm, setEditForm] = useState<FormState>(EMPTY_FORM)
  const [editError, setEditError] = useState('')

  if (!isLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  function handleAddChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setAddForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setAddError('')
  }

  function handleAddSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isRequired(addForm.name)) { setAddError('Goal name is required.'); return }
    if (addForm.targetDate && !isDateFormat(addForm.targetDate)) { setAddError('Use YYYY-MM-DD date format.'); return }
    const amounts = parseForm(addForm)
    if (!amounts) { setAddError('Target amount must be a positive number and saved amount must be 0 or more.'); return }
    const now = new Date().toISOString()
    addGoal({
      id:            crypto.randomUUID(),
      name:          addForm.name.trim(),
      type:          addForm.type,
      targetAmount:  amounts.targetAmount,
      currentAmount: amounts.currentAmount,
      targetDate:    addForm.targetDate || undefined,
      shared:        addForm.shared,
      createdAt:     now,
      updatedAt:     now,
    })
    setAddForm(EMPTY_FORM)
  }

  function startEdit(goal: Goal) {
    setEditingId(goal.id)
    setEditForm(goalToForm(goal))
    setEditError('')
  }

  function cancelEdit() {
    setEditingId(null)
    setEditError('')
  }

  function handleEditChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setEditForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setEditError('')
  }

  function handleEditSave(id: string) {
    if (!isRequired(editForm.name)) { setEditError('Goal name is required.'); return }
    if (editForm.targetDate && !isDateFormat(editForm.targetDate)) { setEditError('Use YYYY-MM-DD date format.'); return }
    const amounts = parseForm(editForm)
    if (!amounts) { setEditError('Target amount must be a positive number and saved amount must be 0 or more.'); return }
    updateGoal(id, {
      name:          editForm.name.trim(),
      type:          editForm.type,
      targetAmount:  amounts.targetAmount,
      currentAmount: amounts.currentAmount,
      targetDate:    editForm.targetDate || undefined,
      shared:        editForm.shared,
    })
    setEditingId(null)
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
          <form onSubmit={handleAddSubmit} className="space-y-4">
            <FormFields form={addForm} onChange={handleAddChange} onSharedChange={(checked) => setAddForm((p) => ({ ...p, shared: checked }))} />
            <FormError message={addError} />
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
            const isEditing = editingId === goal.id

            return (
              <Card key={goal.id}>
                <CardContent className="pt-4">
                  {isEditing ? (
                    <div className="space-y-4">
                      <FormFields form={editForm} onChange={handleEditChange} onSharedChange={(checked) => setEditForm((p) => ({ ...p, shared: checked }))} />
                      <FormError message={editError} />
                      <div className="flex gap-2">
                        <button
                          onClick={() => handleEditSave(goal.id)}
                          className={cn(buttonVariants({ size: 'sm' }), 'gap-1.5')}
                        >
                          <Check className="h-3.5 w-3.5" />
                          Save
                        </button>
                        <button
                          onClick={cancelEdit}
                          className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), 'gap-1.5')}
                        >
                          <X className="h-3.5 w-3.5" />
                          Cancel
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0 flex-1 space-y-2">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="truncate text-sm font-medium text-white">{goal.name}</span>
                          <span className="shrink-0 rounded-full bg-surface-muted px-2 py-0.5 text-xs text-gray-400 capitalize">
                            {goal.type}
                          </span>
                          <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', GOAL_STATUS_STYLES[getGoalStatus(goal.currentAmount, goal.targetAmount)])}>
                            {getGoalStatus(goal.currentAmount, goal.targetAmount)}
                          </span>
                        </div>
                        <div className="space-y-1">
                          <div className="flex justify-between text-xs text-gray-500">
                            <span>{fmt(goal.currentAmount)} saved</span>
                            <span>{pct.toFixed(0)}% of {fmt(goal.targetAmount)}</span>
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
                      <div className="flex shrink-0 gap-1">
                        <Link
                          href={`${ROUTES.goals}/${goal.id}`}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-surface-muted hover:text-white transition-colors"
                          aria-label="View goal details"
                        >
                          <Target className="h-4 w-4" />
                        </Link>
                        <button
                          onClick={() => startEdit(goal)}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-surface-muted hover:text-white transition-colors"
                          aria-label="Edit goal"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => removeGoal(goal.id)}
                          className="rounded-lg p-1.5 text-gray-600 hover:bg-red-950 hover:text-red-400 transition-colors"
                          aria-label="Delete goal"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

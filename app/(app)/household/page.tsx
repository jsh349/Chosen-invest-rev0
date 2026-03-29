'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Users, Trash2, Target, StickyNote } from 'lucide-react'
import { useHousehold } from '@/lib/store/household-store'
import { useGoals } from '@/lib/store/goals-store'
import { useHouseholdNotes } from '@/lib/store/household-notes-store'
import { useFormatCurrency } from '@/lib/hooks/use-format-currency'
import { getGoalStatus, goalProgressPct, GOAL_STATUS_LABELS, GOAL_STATUS_STYLES } from '@/lib/utils/goal-status'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils/cn'
import { ROUTES } from '@/lib/constants/routes'
import type { MemberRole } from '@/lib/types/household'
import { isRequired, isBasicEmail } from '@/lib/utils/validation'
import { LoadingSpinner } from '@/components/ui/loading-spinner'
import { FormError } from '@/components/ui/form-error'

const INPUT_CLASS = 'w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none'

const ROLES: { value: MemberRole; label: string; description: string }[] = [
  { value: 'admin',   label: 'Admin',   description: 'Full access'    },
  { value: 'partner', label: 'Partner', description: 'Can add & edit' },
  { value: 'viewer',  label: 'Viewer',  description: 'Read only'      },
]

const ROLE_COLORS: Record<MemberRole, string> = {
  admin:   'text-brand-300 bg-brand-950',
  partner: 'text-green-400 bg-green-950',
  viewer:  'text-gray-400 bg-surface-muted',
}

const EMPTY_FORM = { name: '', email: '', role: 'viewer' as MemberRole }

export default function HouseholdPage() {
  const { members, isLoaded: membersLoaded, addMember, removeMember } = useHousehold()
  const { goals, isLoaded: goalsLoaded } = useGoals()
  const { notes, isLoaded: notesLoaded, addNote, removeNote } = useHouseholdNotes()
  const { fmt } = useFormatCurrency()
  const [form, setForm] = useState(EMPTY_FORM)
  const [error, setError] = useState('')
  const [noteForm, setNoteForm] = useState({ title: '', message: '' })
  const [noteError, setNoteError] = useState('')

  if (!membersLoaded || !goalsLoaded || !notesLoaded) {
    return (
      <LoadingSpinner />
    )
  }

  const sharedGoals = goals.filter((g) => g.shared)

  function handleChange(e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  function handleNoteSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isRequired(noteForm.title)) { setNoteError('Title is required.'); return }
    if (!isRequired(noteForm.message)) { setNoteError('Message is required.'); return }
    addNote({
      id:        crypto.randomUUID(),
      title:     noteForm.title.trim(),
      message:   noteForm.message.trim(),
      createdAt: new Date().toISOString(),
    })
    setNoteForm({ title: '', message: '' })
    setNoteError('')
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!isRequired(form.name)) { setError('Name is required.'); return }
    if (!isBasicEmail(form.email)) { setError('A valid email is required.'); return }
    addMember({
      id:        crypto.randomUUID(),
      name:      form.name.trim(),
      email:     form.email.trim().toLowerCase(),
      role:      form.role,
      createdAt: new Date().toISOString(),
    })
    setForm(EMPTY_FORM)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-white">Household</h1>
        <p className="mt-0.5 text-sm text-gray-500">
          Manage shared finances with your family or partner
        </p>
      </div>

      {/* Add member form */}
      <Card>
        <CardHeader>
          <CardTitle>Add Member</CardTitle>
          <span className="text-xs text-gray-500">Local mock — no invitations sent</span>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Name *</label>
                <input
                  name="name"
                  value={form.name}
                  onChange={handleChange}
                  placeholder="Jane Doe"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Email *</label>
                <input
                  name="email"
                  value={form.email}
                  onChange={handleChange}
                  placeholder="jane@example.com"
                  type="text"
                  className={INPUT_CLASS}
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-gray-400">Role *</label>
                <select
                  name="role"
                  value={form.role}
                  onChange={handleChange}
                  className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white focus:border-brand-500 focus:outline-none"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label} — {r.description}</option>
                  ))}
                </select>
              </div>
            </div>
            <FormError message={error} />
            <button type="submit" className={cn(buttonVariants({ size: 'sm' }), 'w-full sm:w-auto')}>
              Add Member
            </button>
          </form>
        </CardContent>
      </Card>

      {/* Member list */}
      {members.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-xl border border-dashed border-surface-border py-10 text-center">
          <Users className="mb-3 h-8 w-8 text-gray-600" />
          <p className="text-sm font-medium text-gray-400">No members yet</p>
          <p className="mt-1 text-xs text-gray-600">Add household members above to get started.</p>
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>Members</CardTitle>
            <span className="text-xs text-gray-500">{members.length} {members.length === 1 ? 'member' : 'members'}</span>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-surface-border">
              {members.map((m) => (
                <div key={m.id} className="flex items-center gap-3 px-4 py-3">
                  <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-surface-muted text-sm font-semibold text-white">
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-white">{m.name}</p>
                    <p className="truncate text-xs text-gray-500">{m.email}</p>
                  </div>
                  <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium capitalize', ROLE_COLORS[m.role])}>
                    {m.role}
                  </span>
                  <button
                    onClick={() => removeMember(m.id)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-600 hover:bg-red-950 hover:text-red-400 transition-colors"
                    aria-label="Remove member"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Review notes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <StickyNote className="h-4 w-4 text-gray-400" />
            Review Notes
          </CardTitle>
          <span className="text-xs text-gray-500">{notes.length} {notes.length === 1 ? 'note' : 'notes'}</span>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Add note form */}
          <form onSubmit={handleNoteSubmit} className="space-y-3">
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Title *</label>
              <input
                value={noteForm.title}
                onChange={(e) => { setNoteForm((p) => ({ ...p, title: e.target.value })); setNoteError('') }}
                placeholder="e.g. Review insurance coverage"
                className={INPUT_CLASS}
              />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-gray-400">Message *</label>
              <textarea
                value={noteForm.message}
                onChange={(e) => { setNoteForm((p) => ({ ...p, message: e.target.value })); setNoteError('') }}
                placeholder="Add details or next steps..."
                rows={3}
                className="w-full rounded-lg border border-surface-border bg-surface-muted px-3 py-2 text-sm text-white placeholder-gray-600 focus:border-brand-500 focus:outline-none resize-none"
              />
            </div>
            <FormError message={noteError} />
            <button type="submit" className={cn(buttonVariants({ size: 'sm' }), 'w-full sm:w-auto')}>
              Add Note
            </button>
          </form>

          {/* Note list */}
          {notes.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-sm text-gray-500">No review notes yet.</p>
              <p className="mt-1 text-xs text-gray-600">Add a note above to track items for household review.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {notes.map((note) => (
                <div key={note.id} className="flex items-start gap-3 rounded-lg border border-surface-border bg-surface-muted/30 px-3 py-3">
                  <div className="min-w-0 flex-1 space-y-1">
                    <p className="text-sm font-medium text-white">{note.title}</p>
                    <p className="text-xs text-gray-400 whitespace-pre-wrap">{note.message}</p>
                    <p className="text-xs text-gray-600">{new Date(note.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}</p>
                  </div>
                  <button
                    onClick={() => removeNote(note.id)}
                    className="shrink-0 rounded-lg p-1.5 text-gray-600 hover:bg-red-950 hover:text-red-400 transition-colors"
                    aria-label="Delete note"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Shared goals */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Target className="h-4 w-4 text-gray-400" />
            Shared Goals
          </CardTitle>
          <span className="text-xs text-gray-500">{sharedGoals.length} shared</span>
        </CardHeader>
        <CardContent className="p-0">
          {sharedGoals.length === 0 ? (
            <div className="px-4 py-8 text-center space-y-2">
              <p className="text-sm text-gray-500">No shared goals yet.</p>
              <p className="text-xs text-gray-600">
                Enable "Share with household" when adding or editing a goal.
              </p>
              <Link href={ROUTES.goals} className="inline-block text-xs text-brand-400 hover:text-brand-300 transition-colors">
                Go to Goals →
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-surface-border">
              {sharedGoals.map((goal) => {
                const pct = goalProgressPct(goal)
                const status = getGoalStatus(goal.currentAmount, goal.targetAmount)
                return (
                  <div key={goal.id} className="px-4 py-3 space-y-2">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-sm font-medium text-white truncate">{goal.name}</span>
                      <span className={cn('shrink-0 rounded-full px-2 py-0.5 text-xs font-medium', GOAL_STATUS_STYLES[status])}>
                        {GOAL_STATUS_LABELS[status]}
                      </span>
                    </div>
                    <div className="h-1.5 w-full overflow-hidden rounded-full bg-surface-muted">
                      <div
                        className="h-full rounded-full bg-brand-500 transition-all duration-300"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{fmt(goal.currentAmount)} saved</span>
                      <span>{pct.toFixed(0)}% of {fmt(goal.targetAmount)}</span>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

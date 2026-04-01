import type { Goal, GoalType } from '@/lib/types/goal'

const VALID_GOAL_TYPES = new Set<string>([
  'savings', 'investment', 'retirement', 'purchase', 'debt', 'other',
])

function isValidGoalType(t: string): t is GoalType {
  return VALID_GOAL_TYPES.has(t)
}

/** Async adapter interface — decouples stores from the underlying data source. */
export type GoalsAdapter = {
  getAll(): Promise<Goal[]>
  saveAll(goals: Goal[]): Promise<void>
  clear(): Promise<void>
}

/** API-backed implementation — persists goals in Turso via /api/goals. */
export const goalsAdapter: GoalsAdapter = {
  async getAll() {
    const res = await fetch('/api/goals', { credentials: 'include' })
    if (!res.ok) throw new Error(`[goalsAdapter] getAll failed: ${res.status}`)
    const data = await res.json() as Goal[]
    return data.filter((g) => {
      if (!g.id || !g.name || !Number.isFinite(g.targetAmount) || !Number.isFinite(g.currentAmount)) {
        console.warn('[goalsAdapter] Skipping malformed goal — missing required fields.', g)
        return false
      }
      if (!isValidGoalType(g.type)) {
        console.warn(`[goalsAdapter] Unknown goal type "${g.type}" on goal "${g.id}" — skipped.`)
        return false
      }
      if (g.currentAmount < 0) {
        console.warn(`[goalsAdapter] Negative currentAmount on goal "${g.id}" — skipped.`)
        return false
      }
      if (g.currentAmount > g.targetAmount) {
        console.warn(`[goalsAdapter] currentAmount exceeds targetAmount on goal "${g.id}" — skipped.`)
        return false
      }
      if (g.targetDate && !/^\d{4}-\d{2}-\d{2}$/.test(g.targetDate)) {
        console.warn(`[goalsAdapter] Invalid targetDate format on goal "${g.id}" — skipped.`)
        return false
      }
      return true
    })
  },

  async saveAll(goals) {
    const res = await fetch('/api/goals', {
      method:      'POST',
      credentials: 'include',
      headers:     { 'Content-Type': 'application/json' },
      body:        JSON.stringify(goals),
    })
    if (!res.ok) throw new Error(`[goalsAdapter] saveAll failed: ${res.status}`)
  },

  async clear() {
    const res = await fetch('/api/goals', {
      method:      'DELETE',
      credentials: 'include',
    })
    if (!res.ok) throw new Error(`[goalsAdapter] clear failed: ${res.status}`)
  },
}

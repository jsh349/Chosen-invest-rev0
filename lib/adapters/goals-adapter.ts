import type { Goal } from '@/lib/types/goal'

/** Async adapter interface — decouples stores from the underlying data source. */
export type GoalsAdapter = {
  getAll(): Promise<Goal[]>
  saveAll(goals: Goal[]): Promise<void>
}

/** API-backed implementation — persists goals in Turso via /api/goals. */
export const goalsAdapter: GoalsAdapter = {
  async getAll() {
    const res = await fetch('/api/goals', { credentials: 'include' })
    if (!res.ok) throw new Error(`[goalsAdapter] getAll failed: ${res.status}`)
    return res.json() as Promise<Goal[]>
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
}

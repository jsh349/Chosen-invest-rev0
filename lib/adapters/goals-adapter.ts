import type { Goal } from '@/lib/types/goal'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.goals

/** Async adapter interface — matches the shape of a future API client. */
export type GoalsAdapter = {
  getAll(): Promise<Goal[]>
  saveAll(goals: Goal[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const goalsAdapter: GoalsAdapter = {
  async getAll() {
    return readJSON<Goal[]>(LS_KEY, [])
  },

  async saveAll(goals) {
    writeJSON(LS_KEY, goals)
  },
}

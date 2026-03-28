import type { Goal } from '@/lib/types/goal'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.goals

/** Minimal data adapter for goals. Swap implementation for API later. */
export const goalsAdapter = {
  getAll(): Goal[] {
    return readJSON<Goal[]>(LS_KEY, [])
  },

  saveAll(goals: Goal[]): void {
    writeJSON(LS_KEY, goals)
  },
}

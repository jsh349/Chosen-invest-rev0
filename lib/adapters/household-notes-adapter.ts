import type { HouseholdNote } from '@/lib/types/household-note'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.householdNotes

/** Async adapter interface — matches the shape of a future API client. */
export type HouseholdNotesAdapter = {
  getAll(): Promise<HouseholdNote[]>
  saveAll(notes: HouseholdNote[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const householdNotesAdapter: HouseholdNotesAdapter = {
  async getAll() {
    return readJSON<HouseholdNote[]>(LS_KEY, [])
  },

  async saveAll(notes) {
    if (!writeJSON(LS_KEY, notes)) throw new Error('localStorage write failed (household notes)')
  },
}

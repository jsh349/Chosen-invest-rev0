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
    // TODO(multi-user): filter by currentUserId once multi-user API is available
    const data = readJSON<HouseholdNote[]>(LS_KEY, [])
    return data.filter((n) => {
      if (!n.id || !n.title || !n.message) {
        console.warn('[householdNotesAdapter] Skipping malformed note — missing id, title, or message.', n)
        return false
      }
      return true
    })
  },

  async saveAll(notes) {
    if (!writeJSON(LS_KEY, notes)) throw new Error('localStorage write failed (household notes)')
  },
}

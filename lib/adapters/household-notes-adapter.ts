import type { HouseholdNote } from '@/lib/types/household-note'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.householdNotes

/** Minimal data adapter for household notes. Swap for API later. */
export const householdNotesAdapter = {
  getAll(): HouseholdNote[] {
    return readJSON<HouseholdNote[]>(LS_KEY, [])
  },

  saveAll(notes: HouseholdNote[]): void {
    writeJSON(LS_KEY, notes)
  },
}

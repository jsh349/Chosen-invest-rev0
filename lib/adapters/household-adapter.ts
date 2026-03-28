import type { HouseholdMember } from '@/lib/types/household'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.household

/** Minimal data adapter for household members. Swap for API later. */
export const householdAdapter = {
  getAll(): HouseholdMember[] {
    return readJSON<HouseholdMember[]>(LS_KEY, [])
  },

  saveAll(members: HouseholdMember[]): void {
    writeJSON(LS_KEY, members)
  },
}

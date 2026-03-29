import type { HouseholdMember } from '@/lib/types/household'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.household

/** Async adapter interface — matches the shape of a future API client. */
export type HouseholdAdapter = {
  getAll(): Promise<HouseholdMember[]>
  saveAll(members: HouseholdMember[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const householdAdapter: HouseholdAdapter = {
  async getAll() {
    return readJSON<HouseholdMember[]>(LS_KEY, [])
  },

  async saveAll(members) {
    writeJSON(LS_KEY, members)
  },
}

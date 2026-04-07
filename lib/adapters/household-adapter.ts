import type { HouseholdMember } from '@/lib/types/household'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.household

const VALID_ROLES = new Set<string>(['admin', 'partner', 'viewer'])

/** Async adapter interface — matches the shape of a future API client. */
export type HouseholdAdapter = {
  getAll(): Promise<HouseholdMember[]>
  saveAll(members: HouseholdMember[]): Promise<void>
}

/** Local implementation backed by localStorage. */
export const householdAdapter: HouseholdAdapter = {
  async getAll() {
    const raw = readJSON<unknown>(LS_KEY, [])
    const data = Array.isArray(raw) ? (raw as HouseholdMember[]) : []
    return data.filter((m) => {
      if (!m.id || !m.name || !m.email || !VALID_ROLES.has(m.role)) {
        console.warn('[householdAdapter] Skipping malformed member — missing id, name, email, or invalid role.', m)
        return false
      }
      return true
    })
  },

  async saveAll(members) {
    if (!writeJSON(LS_KEY, members)) throw new Error('localStorage write failed (household)')
  },
}

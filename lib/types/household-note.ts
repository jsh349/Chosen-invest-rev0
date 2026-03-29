export type HouseholdNote = {
  id: string
  userId?: string   // populated at write time; optional for backward compat with stored data
  title: string
  message: string
  createdAt: string  // ISO timestamp
}

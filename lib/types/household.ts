export type MemberRole = 'admin' | 'partner' | 'viewer'

export type HouseholdMember = {
  id: string
  userId?: string   // populated at write time; optional for backward compat with stored data
  name: string
  email: string
  role: MemberRole
  createdAt: string
}

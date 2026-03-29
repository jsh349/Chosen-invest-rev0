export type MemberRole = 'admin' | 'partner' | 'viewer'

export type HouseholdMember = {
  id: string
  name: string
  email: string
  role: MemberRole
  createdAt: string
}

'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
  useCallback,
  type ReactNode,
} from 'react'
import type { HouseholdMember } from '@/lib/types/household'
import { householdAdapter } from '@/lib/adapters/household-adapter'
import { recordAudit } from '@/lib/store/audit-store'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

type HouseholdContextType = {
  members: HouseholdMember[]
  isLoaded: boolean
  addMember: (member: HouseholdMember) => void
  removeMember: (id: string) => void
}

const HouseholdContext = createContext<HouseholdContextType>({
  members: [],
  isLoaded: false,
  addMember: () => {},
  removeMember: () => {},
})

export function HouseholdProvider({ children }: { children: ReactNode }) {
  const [members, setMembers] = useState<HouseholdMember[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  // Ref mirrors state so callbacks can build the updated array without
  // putting async side-effects inside the setState updater (which React
  // Strict Mode double-invokes in development).
  const membersRef = useRef<HouseholdMember[]>([])

  useEffect(() => {
    let cancelled = false
    householdAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) {
        membersRef.current = stored
        setMembers(stored)
      }
      setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const addMember = useCallback((member: HouseholdMember) => {
    const memberWithUser: HouseholdMember = { ...member, userId: member.userId ?? LOCAL_USER_ID }
    const updated = [...membersRef.current, memberWithUser]
    membersRef.current = updated
    setMembers(updated)
    void householdAdapter.saveAll(updated).catch(() => { console.error('[household] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    recordAudit('Household member added', memberWithUser.name)
  }, [])

  const removeMember = useCallback((id: string) => {
    const target = membersRef.current.find((m) => m.id === id)
    const updated = membersRef.current.filter((m) => m.id !== id)
    membersRef.current = updated
    setMembers(updated)
    void householdAdapter.saveAll(updated).catch(() => { console.error('[household] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    if (target) recordAudit('Household member removed', target.name)
  }, [])

  return (
    <HouseholdContext.Provider value={{ members, isLoaded, addMember, removeMember }}>
      {children}
    </HouseholdContext.Provider>
  )
}

export function useHousehold() {
  return useContext(HouseholdContext)
}

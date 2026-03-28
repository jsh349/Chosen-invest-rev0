'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { HouseholdMember } from '@/lib/types/household'
import { householdAdapter } from '@/lib/adapters/household-adapter'

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

  useEffect(() => {
    const stored = householdAdapter.getAll()
    if (stored.length > 0) setMembers(stored)
    setIsLoaded(true)
  }, [])

  const addMember = useCallback((member: HouseholdMember) => {
    setMembers((prev) => {
      const updated = [...prev, member]
      householdAdapter.saveAll(updated)
      return updated
    })
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      householdAdapter.saveAll(updated)
      return updated
    })
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

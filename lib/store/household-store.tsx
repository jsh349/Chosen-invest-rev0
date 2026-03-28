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

const LS_KEY = 'chosen_household_v1'

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
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) setMembers(JSON.parse(stored))
    } catch {
      // ignore malformed data
    }
    setIsLoaded(true)
  }, [])

  const addMember = useCallback((member: HouseholdMember) => {
    setMembers((prev) => {
      const updated = [...prev, member]
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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

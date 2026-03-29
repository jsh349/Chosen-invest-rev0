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
    let cancelled = false
    householdAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) setMembers(stored)
      setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const addMember = useCallback((member: HouseholdMember) => {
    setMembers((prev) => {
      const updated = [...prev, member]
      void householdAdapter.saveAll(updated).catch(console.error)
      return updated
    })
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      void householdAdapter.saveAll(updated).catch(console.error)
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

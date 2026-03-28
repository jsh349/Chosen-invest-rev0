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
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.household

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
    const stored = readJSON<HouseholdMember[]>(LS_KEY, [])
    if (stored.length > 0) setMembers(stored)
    setIsLoaded(true)
  }, [])

  const addMember = useCallback((member: HouseholdMember) => {
    setMembers((prev) => {
      const updated = [...prev, member]
      writeJSON(LS_KEY, updated)
      return updated
    })
  }, [])

  const removeMember = useCallback((id: string) => {
    setMembers((prev) => {
      const updated = prev.filter((m) => m.id !== id)
      writeJSON(LS_KEY, updated)
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

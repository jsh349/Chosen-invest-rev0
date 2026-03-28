'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { HouseholdNote } from '@/lib/types/household-note'
import { householdNotesAdapter } from '@/lib/adapters/household-notes-adapter'

type HouseholdNotesContextType = {
  notes: HouseholdNote[]
  isLoaded: boolean
  addNote: (note: HouseholdNote) => void
  removeNote: (id: string) => void
}

const HouseholdNotesContext = createContext<HouseholdNotesContextType>({
  notes: [],
  isLoaded: false,
  addNote: () => {},
  removeNote: () => {},
})

export function HouseholdNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<HouseholdNote[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = householdNotesAdapter.getAll()
    if (stored.length > 0) setNotes(stored)
    setIsLoaded(true)
  }, [])

  const addNote = useCallback((note: HouseholdNote) => {
    setNotes((prev) => {
      const updated = [note, ...prev]
      householdNotesAdapter.saveAll(updated)
      return updated
    })
  }, [])

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => {
      const updated = prev.filter((n) => n.id !== id)
      householdNotesAdapter.saveAll(updated)
      return updated
    })
  }, [])

  return (
    <HouseholdNotesContext.Provider value={{ notes, isLoaded, addNote, removeNote }}>
      {children}
    </HouseholdNotesContext.Provider>
  )
}

export function useHouseholdNotes() {
  return useContext(HouseholdNotesContext)
}

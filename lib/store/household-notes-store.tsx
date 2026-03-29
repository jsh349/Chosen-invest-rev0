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
import { recordAudit } from '@/lib/store/audit-store'

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
    let cancelled = false
    householdNotesAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) setNotes(stored)
      setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const addNote = useCallback((note: HouseholdNote) => {
    setNotes((prev) => {
      const updated = [note, ...prev]
      void householdNotesAdapter.saveAll(updated).catch(console.error)
      return updated
    })
    recordAudit('Note added', note.title)
  }, [])

  const removeNote = useCallback((id: string) => {
    setNotes((prev) => {
      const target = prev.find((n) => n.id === id)
      if (target) recordAudit('Note deleted', target.title)
      const updated = prev.filter((n) => n.id !== id)
      void householdNotesAdapter.saveAll(updated).catch(console.error)
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

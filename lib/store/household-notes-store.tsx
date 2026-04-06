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
import type { HouseholdNote } from '@/lib/types/household-note'
import { householdNotesAdapter } from '@/lib/adapters/household-notes-adapter'
import { recordAudit } from '@/lib/store/audit-store'
import { LOCAL_USER_ID } from '@/lib/constants/auth'

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
  // Ref mirrors state so callbacks can build the updated array without
  // putting async side-effects inside the setState updater.
  const notesRef = useRef<HouseholdNote[]>([])

  useEffect(() => {
    let cancelled = false
    householdNotesAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) {
        notesRef.current = stored
        setNotes(stored)
      }
      setIsLoaded(true)
    }).catch(() => { if (!cancelled) setIsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const addNote = useCallback((note: HouseholdNote) => {
    const noteWithUser: HouseholdNote = { ...note, userId: note.userId ?? LOCAL_USER_ID }
    const updated = [noteWithUser, ...notesRef.current]
    notesRef.current = updated
    setNotes(updated)
    void householdNotesAdapter.saveAll(updated).catch(console.error)
    recordAudit('Note added', noteWithUser.title)
  }, [])

  const removeNote = useCallback((id: string) => {
    const target = notesRef.current.find((n) => n.id === id)
    const updated = notesRef.current.filter((n) => n.id !== id)
    notesRef.current = updated
    setNotes(updated)
    void householdNotesAdapter.saveAll(updated).catch(console.error)
    if (target) recordAudit('Note deleted', target.title)
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

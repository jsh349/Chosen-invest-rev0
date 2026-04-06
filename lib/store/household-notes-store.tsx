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
import { useCurrentUserId } from '@/lib/hooks/use-current-user-id'

type HouseholdNotesContextType = {
  notes: HouseholdNote[]
  isLoaded: boolean
  isLoadError: boolean
  addNote: (note: HouseholdNote) => void
  removeNote: (id: string) => void
}

const HouseholdNotesContext = createContext<HouseholdNotesContextType>({
  notes: [],
  isLoaded: false,
  isLoadError: false,
  addNote: () => {},
  removeNote: () => {},
})

export function HouseholdNotesProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<HouseholdNote[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)
  const currentUserId = useCurrentUserId()
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
    }).catch(() => {
      if (!cancelled) {
        setIsLoadError(true)
        setIsLoaded(true)
      }
    })
    return () => { cancelled = true }
  }, [])

  const addNote = useCallback((note: HouseholdNote) => {
    const prev = notesRef.current
    const noteWithUser: HouseholdNote = { ...note, userId: note.userId ?? currentUserId }
    const updated = [noteWithUser, ...notesRef.current]
    notesRef.current = updated
    setNotes(updated)
    void householdNotesAdapter.saveAll(updated).catch((err) => {
      console.error('[HouseholdNotesStore] addNote save failed', err)
      notesRef.current = prev
      setNotes(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
    recordAudit('Note added', noteWithUser.title)
  }, [currentUserId])

  const removeNote = useCallback((id: string) => {
    const prev = notesRef.current
    const target = notesRef.current.find((n) => n.id === id)
    const prev = notesRef.current
    const updated = prev.filter((n) => n.id !== id)
    notesRef.current = updated
    setNotes(updated)
    void householdNotesAdapter.saveAll(updated).catch((err) => {
      console.error('[HouseholdNotesStore] removeNote save failed', err)
      notesRef.current = prev
      setNotes(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
    if (target) recordAudit('Note deleted', target.title)
  }, [])

  return (
    <HouseholdNotesContext.Provider value={{ notes, isLoaded, isLoadError, addNote, removeNote }}>
      {children}
    </HouseholdNotesContext.Provider>
  )
}

export function useHouseholdNotes() {
  return useContext(HouseholdNotesContext)
}

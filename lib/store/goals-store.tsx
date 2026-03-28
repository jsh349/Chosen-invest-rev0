'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react'
import type { Goal } from '@/lib/types/goal'
import { recordAudit } from '@/lib/store/audit-store'
import { STORAGE_KEYS } from '@/lib/constants/storage-keys'
import { readJSON, writeJSON } from '@/lib/utils/local-storage'

const LS_KEY = STORAGE_KEYS.goals

type GoalsContextType = {
  goals: Goal[]
  hasGoals: boolean
  isLoaded: boolean
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void
  removeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  hasGoals: false,
  isLoaded: false,
  setGoals: () => {},
  addGoal: () => {},
  updateGoal: () => {},
  removeGoal: () => {},
})

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoalsState] = useState<Goal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)

  useEffect(() => {
    const stored = readJSON<Goal[]>(LS_KEY, [])
    if (stored.length > 0) setGoalsState(stored)
    setIsLoaded(true)
  }, [])

  const setGoals = useCallback((newGoals: Goal[]) => {
    writeJSON(LS_KEY, newGoals)
    setGoalsState(newGoals)
  }, [])

  const addGoal = useCallback((goal: Goal) => {
    setGoalsState((prev) => {
      const updated = [...prev, goal]
      writeJSON(LS_KEY, updated)
      return updated
    })
    recordAudit('Goal added', goal.name)
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      const updated = prev.map((g) =>
        g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
      )
      writeJSON(LS_KEY, updated)
      if (target) recordAudit('Goal edited', patch.name ?? target.name)
      return updated
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      if (target) recordAudit('Goal deleted', target.name)
      const updated = prev.filter((g) => g.id !== id)
      writeJSON(LS_KEY, updated)
      return updated
    })
  }, [])

  return (
    <GoalsContext.Provider
      value={{ goals, hasGoals: goals.length > 0, isLoaded, setGoals, addGoal, updateGoal, removeGoal }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  return useContext(GoalsContext)
}

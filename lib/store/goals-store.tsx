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

const LS_KEY = 'chosen_goals_v1'

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
    try {
      const stored = window.localStorage.getItem(LS_KEY)
      if (stored) setGoalsState(JSON.parse(stored))
    } catch {
      // ignore malformed data
    }
    setIsLoaded(true)
  }, [])

  const setGoals = useCallback((newGoals: Goal[]) => {
    window.localStorage.setItem(LS_KEY, JSON.stringify(newGoals))
    setGoalsState(newGoals)
  }, [])

  const addGoal = useCallback((goal: Goal) => {
    setGoalsState((prev) => {
      const updated = [...prev, goal]
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
      if (target) recordAudit('Goal edited', patch.name ?? target.name)
      return updated
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      if (target) recordAudit('Goal deleted', target.name)
      const updated = prev.filter((g) => g.id !== id)
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
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

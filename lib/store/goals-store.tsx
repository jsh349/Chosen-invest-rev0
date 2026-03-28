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

const LS_KEY = 'chosen_goals_v1'

type GoalsContextType = {
  goals: Goal[]
  hasGoals: boolean
  isLoaded: boolean
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  removeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  hasGoals: false,
  isLoaded: false,
  setGoals: () => {},
  addGoal: () => {},
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
  }, [])

  const removeGoal = useCallback((id: string) => {
    setGoalsState((prev) => {
      const updated = prev.filter((g) => g.id !== id)
      window.localStorage.setItem(LS_KEY, JSON.stringify(updated))
      return updated
    })
  }, [])

  return (
    <GoalsContext.Provider
      value={{ goals, hasGoals: goals.length > 0, isLoaded, setGoals, addGoal, removeGoal }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  return useContext(GoalsContext)
}

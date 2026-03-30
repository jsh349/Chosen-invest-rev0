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
import { goalsAdapter } from '@/lib/adapters/goals-adapter'

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
    let cancelled = false
    goalsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) setGoalsState(stored)
      setIsLoaded(true)
    })
    return () => { cancelled = true }
  }, [])

  const setGoals = useCallback((newGoals: Goal[]) => {
    void goalsAdapter.saveAll(newGoals).catch(() => { console.error('[goals] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
    setGoalsState(newGoals)
  }, [])

  const addGoal = useCallback((goal: Goal) => {
    setGoalsState((prev) => {
      const updated = [...prev, goal]
      void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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
      void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
      if (target) recordAudit('Goal edited', patch.name ?? target.name)
      return updated
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      if (target) recordAudit('Goal deleted', target.name)
      const updated = prev.filter((g) => g.id !== id)
      void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); window.dispatchEvent(new CustomEvent('persist-error')) })
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

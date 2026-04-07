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
  /** Returns a Promise so callers can await and catch save failures. */
  addGoal: (goal: Goal) => Promise<void>
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void
  removeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  hasGoals: false,
  isLoaded: false,
  setGoals: () => {},
  addGoal: () => Promise.resolve(),
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
    }).catch(() => { if (!cancelled) setIsLoaded(true) })
    return () => { cancelled = true }
  }, [])

  const setGoals = useCallback((newGoals: Goal[]) => {
    setGoalsState(prev => {
      goalsAdapter.saveAll(newGoals)
        .catch(err => { console.error(err); setGoalsState(prev) })
      return newGoals
    })
  }, [])

  const addGoal = useCallback((goal: Goal): Promise<void> => {
    let savePromise: Promise<void> = Promise.resolve()
    setGoalsState((prev) => {
      const updated = [...prev, goal]
      savePromise = goalsAdapter.saveAll(updated)
        .catch((err) => {
          console.error(err)
          setGoalsState(prev)
          throw err  // re-throw so the caller's catch block fires
        })
      return updated
    })
    recordAudit('Goal added', goal.name)
    return savePromise
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      const updated = prev.map((g) =>
        g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
      )
      goalsAdapter.saveAll(updated)
        .then(() => { /* state already set */ })
        .catch((err) => { console.error(err); setGoalsState(prev) })
      if (target) recordAudit('Goal edited', patch.name ?? target.name)
      return updated
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    setGoalsState((prev) => {
      const target = prev.find((g) => g.id === id)
      if (target) recordAudit('Goal deleted', target.name)
      const updated = prev.filter((g) => g.id !== id)
      goalsAdapter.saveAll(updated)
        .then(() => { /* state already set */ })
        .catch((err) => { console.error(err); setGoalsState(prev) })
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

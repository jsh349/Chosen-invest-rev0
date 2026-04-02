'use client'

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
  type ReactNode,
} from 'react'
import type { Goal } from '@/lib/types/goal'
import { recordAudit } from '@/lib/store/audit-store'
import { goalsAdapter } from '@/lib/adapters/goals-adapter'

type GoalsContextType = {
  goals: Goal[]
  hasGoals: boolean
  isLoaded: boolean
  /** True when the initial load failed. isLoaded is also true in this state. */
  isLoadError: boolean
  setGoals: (goals: Goal[]) => void
  addGoal: (goal: Goal) => void
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => void
  removeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  hasGoals: false,
  isLoaded: false,
  isLoadError: false,
  setGoals: () => {},
  addGoal: () => {},
  updateGoal: () => {},
  removeGoal: () => {},
})

export function GoalsProvider({ children }: { children: ReactNode }) {
  const [goals, setGoalsState] = useState<Goal[]>([])
  const [isLoaded, setIsLoaded] = useState(false)
  const [isLoadError, setIsLoadError] = useState(false)
  // Ref mirrors state so mutation callbacks can build the next array without
  // putting async side-effects inside the setState updater (Strict Mode double-invoke).
  const goalsRef = useRef<Goal[]>([])

  useEffect(() => {
    let cancelled = false
    goalsAdapter.getAll().then((stored) => {
      if (cancelled) return
      if (stored.length > 0) {
        goalsRef.current = stored
        setGoalsState(stored)
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

  const setGoals = useCallback((newGoals: Goal[]) => {
    goalsRef.current = newGoals
    setGoalsState(newGoals)
    void goalsAdapter.saveAll(newGoals).catch(() => { console.error('[goals] save failed'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error')) })
  }, [])

  const addGoal = useCallback((goal: Goal) => {
    const updated = [...goalsRef.current, goal]
    goalsRef.current = updated
    setGoalsState(updated)
    void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error')) })
    recordAudit('Goal added', goal.name)
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => {
    const target = goalsRef.current.find((g) => g.id === id)
    const updated = goalsRef.current.map((g) =>
      g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
    )
    goalsRef.current = updated
    setGoalsState(updated)
    void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error')) })
    if (target) recordAudit('Goal edited', patch.name ?? target.name)
  }, [])

  const removeGoal = useCallback((id: string) => {
    const target = goalsRef.current.find((g) => g.id === id)
    if (target) recordAudit('Goal deleted', target.name)
    const updated = goalsRef.current.filter((g) => g.id !== id)
    goalsRef.current = updated
    setGoalsState(updated)
    void goalsAdapter.saveAll(updated).catch(() => { console.error('[goals] save failed'); if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error')) })
  }, [])

  return (
    <GoalsContext.Provider
      value={{ goals, hasGoals: goals.length > 0, isLoaded, isLoadError, setGoals, addGoal, updateGoal, removeGoal }}
    >
      {children}
    </GoalsContext.Provider>
  )
}

export function useGoals() {
  return useContext(GoalsContext)
}

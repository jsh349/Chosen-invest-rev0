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
  /** Returns a Promise so callers can await and catch save failures. */
  addGoal: (goal: Goal) => Promise<void>
  /** Returns a Promise so callers can await and catch save failures. */
  updateGoal: (id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>) => Promise<void>
  removeGoal: (id: string) => void
}

const GoalsContext = createContext<GoalsContextType>({
  goals: [],
  hasGoals: false,
  isLoaded: false,
  isLoadError: false,
  setGoals: () => {},
  addGoal: () => Promise.resolve(),
  updateGoal: () => Promise.resolve(),
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
    void goalsAdapter.saveAll(newGoals).catch((err) => { console.error(err) })
  }, [])

  const addGoal = useCallback((goal: Goal): Promise<void> => {
    const prev = goalsRef.current
    const updated = [...goalsRef.current, goal]
    goalsRef.current = updated
    setGoalsState(updated)
    recordAudit('Goal added', goal.name)
    return goalsAdapter.saveAll(updated).catch((err) => {
      console.error(err)
      goalsRef.current = prev
      setGoalsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
      throw err  // re-throw so the caller's catch block fires
    })
  }, [])

  const updateGoal = useCallback((id: string, patch: Partial<Omit<Goal, 'id' | 'createdAt'>>): Promise<void> => {
    const prev = goalsRef.current
    const target = prev.find((g) => g.id === id)
    const updated = prev.map((g) =>
      g.id === id ? { ...g, ...patch, updatedAt: new Date().toISOString() } : g
    )
    goalsRef.current = updated
    setGoalsState(updated)
    if (target) recordAudit('Goal edited', patch.name ?? target.name)
    return goalsAdapter.saveAll(updated).catch((err) => {
      console.error(err)
      goalsRef.current = prev
      setGoalsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
      throw err
    })
  }, [])

  const removeGoal = useCallback((id: string) => {
    const prev = goalsRef.current
    const target = prev.find((g) => g.id === id)
    if (target) recordAudit('Goal deleted', target.name)
    const updated = prev.filter((g) => g.id !== id)
    goalsRef.current = updated
    setGoalsState(updated)
    void goalsAdapter.saveAll(updated).catch(() => {
      console.error('[goals] save failed')
      goalsRef.current = prev
      setGoalsState(prev)
      if (typeof window !== 'undefined') window.dispatchEvent(new CustomEvent('persist-error'))
    })
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

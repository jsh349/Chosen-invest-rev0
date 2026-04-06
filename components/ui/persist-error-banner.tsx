'use client'

import { useEffect, useRef, useState } from 'react'

/**
 * Listens for 'persist-error' CustomEvents dispatched by store save handlers
 * and shows a dismissible banner so users know when a save failed.
 * Applies a ~3 s cooldown to avoid re-showing immediately after dismiss.
 */
export function PersistErrorBanner() {
  const [visible, setVisible] = useState(false)
  const lastShownAt = useRef<number>(0)

  useEffect(() => {
    function onError() {
      const now = Date.now()
      if (now - lastShownAt.current < 3000) return
      lastShownAt.current = now
      setVisible(true)
    }
    window.addEventListener('persist-error', onError)
    return () => window.removeEventListener('persist-error', onError)
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-red-950 border-b border-red-800 px-4 py-2">
      <p className="text-xs text-red-300">
        Failed to save — your changes may not have been persisted. Try again or export your data as a backup.
      </p>
      <button
        onClick={() => setVisible(false)}
        className="shrink-0 text-[10px] text-red-400 hover:text-red-200 transition-colors"
      >
        Dismiss
      </button>
    </div>
  )
}

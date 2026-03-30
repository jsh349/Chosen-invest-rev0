'use client'

import { useEffect, useState } from 'react'

/**
 * Listens for 'persist-error' CustomEvents dispatched by store save handlers
 * and shows a dismissible banner so users know when a save failed.
 */
export function PersistErrorBanner() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onError() { setVisible(true) }
    window.addEventListener('persist-error', onError)
    return () => window.removeEventListener('persist-error', onError)
  }, [])

  if (!visible) return null

  return (
    <div className="flex items-center justify-between gap-3 bg-red-950 border-b border-red-800 px-4 py-2">
      <p className="text-xs text-red-300">
        Failed to save — your browser storage may be full. Export your data to avoid losing changes.
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

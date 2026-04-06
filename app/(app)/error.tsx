'use client'

export default function AppError({
  error,
  reset,
}: {
  error: Error
  reset: () => void
}) {
  return (
    <div className="flex min-h-[50vh] items-center justify-center">
      <div className="w-full max-w-md rounded-lg bg-surface-card p-8 text-center">
        <h2 className="text-lg font-semibold text-white">Something went wrong</h2>
        <p className="mt-2 text-sm text-gray-400">
          An unexpected error occurred. Your data has not been changed.
        </p>
        <button
          onClick={reset}
          className="mt-6 rounded-md bg-brand-500 px-4 py-2 text-sm font-medium text-white hover:bg-brand-600 transition-colors"
        >
          Try again
        </button>
      </div>
    </div>
  )
}

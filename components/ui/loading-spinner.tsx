/** Full-width centered loading spinner used as page-level loading state. */
export function LoadingSpinner() {
  return (
    <div className="flex h-64 items-center justify-center">
      <div className="h-6 w-6 animate-spin rounded-full border-2 border-brand-500 border-t-transparent" />
    </div>
  )
}

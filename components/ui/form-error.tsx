/** Inline form validation error message. Renders nothing when message is empty. */
export function FormError({ message }: { message: string }) {
  if (!message) return null
  return (
    <p className="rounded-lg bg-red-950/60 px-3 py-2 text-xs text-red-400" role="alert">
      {message}
    </p>
  )
}

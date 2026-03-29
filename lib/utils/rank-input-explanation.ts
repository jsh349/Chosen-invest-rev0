/**
 * Returns a concise sentence describing which inputs the current rank
 * comparison is based on, or null when all comparison inputs are available
 * (no explanation needed — the comparison is as complete as possible).
 *
 * Intended for one-line display near rank completeness indicators.
 */
export function getRankInputExplanation(flags: {
  hasAge:    boolean
  hasGender: boolean
  hasReturn: boolean
}): string | null {
  const { hasAge, hasGender, hasReturn } = flags

  // Full inputs — nothing to flag.
  if (hasAge && hasGender && hasReturn) return null

  const parts: string[] = ['asset total']
  if (hasAge)    parts.push('age')
  if (hasGender) parts.push('gender')
  if (hasReturn) parts.push('estimated return')

  if (parts.length === 1) return 'Based on your asset total only.'

  const last = parts[parts.length - 1]
  const rest = parts.slice(0, -1)
  const list = rest.length === 1
    ? `${rest[0]} and ${last}`
    : `${rest.join(', ')}, and ${last}`

  return `Based on your ${list}.`
}

/** Shared form-validation helpers. Pure functions, no side effects. */

/** Returns true if the trimmed string is non-empty. */
export function isRequired(value: string): boolean {
  return value.trim().length > 0
}

/** Parse a string to a finite positive number, or return null. */
export function parsePositive(value: string): number | null {
  const n = parseFloat(value)
  if (!Number.isFinite(n) || n <= 0) return null
  return n
}

/** Parse a string to a finite non-negative number, or return null. */
export function parseNonNegative(value: string): number | null {
  if (value === '') return 0
  const n = parseFloat(value)
  if (!Number.isFinite(n) || n < 0) return null
  return n
}

/** Returns true if the string is a valid calendar date in YYYY-MM-DD format. */
export function isDateFormat(value: string): boolean {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const d = new Date(value)
  return !isNaN(d.getTime()) && d.toISOString().startsWith(value)
}

/** Returns true if the string looks like a basic email (has user@domain.tld). */
export function isBasicEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
}

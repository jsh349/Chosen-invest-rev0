/**
 * Returns the current year-month string "YYYY-MM" using local time.
 *
 * Do NOT use `new Date().toISOString().slice(0, 7)` — that returns UTC, which
 * can differ from the local calendar date near midnight around month boundaries.
 */
export function currentYearMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

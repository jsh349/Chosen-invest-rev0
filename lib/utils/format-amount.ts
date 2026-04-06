/**
 * Formats a signed transaction amount with a leading +/- prefix.
 * Uses the caller-supplied currency formatter for the absolute value.
 *
 * @param amount - Signed number (positive = income, negative = expense)
 * @param fmt    - Currency formatter from useFormatCurrency
 */
export function formatSignedAmount(amount: number, fmt: (n: number) => string): string {
  const prefix = amount >= 0 ? '+' : '-'
  return `${prefix}${fmt(Math.abs(amount))}`
}

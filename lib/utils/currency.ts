export function formatCurrency(
  value: number,
  currency = 'USD',
  locale = 'en-US',
  showCents = false
): string {
  const fractionDigits = showCents ? 2 : 0
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value)
}

const COMPACT_SUFFIXES: [number, string][] = [
  [1_000_000_000, 'B'],
  [1_000_000, 'M'],
  [1_000, 'K'],
]

export function formatCompact(
  value: number,
  currencySymbol = '$',
  showCents = false
): string {
  for (const [threshold, suffix] of COMPACT_SUFFIXES) {
    if (Math.abs(value) >= threshold) {
      const divided = value / threshold
      const formatted = showCents ? divided.toFixed(1) : divided.toFixed(0)
      return `${currencySymbol}${formatted}${suffix}`
    }
  }
  return showCents
    ? `${currencySymbol}${value.toFixed(2)}`
    : `${currencySymbol}${value.toFixed(0)}`
}

/** Returns the primary symbol for a currency code (best-effort). */
export function getCurrencySymbol(currency: string, locale = 'en-US'): string {
  try {
    const parts = new Intl.NumberFormat(locale, { style: 'currency', currency })
      .formatToParts(0)
    return parts.find((p) => p.type === 'currency')?.value ?? currency
  } catch {
    return currency
  }
}

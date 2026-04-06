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
  const sign = value < 0 ? '-' : ''
  const abs = Math.abs(value)
  for (const [threshold, suffix] of COMPACT_SUFFIXES) {
    if (abs >= threshold) {
      const divided = abs / threshold
      const formatted = showCents ? divided.toFixed(1) : divided.toFixed(0)
      return `${sign}${currencySymbol}${formatted}${suffix}`
    }
  }
  return showCents
    ? `${sign}${currencySymbol}${abs.toFixed(2)}`
    : `${sign}${currencySymbol}${abs.toFixed(0)}`
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

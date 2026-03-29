'use client'

import { useCallback } from 'react'
import { useSettings } from '@/lib/store/settings-store'
import { formatCurrency, formatCompact, getCurrencySymbol } from '@/lib/utils/currency'

/**
 * Returns formatting helpers bound to the user's currency + showCents settings.
 *
 * - `fmt(value)`        — full currency format, e.g. "$1,234" or "€1,234.56"
 * - `compact(value)`    — compact format, e.g. "$1K" or "€1.2M"
 * - `symbol`            — primary currency symbol, e.g. "$"
 */
export function useFormatCurrency() {
  const { settings } = useSettings()
  const { currency, showCents } = settings

  const symbol = getCurrencySymbol(currency)

  const fmt = useCallback(
    (value: number) => formatCurrency(value, currency, 'en-US', showCents),
    [currency, showCents]
  )

  const compact = useCallback(
    (value: number) => formatCompact(value, symbol, showCents),
    [symbol, showCents]
  )

  return { fmt, compact, symbol, currency, showCents }
}

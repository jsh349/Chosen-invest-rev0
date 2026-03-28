import type { MarketTicker } from '@/lib/types/market'
import { cn } from '@/lib/utils/cn'

interface MarketTickerRowProps {
  ticker: MarketTicker
  priceLocale?: string
}

function formatPrice(price: number, symbol: string): string {
  // KRX 종목은 원화 표시
  if (['005930', '000660', '035420'].includes(symbol)) {
    return price.toLocaleString('ko-KR') + ' ₩'
  }
  // 소수점 자리수 동적 처리
  if (price < 0.01)  return price.toFixed(6)
  if (price < 1)     return price.toFixed(4)
  if (price < 10)    return price.toFixed(3)
  if (price < 1000)  return price.toFixed(2)
  return price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

function formatChange(change: number, symbol: string): string {
  const prefix = change >= 0 ? '+' : ''
  if (['005930', '000660', '035420'].includes(symbol)) {
    return prefix + change.toLocaleString('ko-KR')
  }
  if (Math.abs(change) < 0.01) return prefix + change.toFixed(5)
  if (Math.abs(change) < 1)    return prefix + change.toFixed(3)
  return prefix + change.toFixed(2)
}

export function MarketTickerRow({ ticker }: MarketTickerRowProps) {
  const isPositive = ticker.changePercent >= 0
  const changeColor = isPositive ? 'text-emerald-400' : 'text-red-400'
  const changeBg    = isPositive ? 'bg-emerald-950/60 border-emerald-900/40' : 'bg-red-950/60 border-red-900/40'

  return (
    <div className="flex items-center gap-3 px-4 py-3.5 transition-colors hover:bg-surface-muted/50">
      {/* Flag / emoji */}
      <span className="w-6 flex-shrink-0 text-center text-base leading-none">
        {ticker.flag ?? '•'}
      </span>

      {/* Name + symbol */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-white leading-tight">
          {ticker.name}
        </p>
        <p className="mt-0.5 text-xs text-gray-500">
          {ticker.symbol} · {ticker.exchange}
        </p>
      </div>

      {/* Price + change */}
      <div className="flex-shrink-0 text-right">
        <p className="text-sm font-bold text-white tabular-nums leading-tight">
          {formatPrice(ticker.price, ticker.symbol)}
        </p>
        <p className={cn('mt-0.5 text-xs font-medium tabular-nums', changeColor)}>
          {formatChange(ticker.change, ticker.symbol)}&nbsp;
          ({ticker.changePercent >= 0 ? '+' : ''}{ticker.changePercent.toFixed(2)}%)
        </p>
      </div>
    </div>
  )
}

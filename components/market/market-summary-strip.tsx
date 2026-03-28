import type { MarketTicker } from '@/lib/types/market'
import { cn } from '@/lib/utils/cn'

interface MarketSummaryStripProps {
  tickers: MarketTicker[]   // 3~5개 주요 지수
}

export function MarketSummaryStrip({ tickers }: MarketSummaryStripProps) {
  return (
    <div className="flex gap-3 overflow-x-auto pb-1 scrollbar-none">
      {tickers.map((t) => {
        const positive = t.changePercent >= 0
        return (
          <div
            key={t.symbol}
            className={cn(
              'flex-shrink-0 rounded-xl border px-4 py-3 min-w-[130px]',
              positive
                ? 'border-emerald-900/40 bg-emerald-950/30'
                : 'border-red-900/40 bg-red-950/30'
            )}
          >
            <p className="text-xs text-gray-400 truncate">{t.name}</p>
            <p className="mt-1 text-sm font-bold text-white tabular-nums">
              {t.price.toLocaleString()}
            </p>
            <p className={cn('mt-0.5 text-xs font-medium tabular-nums', positive ? 'text-emerald-400' : 'text-red-400')}>
              {positive ? '+' : ''}{t.changePercent.toFixed(2)}%
            </p>
          </div>
        )
      })}
    </div>
  )
}

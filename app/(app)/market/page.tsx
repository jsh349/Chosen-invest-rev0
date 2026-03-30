'use client'

import { useState, useMemo } from 'react'
import { RefreshCw } from 'lucide-react'
import { MarketTickerRow } from '@/components/market/market-ticker-row'
import { MarketSearchBar } from '@/components/market/market-search-bar'
import { MarketSummaryStrip } from '@/components/market/market-summary-strip'
import '@/lib/mock/guard'
import {
  MOCK_INDICES,
  MOCK_STOCKS,
  MOCK_COMMODITIES,
  MOCK_CRYPTO,
} from '@/lib/mock/market'
import type { MarketCategory, MarketFilter } from '@/lib/types/market'
import { cn } from '@/lib/utils/cn'

const TABS: { key: MarketCategory; label: string }[] = [
  { key: 'indices',     label: 'Indices'     },
  { key: 'stocks',      label: 'Stocks'      },
  { key: 'commodities', label: 'Commodities' },
  { key: 'crypto',      label: 'Crypto'      },
]

const FILTERS: { key: MarketFilter; label: string }[] = [
  { key: 'most_active',  label: 'Most Active'  },
  { key: 'top_gainers',  label: 'Top Gainers'  },
  { key: 'top_losers',   label: 'Top Losers'   },
]

const DATA_MAP = {
  indices:     MOCK_INDICES,
  stocks:      MOCK_STOCKS,
  commodities: MOCK_COMMODITIES,
  crypto:      MOCK_CRYPTO,
}

// 상단 스트립용 주요 지수 5개
const STRIP_TICKERS = MOCK_INDICES.slice(0, 5)

export default function MarketPage() {
  const [activeTab,    setActiveTab]    = useState<MarketCategory>('stocks')
  const [activeFilter, setActiveFilter] = useState<MarketFilter>('most_active')
  const [search,       setSearch]       = useState('')
  const [lastUpdated]                   = useState(() => new Date().toLocaleTimeString())

  const filtered = useMemo(() => {
    let list = [...DATA_MAP[activeTab]]

    // 검색 필터
    if (search.trim()) {
      const q = search.toLowerCase()
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.symbol.toLowerCase().includes(q)
      )
    }

    // 정렬 필터
    if (activeFilter === 'top_gainers') {
      list.sort((a, b) => b.changePercent - a.changePercent)
    } else if (activeFilter === 'top_losers') {
      list.sort((a, b) => a.changePercent - b.changePercent)
    }
    // most_active는 원래 순서 유지

    return list
  }, [activeTab, activeFilter, search])

  const gainers = filtered.filter((t) => t.changePercent > 0).length
  const losers  = filtered.filter((t) => t.changePercent < 0).length

  return (
    <div className="flex flex-col gap-0 -m-4 lg:-m-6 min-h-full">

      {/* ── 상단 헤더 ── */}
      <div className="border-b border-surface-border px-4 pt-5 pb-4 lg:px-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-white">Market</h1>
            <p className="mt-0.5 text-xs text-gray-500 flex items-center gap-1.5">
              <RefreshCw className="h-3 w-3" />
              Demo data · Updated {lastUpdated}
            </p>
          </div>
          {/* 간단 통계 */}
          <div className="flex items-center gap-3 text-xs">
            <span className="text-emerald-400 font-medium">▲ {gainers}</span>
            <span className="text-red-400 font-medium">▼ {losers}</span>
          </div>
        </div>

        {/* 주요 지수 스트립 */}
        <MarketSummaryStrip tickers={STRIP_TICKERS} />
      </div>

      {/* ── 탭 바 ── */}
      <div className="flex border-b border-surface-border bg-surface-card overflow-x-auto scrollbar-none">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => { setActiveTab(tab.key); setSearch('') }}
            className={cn(
              'flex-shrink-0 px-5 py-3 text-sm font-medium transition-colors relative',
              activeTab === tab.key
                ? 'text-brand-300'
                : 'text-gray-500 hover:text-gray-300'
            )}
          >
            {tab.label}
            {activeTab === tab.key && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-brand-400 rounded-full" />
            )}
          </button>
        ))}
      </div>

      {/* ── 검색 + 필터 ── */}
      <div className="px-4 pt-3 pb-2 space-y-3 lg:px-6">
        <MarketSearchBar value={search} onChange={setSearch} />

        <div className="flex gap-2">
          {FILTERS.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={cn(
                'rounded-full px-3 py-1 text-xs font-medium transition-colors',
                activeFilter === f.key
                  ? 'bg-brand-500 text-white'
                  : 'bg-surface-muted text-gray-400 hover:text-white'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* ── 티커 리스트 ── */}
      <div className="flex-1 overflow-y-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <p className="text-sm text-gray-500">No results for &quot;{search}&quot;</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-border">
            {filtered.map((ticker) => (
              <MarketTickerRow key={ticker.symbol} ticker={ticker} />
            ))}
          </div>
        )}
      </div>

      {/* ── 하단 면책 고지 ── */}
      <div className="border-t border-surface-border px-4 py-3 text-center">
        <p className="text-xs text-gray-700">
          Demo data only · Not real-time · Not financial advice
        </p>
      </div>
    </div>
  )
}

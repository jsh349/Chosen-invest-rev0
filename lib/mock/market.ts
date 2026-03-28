import type { MarketTicker } from '@/lib/types/market'

export const MOCK_INDICES: MarketTicker[] = [
  { symbol: 'SPX',    name: 'S&P 500',            exchange: 'INDEX',  price: 5218.19, change:  32.14, changePercent:  0.62, volume: '—',     category: 'indices', flag: '🇺🇸' },
  { symbol: 'NDX',    name: 'NASDAQ 100',          exchange: 'INDEX',  price: 18294.52,change:  97.43, changePercent:  0.54, volume: '—',     category: 'indices', flag: '🇺🇸' },
  { symbol: 'DJIA',   name: 'Dow Jones',           exchange: 'INDEX',  price: 38996.39,change: -41.20, changePercent: -0.11, volume: '—',     category: 'indices', flag: '🇺🇸' },
  { symbol: 'RUT',    name: 'Russell 2000',        exchange: 'INDEX',  price: 2054.84, change:  18.76, changePercent:  0.92, volume: '—',     category: 'indices', flag: '🇺🇸' },
  { symbol: 'VIX',    name: 'CBOE Volatility',     exchange: 'INDEX',  price: 14.23,   change:  -0.87, changePercent: -5.76, volume: '—',     category: 'indices', flag: '🇺🇸' },
  { symbol: 'KOSPI',  name: 'KOSPI',               exchange: 'INDEX',  price: 2748.13, change:  21.54, changePercent:  0.79, volume: '—',     category: 'indices', flag: '🇰🇷' },
  { symbol: 'KOSDAQ', name: 'KOSDAQ',              exchange: 'INDEX',  price:  897.45, change:   5.32, changePercent:  0.60, volume: '—',     category: 'indices', flag: '🇰🇷' },
  { symbol: 'NI225',  name: 'Nikkei 225',          exchange: 'INDEX',  price: 40142.77,change: 312.88, changePercent:  0.79, volume: '—',     category: 'indices', flag: '🇯🇵' },
  { symbol: 'FTSE',   name: 'FTSE 100',            exchange: 'INDEX',  price: 8317.59, change: -28.41, changePercent: -0.34, volume: '—',     category: 'indices', flag: '🇬🇧' },
  { symbol: 'DAX',    name: 'DAX',                 exchange: 'INDEX',  price: 18384.35,change: 124.70, changePercent:  0.68, volume: '—',     category: 'indices', flag: '🇩🇪' },
  { symbol: 'HSI',    name: 'Hang Seng',           exchange: 'INDEX',  price: 19624.28,change: -87.34, changePercent: -0.44, volume: '—',     category: 'indices', flag: '🇭🇰' },
  { symbol: 'SSEC',   name: 'Shanghai Composite',  exchange: 'INDEX',  price:  3084.92,change:  14.57, changePercent:  0.47, volume: '—',     category: 'indices', flag: '🇨🇳' },
]

export const MOCK_STOCKS: MarketTicker[] = [
  { symbol: 'AAPL',  name: 'Apple Inc.',           exchange: 'NASDAQ', price:  187.42, change:   3.84, changePercent:  2.09, volume: '62.1M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'MSFT',  name: 'Microsoft',            exchange: 'NASDAQ', price:  415.32, change:   5.17, changePercent:  1.26, volume: '21.4M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'NVDA',  name: 'NVIDIA Corp.',         exchange: 'NASDAQ', price:  878.37, change:  22.54, changePercent:  2.64, volume: '43.8M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'AMZN',  name: 'Amazon.com',           exchange: 'NASDAQ', price:  182.09, change:   1.43, changePercent:  0.79, volume: '38.2M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'GOOGL', name: 'Alphabet Inc.',        exchange: 'NASDAQ', price:  161.84, change:  -0.96, changePercent: -0.59, volume: '24.7M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'META',  name: 'Meta Platforms',       exchange: 'NASDAQ', price:  497.83, change:   8.31, changePercent:  1.70, volume: '18.9M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'TSLA',  name: 'Tesla Inc.',           exchange: 'NASDAQ', price:  174.48, change:  -4.32, changePercent: -2.42, volume: '91.3M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway',  exchange: 'NYSE',   price:  406.20, change:   1.80, changePercent:  0.44, volume:  '4.2M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',       exchange: 'NYSE',   price:  197.54, change:   2.14, changePercent:  1.09, volume: '11.8M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'V',     name: 'Visa Inc.',            exchange: 'NYSE',   price:  276.93, change:   0.87, changePercent:  0.32, volume:  '6.9M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'WMT',   name: 'Walmart Inc.',         exchange: 'NYSE',   price:   65.42, change:   0.54, changePercent:  0.83, volume: '14.2M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'XOM',   name: 'ExxonMobil',           exchange: 'NYSE',   price:  112.87, change:  -1.23, changePercent: -1.08, volume:  '9.7M',  category: 'stocks', flag: '🇺🇸' },
  { symbol: 'TSM',   name: 'TSMC',                 exchange: 'NYSE',   price:  147.63, change:   3.21, changePercent:  2.22, volume:  '8.4M',  category: 'stocks', flag: '🇹🇼' },
  { symbol: '005930',name: 'Samsung Electronics',  exchange: 'KRX',    price:  72400,  change:   800,  changePercent:  1.12, volume: '18.3M',  category: 'stocks', flag: '🇰🇷' },
  { symbol: '000660',name: 'SK Hynix',             exchange: 'KRX',    price: 183500,  change: -1500,  changePercent: -0.81, volume:  '3.2M',  category: 'stocks', flag: '🇰🇷' },
  { symbol: '035420',name: 'NAVER Corp.',          exchange: 'KRX',    price: 178500,  change:  2500,  changePercent:  1.42, volume:  '1.1M',  category: 'stocks', flag: '🇰🇷' },
]

export const MOCK_COMMODITIES: MarketTicker[] = [
  { symbol: 'XAUUSD', name: 'Gold',              exchange: 'COMEX',  price: 2178.40, change:  12.30, changePercent:  0.57, volume: '184K',  category: 'commodities', flag: '🥇' },
  { symbol: 'XAGUSD', name: 'Silver',            exchange: 'COMEX',  price:   24.87, change:   0.32, changePercent:  1.30, volume:  '72K',  category: 'commodities', flag: '🥈' },
  { symbol: 'WTIUSD', name: 'Crude Oil (WTI)',   exchange: 'NYMEX',  price:   81.42, change:  -0.78, changePercent: -0.95, volume: '312K',  category: 'commodities', flag: '🛢️' },
  { symbol: 'BRTUSD', name: 'Brent Crude',       exchange: 'ICE',    price:   85.17, change:  -0.64, changePercent: -0.75, volume: '228K',  category: 'commodities', flag: '🛢️' },
  { symbol: 'NATGAS', name: 'Natural Gas',       exchange: 'NYMEX',  price:    1.74, change:   0.04, changePercent:  2.35, volume:  '89K',  category: 'commodities', flag: '🔥' },
  { symbol: 'XCUUSD', name: 'Copper',            exchange: 'COMEX',  price:    4.07, change:   0.03, changePercent:  0.74, volume:  '54K',  category: 'commodities', flag: '🔶' },
  { symbol: 'WHEAT',  name: 'Wheat',             exchange: 'CBOT',   price:  552.75, change:  -4.50, changePercent: -0.81, volume:  '38K',  category: 'commodities', flag: '🌾' },
  { symbol: 'CORN',   name: 'Corn',              exchange: 'CBOT',   price:  440.25, change:   2.25, changePercent:  0.51, volume:  '44K',  category: 'commodities', flag: '🌽' },
  { symbol: 'SOYBN',  name: 'Soybeans',          exchange: 'CBOT',   price: 1164.50, change:  -8.75, changePercent: -0.75, volume:  '26K',  category: 'commodities', flag: '🫘' },
]

export const MOCK_CRYPTO: MarketTicker[] = [
  { symbol: 'BTC',   name: 'Bitcoin',          exchange: 'CRYPTO', price:  68427.50, change:  1243.20, changePercent:  1.85, volume: '28.4B', category: 'crypto', flag: '₿' },
  { symbol: 'ETH',   name: 'Ethereum',         exchange: 'CRYPTO', price:   3512.80, change:    84.40, changePercent:  2.46, volume: '14.2B', category: 'crypto', flag: '⟠' },
  { symbol: 'BNB',   name: 'BNB',              exchange: 'CRYPTO', price:    587.30, change:    -9.70, changePercent: -1.62, volume:  '1.8B', category: 'crypto', flag: '🔶' },
  { symbol: 'SOL',   name: 'Solana',           exchange: 'CRYPTO', price:    178.42, change:     6.31, changePercent:  3.67, volume:  '4.1B', category: 'crypto', flag: '◎' },
  { symbol: 'XRP',   name: 'XRP',              exchange: 'CRYPTO', price:      0.627,change:     0.014,changePercent:  2.28, volume:  '2.9B', category: 'crypto', flag: '✕' },
  { symbol: 'ADA',   name: 'Cardano',          exchange: 'CRYPTO', price:      0.489,change:    -0.012,changePercent: -2.40, volume:  '0.9B', category: 'crypto', flag: '🔵' },
  { symbol: 'AVAX',  name: 'Avalanche',        exchange: 'CRYPTO', price:     38.74, change:     1.42, changePercent:  3.81, volume:  '0.7B', category: 'crypto', flag: '🔺' },
  { symbol: 'DOGE',  name: 'Dogecoin',         exchange: 'CRYPTO', price:      0.163,change:     0.008,changePercent:  5.17, volume:  '1.4B', category: 'crypto', flag: '🐕' },
  { symbol: 'LINK',  name: 'Chainlink',        exchange: 'CRYPTO', price:     18.42, change:    -0.54, changePercent: -2.85, volume:  '0.5B', category: 'crypto', flag: '🔗' },
  { symbol: 'DOT',   name: 'Polkadot',         exchange: 'CRYPTO', price:      8.97, change:     0.23, changePercent:  2.63, volume:  '0.4B', category: 'crypto', flag: '⬤'  },
]

export const ALL_MARKET_DATA: MarketTicker[] = [
  ...MOCK_INDICES,
  ...MOCK_STOCKS,
  ...MOCK_COMMODITIES,
  ...MOCK_CRYPTO,
]

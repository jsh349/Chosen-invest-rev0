export type MarketCategory = 'indices' | 'stocks' | 'commodities' | 'crypto'

export type MarketFilter = 'most_active' | 'top_gainers' | 'top_losers'

export type MarketTicker = {
  symbol:        string
  name:          string
  exchange:      string
  price:         number
  change:        number
  changePercent: number
  volume?:       string   // e.g. "84.2M"
  category:      MarketCategory
  flag?:         string   // country emoji
}

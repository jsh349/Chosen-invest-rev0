// This file may only be imported from server components, API routes, or server actions.
import 'server-only'
import { serverEnv } from '@/lib/env/server'

const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const API_KEY = serverEnv.FINNHUB_API_KEY

export type Quote = {
  c: number  // current price
  d: number  // change
  dp: number // change %
  h: number  // high
  l: number  // low
  o: number  // open
  pc: number // previous close
}

export async function getQuote(symbol: string): Promise<Quote | null> {
  if (!symbol || typeof symbol !== 'string') {
    throw new Error('[getQuote] symbol is required')
  }
  const res = await fetch(
    `${FINNHUB_BASE}/quote?symbol=${encodeURIComponent(symbol)}&token=${API_KEY}`,
    { next: { revalidate: 60 } } // cache 60s
  )
  if (res.status === 429) {
    console.warn(`[finnhub] getQuote rate limited: symbol=${symbol}`)
    return null
  }
  if (!res.ok) {
    console.error(`[finnhub] getQuote failed: symbol=${symbol} status=${res.status}`)
    return null
  }
  return res.json()
}

export async function searchSymbol(query: string): Promise<{
  result: Array<{ symbol: string; description: string; type: string }>
}> {
  if (!query || typeof query !== 'string') {
    throw new Error('[searchSymbol] query is required')
  }
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`,
    { next: { revalidate: 300 } } // cache 5 min — symbol lists are effectively static
  )
  if (res.status === 429) {
    console.warn(`[finnhub] searchSymbol rate limited: query=${query}`)
    return { result: [] }
  }
  if (!res.ok) {
    console.error(`[finnhub] searchSymbol failed: query=${query} status=${res.status}`)
    return { result: [] }
  }
  return res.json()
}

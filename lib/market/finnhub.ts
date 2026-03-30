// This file may only be imported from server components, API routes, or server actions.
import 'server-only'
import { serverEnv } from '@/lib/env/server'

const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const API_KEY = serverEnv.FINNHUB_API_KEY

export async function getQuote(symbol: string): Promise<{
  c: number  // current price
  d: number  // change
  dp: number // change %
  h: number  // high
  l: number  // low
  o: number  // open
  pc: number // previous close
}> {
  const res = await fetch(
    `${FINNHUB_BASE}/quote?symbol=${symbol}&token=${API_KEY}`,
    { next: { revalidate: 60 } } // cache 60s
  )
  if (!res.ok) throw new Error(`Finnhub quote error: ${res.status}`)
  return res.json()
}

export async function searchSymbol(query: string): Promise<{
  result: Array<{ symbol: string; description: string; type: string }>
}> {
  const res = await fetch(
    `${FINNHUB_BASE}/search?q=${encodeURIComponent(query)}&token=${API_KEY}`
  )
  if (!res.ok) throw new Error(`Finnhub search error: ${res.status}`)
  return res.json()
}

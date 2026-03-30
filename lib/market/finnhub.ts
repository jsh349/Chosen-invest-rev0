// Server-only: FINNHUB_API_KEY must NOT use the NEXT_PUBLIC_ prefix.
// Using NEXT_PUBLIC_ would embed the key into the browser bundle at build time.
// This file may only be imported from server components, API routes, or server actions.
const FINNHUB_BASE = 'https://finnhub.io/api/v1'
const API_KEY = process.env.FINNHUB_API_KEY!

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

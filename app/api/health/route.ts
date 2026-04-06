import { NextResponse } from 'next/server'

// Force fresh evaluation on every request — a cached health response can mask
// real server degradation and make the endpoint misleading.
export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(
    { status: 'ok', timestamp: new Date().toISOString() },
    { headers: { 'Cache-Control': 'no-store' } },
  )
}

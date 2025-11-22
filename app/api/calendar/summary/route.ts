import { NextResponse } from 'next/server'
import { getCalendarSummary } from '@/lib/calendar'

export const dynamic = 'force-dynamic'
export const revalidate = 30

let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 300000 // 5 minutes

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const summary = await getCalendarSummary()

    cache = { data: summary, timestamp: Date.now() }

    return NextResponse.json(summary)
  } catch (error) {
    console.error('Error fetching calendar summary:', error)

    if (cache) {
      return NextResponse.json(cache.data)
    }

    return NextResponse.json(
      { upcomingCount: 0, upcomingEvents: [] },
      { status: 200 }
    )
  }
}

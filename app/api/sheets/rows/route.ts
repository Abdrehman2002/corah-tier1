import { NextRequest, NextResponse } from 'next/server'
import { getSheetRows, createSheetRow } from '@/lib/sheets'

export const dynamic = 'force-dynamic'
export const revalidate = 30

let cache: { data: any; timestamp: number } | null = null
const CACHE_TTL = 10000 // 10 seconds

export async function GET() {
  try {
    if (cache && Date.now() - cache.timestamp < CACHE_TTL) {
      return NextResponse.json(cache.data)
    }

    const rows = await getSheetRows()

    cache = { data: rows, timestamp: Date.now() }

    return NextResponse.json(rows)
  } catch (error) {
    console.error('Error fetching sheet rows:', error)

    if (cache) {
      return NextResponse.json(cache.data)
    }

    return NextResponse.json([], { status: 200 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const payload = await request.json()
    await createSheetRow(payload)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error creating sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to create sheet row' },
      { status: 500 }
    )
  }
}

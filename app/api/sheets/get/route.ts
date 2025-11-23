import { NextResponse } from 'next/server'
import { getSheetsClient } from '@/lib/googleSheetsClient'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const sheets = getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'A:L',
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      return NextResponse.json([])
    }

    const data = rows.slice(1)
      .map((row, index) => ({
        rowIndex: index + 2,
        dateBooked: row[0] || '',
        appointmentDate: row[1] || '',
        appointmentTime: row[2] || '',
        day: row[3] || '',
        callerName: row[4] || '',
        callerEmail: row[5] || '',
        callerPhone: row[6] || '',
        businessName: row[7] || '',
        eventId: row[8] || `ROW-${index + 2}`,
        status: row[9] || '',
        reminderSent: row[10] || '',
        showNoShow: row[11] || '',
      }))
      .filter(row => row.dateBooked || row.appointmentDate || row.callerName)

    return NextResponse.json(data)
  } catch (error) {
    console.error('Error fetching sheet data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch sheet data' },
      { status: 500 }
    )
  }
}

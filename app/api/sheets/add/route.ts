import { NextRequest, NextResponse } from 'next/server'
import { getSheetsClient } from '@/lib/googleSheetsClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      dateBooked,
      appointmentDate,
      appointmentTime,
      day,
      callerName,
      callerEmail,
      callerPhone,
      businessName,
      eventId,
      status,
      reminderSent,
      showNoShow,
    } = body

    const sheets = getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    // Append new row
    const newRow = [
      dateBooked || '',
      appointmentDate || '',
      appointmentTime || '',
      day || '',
      callerName || '',
      callerEmail || '',
      callerPhone || '',
      businessName || '',
      eventId || '',
      status || '',
      reminderSent || '',
      showNoShow || '',
    ]

    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: 'A:L',
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [newRow],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error adding sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to add row' },
      { status: 500 }
    )
  }
}

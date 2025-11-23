import { NextRequest, NextResponse } from 'next/server'
import { getSheetsClient } from '@/lib/googleSheetsClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      eventId,
      rowIndex,
      dateBooked,
      appointmentDate,
      appointmentTime,
      day,
      callerName,
      callerEmail,
      callerPhone,
      businessName,
      status,
      reminderSent,
      showNoShow,
    } = body

    const sheets = getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    let targetRowIndex = -1

    // If rowIndex is provided, use it directly
    if (rowIndex) {
      targetRowIndex = rowIndex
    } else if (eventId && !eventId.startsWith('ROW-')) {
      // If Event ID exists and is not auto-generated, find it
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:L',
      })

      const rows = response.data.values || []

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][8] === eventId) {
          targetRowIndex = i + 1
          break
        }
      }
    } else {
      return NextResponse.json(
        { error: 'Either rowIndex or valid eventId is required' },
        { status: 400 }
      )
    }

    if (targetRowIndex === -1) {
      return NextResponse.json(
        { error: 'Row not found' },
        { status: 404 }
      )
    }

    const updatedRow = [
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

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `A${targetRowIndex}:L${targetRowIndex}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [updatedRow],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to update row' },
      { status: 500 }
    )
  }
}

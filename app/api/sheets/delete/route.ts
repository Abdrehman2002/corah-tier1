import { NextRequest, NextResponse } from 'next/server'
import { getSheetsClient } from '@/lib/googleSheetsClient'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { eventId, rowIndex } = body

    const sheets = getSheetsClient()
    const spreadsheetId = process.env.GOOGLE_SHEETS_SPREADSHEET_ID

    let targetRowIndex = -1

    // If rowIndex is provided, use it directly
    if (rowIndex) {
      targetRowIndex = rowIndex - 1 // Convert to 0-based for deletion API
    } else if (eventId && !eventId.startsWith('ROW-')) {
      // If Event ID exists and is not auto-generated, find it
      const response = await sheets.spreadsheets.values.get({
        spreadsheetId,
        range: 'A:L',
      })

      const rows = response.data.values || []

      for (let i = 1; i < rows.length; i++) {
        if (rows[i][8] === eventId) {
          targetRowIndex = i
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

    const sheetMetadata = await sheets.spreadsheets.get({
      spreadsheetId,
    })

    const sheetId = sheetMetadata.data.sheets?.[0]?.properties?.sheetId || 0

    await sheets.spreadsheets.batchUpdate({
      spreadsheetId,
      requestBody: {
        requests: [
          {
            deleteDimension: {
              range: {
                sheetId: sheetId,
                dimension: 'ROWS',
                startIndex: targetRowIndex,
                endIndex: targetRowIndex + 1,
              },
            },
          },
        ],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to delete row' },
      { status: 500 }
    )
  }
}

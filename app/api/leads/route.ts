import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    )

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1FdnYtrpCMeqGlq89wcw3T9RL5-Tf_69JM6w0ZPCVHPs'

    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: 'Sheet1!A:I',
    })

    const rows = response.data.values || []

    if (rows.length === 0) {
      return NextResponse.json([])
    }

    // Skip header row and map data
    const data = rows.slice(1).map((row, index) => ({
      rowIndex: index + 2, // Account for header row and 0-based indexing
      website: row[0] || '',
      email: row[1] || '',
      phone: row[2] || '',
      keyword: row[3] || '',
      location: row[4] || '',
      message: row[5] || '',
      summary: row[6] || '',
      smsMessage: row[7] || '',
      confirmed: row[8] || '',
    }))

    // Reverse the array so the bottom rows (newest) appear first
    return NextResponse.json(data.reverse())
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json(
      { error: 'Failed to fetch leads' },
      { status: 500 }
    )
  }
}

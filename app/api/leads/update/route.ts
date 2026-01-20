import { NextResponse } from 'next/server'
import { google } from 'googleapis'

export const dynamic = 'force-dynamic'

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { rowIndex, website, email, phone, keyword, location, message, summary, smsMessage, confirmed } = body

    if (!rowIndex) {
      return NextResponse.json(
        { error: 'Row index is required' },
        { status: 400 }
      )
    }

    const auth = new google.auth.JWT(
      process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
      undefined,
      process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
      ['https://www.googleapis.com/auth/spreadsheets']
    )

    const sheets = google.sheets({ version: 'v4', auth })
    const spreadsheetId = '1FdnYtrpCMeqGlq89wcw3T9RL5-Tf_69JM6w0ZPCVHPs'

    // Update the row with all values
    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `Sheet1!A${rowIndex}:I${rowIndex}`,
      valueInputOption: 'RAW',
      requestBody: {
        values: [[website, email, phone, keyword, location, message, summary, smsMessage, confirmed]],
      },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json(
      { error: 'Failed to update lead' },
      { status: 500 }
    )
  }
}

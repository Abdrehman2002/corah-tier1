import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const webhookUrl = 'https://corah.app.n8n.cloud/webhook/send-all-emails'

    console.log('Triggering email webhook:', webhookUrl)

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    console.log('Webhook response status:', response.status)

    // Try to get response text for debugging
    const responseText = await response.text()
    console.log('Webhook response:', responseText)

    if (!response.ok) {
      console.error('Webhook failed with status:', response.status, responseText)
      return NextResponse.json(
        {
          error: 'Failed to trigger email workflow',
          status: response.status,
          details: responseText
        },
        { status: response.status }
      )
    }

    // Try to parse as JSON, fallback to text
    let data
    try {
      data = JSON.parse(responseText)
    } catch {
      data = { message: responseText }
    }

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json(
      {
        error: 'Failed to send emails',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

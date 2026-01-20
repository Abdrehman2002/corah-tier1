import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function POST() {
  try {
    const webhookUrl = 'https://corah.app.n8n.cloud/webhook-test/send-all-emails'

    const response = await fetch(webhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({}),
    })

    if (!response.ok) {
      throw new Error('Failed to trigger email workflow')
    }

    const data = await response.json().catch(() => ({}))

    return NextResponse.json({ success: true, data })
  } catch (error) {
    console.error('Error sending emails:', error)
    return NextResponse.json(
      { error: 'Failed to send emails' },
      { status: 500 }
    )
  }
}

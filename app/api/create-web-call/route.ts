import { NextRequest, NextResponse } from 'next/server'
import Retell from 'retell-sdk'

// IMPORTANT: Initialize Retell SDK with API key from environment variable
// The API key MUST be stored server-side in .env.local as RETELL_API_KEY
// NEVER expose the API key on the frontend
const client = new Retell({
  apiKey: process.env.RETELL_API_KEY!,
})

export async function POST(request: NextRequest) {
  try {
    // STEP 1: Parse the request body to get the selected agent_id
    const body = await request.json()
    const { agent_id } = body

    // STEP 2: Validate that agent_id was provided
    if (!agent_id) {
      return NextResponse.json(
        { error: 'agent_id is required' },
        { status: 400 }
      )
    }

    // STEP 3: Call Retell API to create a web call for the selected agent
    // This returns access_token, call_id, and other call details
    const webCallResponse = await client.call.createWebCall({
      agent_id: agent_id,
    })

    // STEP 4: Return the response to the frontend
    // The frontend will use access_token to load the Retell iframe
    return NextResponse.json({
      access_token: webCallResponse.access_token,
      call_id: webCallResponse.call_id,
      agent_id: webCallResponse.agent_id,
      call_status: webCallResponse.call_status,
    })
  } catch (error) {
    console.error('Error creating web call:', error)

    // Handle Retell API errors gracefully
    return NextResponse.json(
      {
        error: 'Failed to create web call',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

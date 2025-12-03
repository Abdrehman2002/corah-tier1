import { NextRequest, NextResponse } from 'next/server'

// In-memory storage for agent status (can be moved to database/Google Sheets later)
let agentStatus = { active: true }

export async function GET() {
  try {
    return NextResponse.json(agentStatus)
  } catch (error) {
    console.error('Error fetching agent status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agent status' },
      { status: 500 }
    )
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { active } = body

    if (typeof active !== 'boolean') {
      return NextResponse.json(
        { error: 'Invalid active status. Must be a boolean.' },
        { status: 400 }
      )
    }

    agentStatus.active = active

    return NextResponse.json({
      success: true,
      active: agentStatus.active,
    })
  } catch (error) {
    console.error('Error updating agent status:', error)
    return NextResponse.json(
      { error: 'Failed to update agent status' },
      { status: 500 }
    )
  }
}

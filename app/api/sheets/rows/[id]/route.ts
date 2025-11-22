import { NextRequest, NextResponse } from 'next/server'
import { updateSheetRow, deleteSheetRow } from '@/lib/sheets'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const payload = await request.json()
    await updateSheetRow(params.id, payload)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error updating sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to update sheet row' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await deleteSheetRow(params.id)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting sheet row:', error)
    return NextResponse.json(
      { error: 'Failed to delete sheet row' },
      { status: 500 }
    )
  }
}

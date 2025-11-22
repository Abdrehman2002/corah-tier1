import { getSheetsClient } from './googleClient'

const SPREADSHEET_ID = process.env.GOOGLE_SHEETS_SPREADSHEET_ID!

export interface SheetRow {
  id: string
  timestamp?: string
  callType?: string
  duration?: string
  status?: string
  leadName?: string
  leadPhone?: string
  leadEmail?: string
  notes?: string
  [key: string]: any
}

export interface DashboardMetrics {
  totalCalls: number
  totalLeads: number
  answeredCalls: number
  missedCalls: number
  callsPerDay: { date: string; calls: number }[]
  leadsPerDay: { date: string; leads: number }[]
}

export async function getSheetRows(): Promise<SheetRow[]> {
  try {
    const sheets = getSheetsClient()

    // Try multiple common sheet names
    const possibleRanges = ['Sheet1!A:Z', 'A:Z', 'Data!A:Z']
    let response

    for (const range of possibleRanges) {
      try {
        response = await sheets.spreadsheets.values.get({
          spreadsheetId: SPREADSHEET_ID,
          range,
        })
        break
      } catch (err) {
        // Try next range
        continue
      }
    }

    if (!response) {
      console.error('Unable to fetch sheet data with any range')
      return []
    }

    const rows = response.data.values || []

    if (rows.length === 0) return []

    const headers = rows[0]
    const dataRows = rows.slice(1)

    return dataRows.map((row, index) => {
      const obj: SheetRow = { id: (index + 2).toString() }
      headers.forEach((header, i) => {
        obj[header.toLowerCase().replace(/\s+/g, '')] = row[i] || ''
      })
      return obj
    })
  } catch (error) {
    console.error('Error fetching sheet rows:', error)
    return []
  }
}

export async function createSheetRow(payload: Partial<SheetRow>): Promise<void> {
  const sheets = getSheetsClient()

  // Get headers from the first row of the sheet
  const response = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!1:1',
  })

  const headers = response.data.values?.[0] || []

  if (headers.length === 0) {
    throw new Error('No headers found in the sheet')
  }

  // Map payload to header order
  const values = headers.map(header => {
    const key = header.toLowerCase().replace(/\s+/g, '')
    return payload[key] || ''
  })

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: 'Sheet1!A:Z',
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function updateSheetRow(id: string, payload: Partial<SheetRow>): Promise<void> {
  const sheets = getSheetsClient()

  const rows = await getSheetRows()
  const headers = Object.keys(rows[0] || {}).filter(k => k !== 'id')

  const rowIndex = parseInt(id)
  const values = headers.map(h => payload[h] !== undefined ? payload[h] : '')

  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `Sheet1!A${rowIndex}:Z${rowIndex}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [values],
    },
  })
}

export async function deleteSheetRow(id: string): Promise<void> {
  const sheets = getSheetsClient()

  const rowIndex = parseInt(id) - 1

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [
        {
          deleteDimension: {
            range: {
              sheetId: 0,
              dimension: 'ROWS',
              startIndex: rowIndex,
              endIndex: rowIndex + 1,
            },
          },
        },
      ],
    },
  })
}

export async function getDashboardMetrics(): Promise<DashboardMetrics> {
  try {
    const rows = await getSheetRows()

    const now = new Date()
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)

    let totalCalls = 0
    let totalLeads = 0
    let answeredCalls = 0
    let missedCalls = 0

    const callsByDate: Record<string, number> = {}
    const leadsByDate: Record<string, number> = {}

    rows.forEach(row => {
      const timestamp = row.timestamp ? new Date(row.timestamp) : new Date()

      if (timestamp >= thirtyDaysAgo) {
        totalCalls++

        const dateStr = timestamp.toISOString().split('T')[0]
        callsByDate[dateStr] = (callsByDate[dateStr] || 0) + 1

        if (row.status?.toLowerCase() === 'answered') {
          answeredCalls++
        } else if (row.status?.toLowerCase() === 'missed') {
          missedCalls++
        }

        if (row.leadname || row.leadphone) {
          totalLeads++
          leadsByDate[dateStr] = (leadsByDate[dateStr] || 0) + 1
        }
      }
    })

    const callsPerDay = Object.entries(callsByDate)
      .map(([date, calls]) => ({ date, calls }))
      .sort((a, b) => a.date.localeCompare(b.date))

    const leadsPerDay = Object.entries(leadsByDate)
      .map(([date, leads]) => ({ date, leads }))
      .sort((a, b) => a.date.localeCompare(b.date))

    return {
      totalCalls,
      totalLeads,
      answeredCalls,
      missedCalls,
      callsPerDay,
      leadsPerDay,
    }
  } catch (error) {
    console.error('Error getting dashboard metrics:', error)
    return {
      totalCalls: 0,
      totalLeads: 0,
      answeredCalls: 0,
      missedCalls: 0,
      callsPerDay: [],
      leadsPerDay: [],
    }
  }
}

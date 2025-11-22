'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

interface SheetRow {
  id: string
  [key: string]: any
}

export default function UserData() {
  const [rows, setRows] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'normal' | 'sheets'>('normal')

  const fetchRows = async () => {
    setLoading(true)
    try {
      const res = await fetch('/api/sheets/rows', { cache: 'no-store' })
      const data = await res.json()
      setRows(data)
    } catch (error) {
      console.error('Error fetching rows:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRows()
  }, [])

  const headers = rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== 'id') : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Data</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full sm:w-auto">
          <Button
            onClick={fetchRows}
            variant="outline"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          <div className="text-xs sm:text-sm text-[#2A2A2A] opacity-70">
            Mode: User – read-only
          </div>
        </div>
      </div>

      <div className="flex gap-2 border-b border-black/5">
        <Button
          variant={activeTab === 'normal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('normal')}
          className="rounded-b-none"
        >
          Normal View
        </Button>
        <Button
          variant={activeTab === 'sheets' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('sheets')}
          className="rounded-b-none"
        >
          Google Sheets View
        </Button>
      </div>

      {activeTab === 'normal' && (
        <Card className="border-black/10 shadow-sm">
          <CardHeader className="bg-gradient-to-r from-[#F8F6F2] to-white border-b border-black/5">
            <CardTitle className="text-[#000000]">Appointments & Bookings</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto -mx-0">
              <table className="w-full min-w-[640px]">
                <thead>
                  <tr className="border-b-2 border-black/10 bg-[#F8F6F2]">
                    {headers.map((header) => (
                      <th key={header} className="text-left py-4 px-6 font-semibold text-[#000000] text-sm uppercase tracking-wide">
                        {header.charAt(0).toUpperCase() + header.slice(1)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="bg-white">
                  {loading ? (
                    [...Array(3)].map((_, i) => (
                      <tr key={i} className="border-b border-black/5">
                        {[...Array(headers.length || 4)].map((_, j) => (
                          <td key={j} className="py-4 px-6">
                            <div className="h-4 bg-gray-200 rounded animate-pulse" />
                          </td>
                        ))}
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length} className="py-12 text-center text-[#2A2A2A] opacity-70">
                        <div className="flex flex-col items-center gap-2">
                          <svg className="w-12 h-12 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                          </svg>
                          <p className="text-sm font-medium">No appointments yet</p>
                        </div>
                      </td>
                    </tr>
                  ) : (
                    rows.map((row, index) => (
                      <tr key={row.id} className={`border-b border-black/5 hover:bg-[#F8F6F2]/50 transition-colors ${index % 2 === 0 ? 'bg-white' : 'bg-[#F8F6F2]/20'}`}>
                        {headers.map((header) => (
                          <td key={`${row.id}-${header}`} className="py-4 px-6 text-[#000000] text-sm">
                            {row[header] || <span className="text-gray-400">-</span>}
                          </td>
                        ))}
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'sheets' && (
        <Card>
          <CardHeader>
            <CardTitle>Google Sheets View</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://docs.google.com/spreadsheets/d/1Uww2j5jNAZa1IN3o_EX_oLvzrg1idBhfdhSDXUREEbg/preview#gid=0"
              width="100%"
              height="800"
              style={{ border: 'none' }}
            />
          </CardContent>
        </Card>
      )}
    </div>
  )
}

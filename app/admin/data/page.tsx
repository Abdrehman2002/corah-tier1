'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Plus, Pencil, Trash2 } from 'lucide-react'

interface SheetRow {
  id: string
  [key: string]: any
}

export default function AdminData() {
  const [rows, setRows] = useState<SheetRow[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'normal' | 'sheets'>('normal')
  const [showDialog, setShowDialog] = useState(false)
  const [editingRow, setEditingRow] = useState<SheetRow | null>(null)
  const [formData, setFormData] = useState<Partial<SheetRow>>({})

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

  const handleAdd = () => {
    setEditingRow(null)
    setFormData({})
    setShowDialog(true)
  }

  const handleEdit = (row: SheetRow) => {
    setEditingRow(row)
    setFormData(row)
    setShowDialog(true)
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this record?')) return

    try {
      await fetch(`/api/sheets/rows/${id}`, { method: 'DELETE' })
      fetchRows()
    } catch (error) {
      console.error('Error deleting row:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      if (editingRow) {
        await fetch(`/api/sheets/rows/${editingRow.id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      } else {
        await fetch('/api/sheets/rows', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(formData),
        })
      }

      setShowDialog(false)
      fetchRows()
    } catch (error) {
      console.error('Error saving row:', error)
    }
  }

  const headers = rows.length > 0 ? Object.keys(rows[0]).filter(k => k !== 'id') : []

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Data</h1>
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3 w-full sm:w-auto">
          <Button
            onClick={fetchRows}
            variant="outline"
            disabled={loading}
            className="w-full sm:w-auto"
          >
            {loading ? 'Refreshing...' : 'Refresh Data'}
          </Button>
          {activeTab === 'normal' && (
            <Button onClick={handleAdd} className="w-full sm:w-auto">
              <Plus className="h-4 w-4 mr-2" />
              Add Row
            </Button>
          )}
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
                    <th className="text-left py-4 px-6 font-semibold text-[#000000] text-sm uppercase tracking-wide">Actions</th>
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
                        <td className="py-4 px-6">
                          <div className="h-4 w-16 bg-gray-200 rounded animate-pulse" />
                        </td>
                      </tr>
                    ))
                  ) : rows.length === 0 ? (
                    <tr>
                      <td colSpan={headers.length + 1} className="py-12 text-center text-[#2A2A2A] opacity-70">
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
                        <td className="py-4 px-6">
                          <div className="flex gap-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleEdit(row)}
                              className="hover:bg-black/5 hover:text-[#000000]"
                            >
                              <Pencil className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDelete(row.id)}
                              className="hover:bg-red-50 hover:text-red-600"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
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
            <CardTitle>Google Sheets - Edit Directly</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://docs.google.com/spreadsheets/d/1Uww2j5jNAZa1IN3o_EX_oLvzrg1idBhfdhSDXUREEbg/edit#gid=0"
              width="100%"
              height="800"
              style={{ border: 'none' }}
              allow="clipboard-read; clipboard-write"
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{editingRow ? 'Edit Record' : 'Add Record'}</DialogTitle>
          </DialogHeader>

          <form onSubmit={handleSubmit}>
            <div className="grid gap-4 py-4 max-h-[60vh] overflow-y-auto">
              {headers.map((header) => (
                <div key={header} className="space-y-2">
                  <Label htmlFor={header}>
                    {header.charAt(0).toUpperCase() + header.slice(1)}
                  </Label>
                  {header.toLowerCase().includes('notes') || header.toLowerCase().includes('description') ? (
                    <Textarea
                      id={header}
                      value={formData[header] || ''}
                      onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                    />
                  ) : (
                    <Input
                      id={header}
                      value={formData[header] || ''}
                      onChange={(e) => setFormData({ ...formData, [header]: e.target.value })}
                    />
                  )}
                </div>
              ))}
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setShowDialog(false)}>
                Cancel
              </Button>
              <Button type="submit">
                {editingRow ? 'Update' : 'Create'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}

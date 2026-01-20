'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Mail, RefreshCw, Loader2, Edit2, Save, X, PlusCircle, Check } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface Lead {
  website: string
  email: string
  phone: string
  keyword: string
  location: string
  message: string
  summary: string
  smsMessage: string
  confirmed: string
  rowIndex: number
}

type AlertType = 'success' | 'error'

interface Alert {
  type: AlertType
  message: string
  id: number
}

export default function LeadGen() {
  const [leads, setLeads] = useState<Lead[]>([])
  const [loading, setLoading] = useState(true)
  const [editingRowIndex, setEditingRowIndex] = useState<number | null>(null)
  const [editedLead, setEditedLead] = useState<Lead | null>(null)
  const [sending, setSending] = useState(false)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])

  const fetchLeads = async () => {
    try {
      const res = await fetch('/api/leads')
      const data = await res.json()
      setLeads(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching leads:', error)
      showAlert('error', 'Failed to fetch leads')
      setLeads([])
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchLeads()
  }, [])

  const showAlert = (type: AlertType, message: string) => {
    const id = Date.now()
    setAlerts((prev) => [...prev, { type, message, id }])

    if (type === 'success') {
      setTimeout(() => {
        setAlerts((prev) => prev.filter((alert) => alert.id !== id))
      }, 4000)
    }
  }

  const dismissAlert = (id: number) => {
    setAlerts((prev) => prev.filter((alert) => alert.id !== id))
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await fetchLeads()
  }

  const handleSendAllEmails = async () => {
    setSending(true)
    try {
      const res = await fetch('/api/send-all-emails', { method: 'POST' })
      if (res.ok) {
        showAlert('success', 'Emails sent successfully!')
      } else {
        showAlert('error', 'Failed to send emails')
      }
    } catch (error) {
      console.error('Error sending emails:', error)
      showAlert('error', 'Failed to send emails')
    } finally {
      setSending(false)
    }
  }

  const handleScrapeMore = () => {
    window.open('https://corah.app.n8n.cloud/form/f34f6f97-4a18-4d42-ab7b-3e44885b2ec9', '_blank')
  }

  const handleEdit = (lead: Lead) => {
    setEditingRowIndex(lead.rowIndex)
    setEditedLead({ ...lead })
  }

  const handleCancel = () => {
    setEditingRowIndex(null)
    setEditedLead(null)
  }

  const handleSave = async () => {
    if (!editedLead) return

    setSaving(true)
    try {
      const res = await fetch('/api/leads/update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedLead),
      })

      if (res.ok) {
        setLeads((prev) =>
          prev.map((lead) =>
            lead.rowIndex === editedLead.rowIndex ? editedLead : lead
          )
        )
        setEditingRowIndex(null)
        setEditedLead(null)
        showAlert('success', 'Lead updated successfully!')
      } else {
        showAlert('error', 'Failed to update lead')
      }
    } catch (error) {
      console.error('Error updating lead:', error)
      showAlert('error', 'Failed to update lead')
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof Lead, value: string) => {
    if (editedLead) {
      setEditedLead({ ...editedLead, [field]: value })
    }
  }

  return (
    <div className="space-y-6">
      {/* Alerts */}
      <AnimatePresence>
        {alerts.map((alert) => (
          <motion.div
            key={alert.id}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg ${
              alert.type === 'success'
                ? 'bg-green-500 text-white'
                : 'bg-red-500 text-white'
            }`}
          >
            {alert.type === 'success' && <Check className="h-5 w-5" />}
            <span>{alert.message}</span>
            <button
              onClick={() => dismissAlert(alert.id)}
              className="ml-2 hover:opacity-80"
            >
              <X className="h-4 w-4" />
            </button>
          </motion.div>
        ))}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Lead Generation</h1>
        <div className="flex flex-wrap gap-2">
          <Button
            onClick={handleSendAllEmails}
            disabled={sending || leads.length === 0}
            className="w-full sm:w-auto"
          >
            {sending ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Mail className="h-4 w-4 mr-2" />
                Send All Emails
              </>
            )}
          </Button>
          <Button
            onClick={handleRefresh}
            disabled={refreshing}
            variant="outline"
            className="w-full sm:w-auto"
          >
            {refreshing ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Refreshing...
              </>
            ) : (
              <>
                <RefreshCw className="h-4 w-4 mr-2" />
                Refresh
              </>
            )}
          </Button>
          <Button
            onClick={handleScrapeMore}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Scrape More Data
          </Button>
        </div>
      </div>

      {/* Leads Table */}
      <Card>
        <CardHeader>
          <CardTitle>Leads ({leads.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-[#000000]" />
            </div>
          ) : leads.length === 0 ? (
            <div className="text-center py-12 text-[#2A2A2A] opacity-70">
              No leads found. Click "Scrape More Data" to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-black/5">
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Website</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Email</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Phone</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Keyword</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Location</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Message</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Summary</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">SMS Message</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Confirmed</th>
                    <th className="text-left p-3 text-sm font-medium text-[#2A2A2A]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {leads.map((lead) => {
                    const isEditing = editingRowIndex === lead.rowIndex
                    const displayLead = isEditing && editedLead ? editedLead : lead

                    return (
                      <tr key={lead.rowIndex} className="border-b border-black/5 hover:bg-black/5">
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.website}
                              onChange={(e) => handleInputChange('website', e.target.value)}
                              className="min-w-[150px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.website}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="min-w-[150px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.email}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="min-w-[120px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.phone}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.keyword}
                              onChange={(e) => handleInputChange('keyword', e.target.value)}
                              className="min-w-[120px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.keyword}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.location}
                              onChange={(e) => handleInputChange('location', e.target.value)}
                              className="min-w-[120px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.location}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.message}
                              onChange={(e) => handleInputChange('message', e.target.value)}
                              className="min-w-[200px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.message}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.summary}
                              onChange={(e) => handleInputChange('summary', e.target.value)}
                              className="min-w-[200px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.summary}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.smsMessage}
                              onChange={(e) => handleInputChange('smsMessage', e.target.value)}
                              className="min-w-[200px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.smsMessage}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <Input
                              value={displayLead.confirmed}
                              onChange={(e) => handleInputChange('confirmed', e.target.value)}
                              className="min-w-[100px]"
                            />
                          ) : (
                            <span className="text-sm">{displayLead.confirmed}</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <div className="flex gap-2">
                              <Button
                                size="sm"
                                onClick={handleSave}
                                disabled={saving}
                              >
                                {saving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <Save className="h-4 w-4" />
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={handleCancel}
                                disabled={saving}
                              >
                                <X className="h-4 w-4" />
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => handleEdit(lead)}
                            >
                              <Edit2 className="h-4 w-4" />
                            </Button>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

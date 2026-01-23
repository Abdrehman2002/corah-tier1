'use client'

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Mail, Loader2, PlusCircle, Check, X } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

type AlertType = 'success' | 'error'

interface Alert {
  type: AlertType
  message: string
  id: number
}

export default function LeadGen() {
  const [sending, setSending] = useState(false)
  const [alerts, setAlerts] = useState<Alert[]>([])

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
            disabled={sending}
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
            onClick={handleScrapeMore}
            variant="outline"
            className="w-full sm:w-auto"
          >
            <PlusCircle className="h-4 w-4 mr-2" />
            Scrape More Data
          </Button>
        </div>
      </div>

      {/* Google Sheets Embed */}
      <Card>
        <CardHeader>
          <CardTitle>Google Sheets - Edit Directly</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <iframe
            src="https://docs.google.com/spreadsheets/d/1FdnYtrpCMeqGlq89wcw3T9RL5-Tf_69JM6w0ZPCVHPs/edit#gid=0"
            width="100%"
            height="800"
            style={{ border: 'none' }}
            allow="clipboard-read; clipboard-write"
          />
        </CardContent>
      </Card>
    </div>
  )
}

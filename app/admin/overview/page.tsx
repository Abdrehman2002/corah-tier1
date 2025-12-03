'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Switch } from '@/components/ui/switch'
import { Phone, CheckCircle, DollarSign, Power, Calendar } from 'lucide-react'
import { LineChart, Line, BarChart, Bar, PieChart, Pie, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface Metrics {
  totalCalls: number
  answeredCalls: number
  missedRevenueSaved: number
  totalRevenueSaved: number
  upcomingAppointments: number
  callsPerDay: { date: string; calls: number }[]
  revenuePerDay: { date: string; revenue: number }[]
}

interface CalendarSummary {
  upcomingCount: number
  upcomingEvents: Array<{ title: string; start: string }>
}

export default function AdminOverview() {
  const [metrics, setMetrics] = useState<Metrics | null>(null)
  const [calendarSummary, setCalendarSummary] = useState<CalendarSummary | null>(null)
  const [loading, setLoading] = useState(true)
  const [agentOn, setAgentOn] = useState<boolean>(true)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [metricsRes, calendarRes, agentStatusRes] = await Promise.all([
          fetch('/api/overview'),
          fetch('/api/calendar/summary'),
          fetch('/api/agent-status'),
        ])

        const metricsData = await metricsRes.json()
        const calendarData = await calendarRes.json()
        const agentStatusData = await agentStatusRes.json()

        setMetrics(metricsData)
        setCalendarSummary(calendarData)
        setAgentOn(agentStatusData.active ?? true)
      } catch (error) {
        console.error('Error fetching overview data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  const handleAgentToggle = async (value: boolean) => {
    setAgentOn(value)
    try {
      await fetch('/api/agent-status', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ active: value }),
      })
    } catch (error) {
      console.error('Error updating agent status:', error)
      // Revert on error
      setAgentOn(!value)
    }
  }

  const currencyFormatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  })

  const renderSkeleton = () => (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="h-9 w-40 bg-gray-200 rounded animate-pulse" />
        <div className="h-5 w-48 bg-gray-200 rounded animate-pulse" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="space-y-0 pb-2">
              <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-8 w-16 bg-gray-200 rounded animate-pulse mb-2" />
              <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(3)].map((_, i) => (
          <Card key={i}>
            <CardHeader>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse" />
            </CardHeader>
            <CardContent>
              <div className="h-[300px] bg-gray-100 rounded animate-pulse" />
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )

  if (loading) {
    return renderSkeleton()
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Overview</h1>
        <div className="text-xs sm:text-sm text-[#2A2A2A] opacity-70">
          Mode: Admin – full access
        </div>
      </div>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 sm:gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Calls</CardTitle>
            <Phone className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.totalCalls || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Answered Calls</CardTitle>
            <CheckCircle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics?.answeredCalls || 0}</div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Possible Revenue Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter.format(metrics?.missedRevenueSaved || 0)}
            </div>
            <p className="text-xs text-muted-foreground">Last 30 days</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue Saved</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {currencyFormatter.format(metrics?.totalRevenueSaved || 0)}
            </div>
            <p className="text-xs text-muted-foreground">{metrics?.upcomingAppointments || 0} appointments</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Agent Status</CardTitle>
            <Power className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <span className={`text-sm font-medium ${agentOn ? 'text-green-600' : 'text-gray-500'}`}>
                {agentOn ? 'Agent is ON' : 'Agent is OFF'}
              </span>
              <Switch
                checked={agentOn}
                onCheckedChange={handleAgentToggle}
              />
            </div>
            <p className="text-xs text-muted-foreground mt-2">AI Receptionist</p>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Calls Per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics?.callsPerDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#2A2A2A" />
                <YAxis stroke="#2A2A2A" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="calls" stroke="#000000" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Revenue Generated Per Day</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={metrics?.revenuePerDay || []}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,0.05)" />
                <XAxis dataKey="date" stroke="#2A2A2A" />
                <YAxis stroke="#2A2A2A" />
                <Tooltip
                  formatter={(value: number) => `$${value.toLocaleString()}`}
                />
                <Legend />
                <Bar dataKey="revenue" fill="#000000" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Appointment Status</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={[
                    { name: 'Booked', value: metrics?.upcomingAppointments || 0 },
                    { name: 'Called', value: Math.max(0, (metrics?.answeredCalls || 0) - (metrics?.upcomingAppointments || 0)) },
                  ]}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  <Cell fill="#000000" />
                  <Cell fill="#999999" />
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Upcoming Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {calendarSummary?.upcomingEvents && calendarSummary.upcomingEvents.length > 0 ? (
                calendarSummary.upcomingEvents.map((event) => (
                  <div key={event.title + event.start} className="flex items-start gap-3 p-3 bg-[#F8F6F2] rounded-md">
                    <Calendar className="h-5 w-5 text-[#2A2A2A] mt-0.5" />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-[#000000] truncate">{event.title}</p>
                      <p className="text-xs text-[#2A2A2A] opacity-70">
                        {new Date(event.start).toLocaleString()}
                      </p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-muted-foreground">No upcoming events</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

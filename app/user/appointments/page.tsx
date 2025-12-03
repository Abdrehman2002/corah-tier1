'use client'

import { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
}

interface SheetAppointment {
  rowIndex: number
  dateBooked: string
  appointmentDate: string
  appointmentTime: string
  day: string
  callerName: string
  callerEmail: string
  callerPhone: string
  businessName: string
  eventId: string
  status: string
  reminderSent: string
  showNoShow: string
  summary: string
}

export default function UserAppointments() {
  const [events, setEvents] = useState<CalendarEvent[]>([])
  const [sheetAppointments, setSheetAppointments] = useState<SheetAppointment[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDate, setCurrentDate] = useState(new Date())
  const [activeTab, setActiveTab] = useState<'normal' | 'google' | 'table'>('table')
  const [showDialog, setShowDialog] = useState(false)
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null)

  const fetchEvents = async () => {
    try {
      const firstDay = new Date(currentDate.getFullYear(), currentDate.getMonth(), 1)
      const lastDay = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0)

      const res = await fetch(
        `/api/calendar/events?from=${firstDay.toISOString()}&to=${lastDay.toISOString()}`
      )
      const data = await res.json()
      setEvents(data)
    } catch (error) {
      console.error('Error fetching events:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchSheetAppointments = async () => {
    try {
      const res = await fetch('/api/sheets/get')
      const data = await res.json()
      setSheetAppointments(Array.isArray(data) ? data : [])
    } catch (error) {
      console.error('Error fetching sheet appointments:', error)
      setSheetAppointments([])
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchEvents()
    fetchSheetAppointments()
  }, [currentDate])

  const handleViewEvent = (event: CalendarEvent) => {
    setSelectedEvent(event)
    setShowDialog(true)
  }

  const getDaysInMonth = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const daysInMonth = lastDay.getDate()
    const startingDayOfWeek = firstDay.getDay()

    const days = []
    for (let i = 0; i < startingDayOfWeek; i++) {
      days.push(null)
    }
    for (let i = 1; i <= daysInMonth; i++) {
      days.push(i)
    }
    return days
  }

  const getEventsForDay = (day: number) => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const dayDate = new Date(year, month, day)

    return events.filter((event) => {
      const eventDate = new Date(event.start)
      return (
        eventDate.getDate() === day &&
        eventDate.getMonth() === month &&
        eventDate.getFullYear() === year
      )
    })
  }

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ]

  const previousMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const days = getDaysInMonth()

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <h1 className="text-2xl sm:text-3xl font-bold text-[#000000]">Appointments</h1>
        <div className="text-xs sm:text-sm text-[#2A2A2A] opacity-70">
          Mode: User – read-only
        </div>
      </div>

      <div className="flex gap-2 border-b border-black/5">
        <Button
          variant={activeTab === 'table' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('table')}
          className="rounded-b-none"
        >
          Appointments Table
        </Button>
        <Button
          variant={activeTab === 'normal' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('normal')}
          className="rounded-b-none"
        >
          Calendar View
        </Button>
        <Button
          variant={activeTab === 'google' ? 'default' : 'ghost'}
          onClick={() => setActiveTab('google')}
          className="rounded-b-none"
        >
          Google Calendar
        </Button>
      </div>

      {activeTab === 'table' && (
        <Card>
          <CardHeader>
            <CardTitle>All Appointments</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-[#F8F6F2] border-b border-black/5">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Date Booked</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Appointment Date</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Appointment Time</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Day</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Caller Name</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Caller Email</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Caller Phone</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-[#2A2A2A] uppercase tracking-wider">Business Name</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-black/5">
                  {loading ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#2A2A2A]">
                        Loading appointments...
                      </td>
                    </tr>
                  ) : sheetAppointments.length === 0 ? (
                    <tr>
                      <td colSpan={8} className="px-4 py-8 text-center text-sm text-[#2A2A2A]">
                        No appointments found
                      </td>
                    </tr>
                  ) : (
                    sheetAppointments.map((appointment) => (
                      <tr key={appointment.rowIndex} className="hover:bg-[#F8F6F2]/50 transition-colors">
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.dateBooked}</td>
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.appointmentDate}</td>
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.appointmentTime}</td>
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.day}</td>
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.callerName}</td>
                        <td className="px-4 py-3 text-sm text-[#000000]">
                          {appointment.callerEmail && (
                            <a href={`mailto:${appointment.callerEmail}`} className="hover:underline">
                              {appointment.callerEmail}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#000000]">
                          {appointment.callerPhone && (
                            <a href={`tel:${appointment.callerPhone}`} className="hover:underline">
                              {appointment.callerPhone}
                            </a>
                          )}
                        </td>
                        <td className="px-4 py-3 text-sm text-[#000000]">{appointment.businessName}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {activeTab === 'normal' && (
        <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              {monthNames[currentDate.getMonth()]} {currentDate.getFullYear()}
            </CardTitle>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={previousMonth}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={nextMonth}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-2">
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <div key={day} className="text-center font-medium text-sm text-[#2A2A2A] py-2">
                {day}
              </div>
            ))}
            {days.map((day, index) => (
              <div
                key={index}
                className={`min-h-[100px] border border-black/5 rounded-md p-2 ${
                  day ? 'bg-white' : 'bg-[#F8F6F2]'
                }`}
              >
                {day && (
                  <>
                    <div className="text-sm font-medium text-[#000000] mb-1">{day}</div>
                    <div className="space-y-1">
                      {loading ? (
                        <div className="h-6 bg-gray-200 rounded animate-pulse" />
                      ) : (
                        getEventsForDay(day).map((event) => (
                          <div
                            key={event.id}
                            onClick={() => handleViewEvent(event)}
                            className="text-xs bg-[#000000] text-white px-2 py-1 rounded cursor-pointer hover:bg-[#111111]"
                          >
                            {event.title}
                          </div>
                        ))
                      )}
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
      )}

      {activeTab === 'google' && (
        <Card>
          <CardHeader>
            <CardTitle>Google Calendar View</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <iframe
              src="https://calendar.google.com/calendar/embed?src=1c82143bf911816e35b0a7ddfb78e629c24fdaa19ed90f38210e336c549129be%40group.calendar.google.com&ctz=America%2FChicago"
              style={{ border: 0 }}
              width="100%"
              height="800"
              frameBorder={0}
              scrolling="no"
            />
          </CardContent>
        </Card>
      )}

      <Dialog open={showDialog} onOpenChange={setShowDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Appointment Details</DialogTitle>
          </DialogHeader>

          {selectedEvent && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-medium text-[#2A2A2A]">Title</p>
                <p className="text-base text-[#000000]">{selectedEvent.title}</p>
              </div>

              <div>
                <p className="text-sm font-medium text-[#2A2A2A]">Date & Time</p>
                <p className="text-base text-[#000000]">
                  {new Date(selectedEvent.start).toLocaleString()} -{' '}
                  {new Date(selectedEvent.end).toLocaleTimeString()}
                </p>
              </div>

              {selectedEvent.location && (
                <div>
                  <p className="text-sm font-medium text-[#2A2A2A]">Location</p>
                  <p className="text-base text-[#000000]">{selectedEvent.location}</p>
                </div>
              )}

              {selectedEvent.description && (
                <div>
                  <p className="text-sm font-medium text-[#2A2A2A]">Description</p>
                  <p className="text-base text-[#000000]">{selectedEvent.description}</p>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}

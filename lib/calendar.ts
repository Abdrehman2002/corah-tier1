import { getCalendarClient } from './googleClient'
import { calendar_v3 } from 'googleapis'

const CALENDAR_ID = process.env.GOOGLE_CALENDAR_ID!

export interface CalendarEvent {
  id: string
  title: string
  description?: string
  start: string
  end: string
  location?: string
}

export interface CalendarSummary {
  upcomingCount: number
  upcomingEvents: CalendarEvent[]
}

export async function getEvents(params?: {
  from?: Date
  to?: Date
}): Promise<CalendarEvent[]> {
  try {
    const calendar = getCalendarClient()

    const timeMin = params?.from || new Date()
    const timeMax = params?.to || new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)

    const response = await calendar.events.list({
      calendarId: CALENDAR_ID,
      timeMin: timeMin.toISOString(),
      timeMax: timeMax.toISOString(),
      singleEvents: true,
      orderBy: 'startTime',
    })

    const events = response.data.items || []

    return events.map(event => ({
      id: event.id!,
      title: event.summary || 'Untitled Event',
      description: event.description || '',
      start: event.start?.dateTime || event.start?.date || '',
      end: event.end?.dateTime || event.end?.date || '',
      location: event.location || '',
    }))
  } catch (error) {
    console.error('Error fetching calendar events:', error)
    return []
  }
}

export async function createEvent(payload: {
  title: string
  description?: string
  start: string
  end: string
  location?: string
}): Promise<CalendarEvent> {
  const calendar = getCalendarClient()

  const event: calendar_v3.Schema$Event = {
    summary: payload.title,
    description: payload.description,
    location: payload.location,
    start: {
      dateTime: payload.start,
      timeZone: 'America/Chicago',
    },
    end: {
      dateTime: payload.end,
      timeZone: 'America/Chicago',
    },
  }

  const response = await calendar.events.insert({
    calendarId: CALENDAR_ID,
    requestBody: event,
  })

  return {
    id: response.data.id!,
    title: response.data.summary!,
    description: response.data.description || '',
    start: response.data.start?.dateTime || '',
    end: response.data.end?.dateTime || '',
    location: response.data.location || '',
  }
}

export async function updateEvent(
  id: string,
  payload: Partial<{
    title: string
    description: string
    start: string
    end: string
    location: string
  }>
): Promise<void> {
  const calendar = getCalendarClient()

  const event: calendar_v3.Schema$Event = {}

  if (payload.title) event.summary = payload.title
  if (payload.description !== undefined) event.description = payload.description
  if (payload.location !== undefined) event.location = payload.location
  if (payload.start) {
    event.start = {
      dateTime: payload.start,
      timeZone: 'America/Chicago',
    }
  }
  if (payload.end) {
    event.end = {
      dateTime: payload.end,
      timeZone: 'America/Chicago',
    }
  }

  await calendar.events.patch({
    calendarId: CALENDAR_ID,
    eventId: id,
    requestBody: event,
  })
}

export async function deleteEvent(id: string): Promise<void> {
  const calendar = getCalendarClient()

  await calendar.events.delete({
    calendarId: CALENDAR_ID,
    eventId: id,
  })
}

export async function getCalendarSummary(): Promise<CalendarSummary> {
  try {
    const now = new Date()
    const futureDate = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000)

    const events = await getEvents({ from: now, to: futureDate })

    return {
      upcomingCount: events.length,
      upcomingEvents: events.slice(0, 5),
    }
  } catch (error) {
    console.error('Error fetching calendar summary:', error)
    return {
      upcomingCount: 0,
      upcomingEvents: [],
    }
  }
}

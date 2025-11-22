import { google } from 'googleapis'

const oauth2Client = new google.auth.OAuth2(
  process.env.GOOGLE_CLIENT_ID,
  process.env.GOOGLE_CLIENT_SECRET
)

oauth2Client.setCredentials({
  refresh_token: process.env.GOOGLE_REFRESH_TOKEN,
})

// Reduce retry attempts for faster failure
const retryConfig = {
  retry: 0, // No retries for faster response
  timeout: 3000, // 3 second timeout
}

export function getSheetsClient() {
  return google.sheets({
    version: 'v4',
    auth: oauth2Client,
    retryConfig,
  })
}

export function getCalendarClient() {
  return google.calendar({
    version: 'v3',
    auth: oauth2Client,
    retryConfig,
  })
}

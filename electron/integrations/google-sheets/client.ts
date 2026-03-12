import { google, type sheets_v4 } from 'googleapis'
import { logger } from '../../utils/logger'

let cachedClient: sheets_v4.Sheets | null = null
let cachedKeyHash: string | null = null

/**
 * Create an authenticated Google Sheets API v4 client
 * using a service account JSON key string.
 */
export function createSheetsClient(serviceAccountKeyJson: string): sheets_v4.Sheets {
  // Cache by key content to avoid re-authenticating needlessly
  const keyHash = serviceAccountKeyJson.substring(0, 64)
  if (cachedClient && cachedKeyHash === keyHash) {
    return cachedClient
  }

  let keyObj: Record<string, string>
  try {
    keyObj = JSON.parse(serviceAccountKeyJson)
  } catch {
    throw new Error('Invalid service account key. Please paste a valid JSON key.')
  }

  if (!keyObj.client_email || !keyObj.private_key) {
    throw new Error('Service account key must contain client_email and private_key fields.')
  }

  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: keyObj.client_email,
      private_key: keyObj.private_key
    },
    scopes: ['https://www.googleapis.com/auth/spreadsheets']
  })

  cachedClient = google.sheets({ version: 'v4', auth })
  cachedKeyHash = keyHash
  logger.info('sheets-client', 'Google Sheets client created')

  return cachedClient
}

/** Clear cached client (for when settings change) */
export function clearSheetsClient(): void {
  cachedClient = null
  cachedKeyHash = null
}

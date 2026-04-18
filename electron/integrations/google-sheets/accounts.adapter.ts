import { createSheetsClient } from './client'
import { ACCOUNTS_TAB_NAME } from '../../config/constants'
import { logger } from '../../utils/logger'
import { settingsService } from '../../services/settings.service'
import type { CachedAccount } from '../../../shared/types/auth.types'

function getConfig() {
  // Use dynamic import-like pattern but lazily access the already-loaded module
  // settingsService is imported statically at module level
  const config = settingsService.getSheetsConfig()
  if (!config.spreadsheetId || !config.serviceAccountKey) {
    throw new Error('Google Sheets is not configured.')
  }
  return {
    sheets: createSheetsClient(config.serviceAccountKey),
    spreadsheetId: config.spreadsheetId
  }
}

/**
 * Expected Accounts tab columns:
 * username | password_hash | role | full_name | is_active | created_at | last_login
 */
export const accountsAdapter = {
  async fetchAccounts(): Promise<CachedAccount[]> {
    const { sheets, spreadsheetId } = getConfig()
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ACCOUNTS_TAB_NAME}!A:G`
    })

    const rows = response.data.values ?? []
    if (rows.length <= 1) return [] // Only header or empty

    return rows.slice(1).map((row) => ({
      username: row[0] ?? '',
      password_hash: row[1] ?? '',
      role: row[2] ?? '',
      full_name: row[3] ?? '',
      is_active: row[4]?.toLowerCase() !== 'false',
      created_at: row[5] ?? '',
      last_login: row[6] ?? ''
    }))
  },

  async createAccount(account: CachedAccount): Promise<void> {
    const { sheets, spreadsheetId } = getConfig()
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `${ACCOUNTS_TAB_NAME}!A:A`,
      valueInputOption: 'USER_ENTERED',
      requestBody: {
        values: [[
          account.username,
          account.password_hash,
          account.role,
          account.full_name,
          String(account.is_active),
          account.created_at,
          account.last_login
        ]]
      }
    })
    logger.info('accounts', `Account created in Sheets: ${account.username}`)
  },

  async updateAccount(username: string, updates: Record<string, string>): Promise<void> {
    const { sheets, spreadsheetId } = getConfig()

    // Find the row for this username
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: `${ACCOUNTS_TAB_NAME}!A:G`
    })

    const rows = response.data.values ?? []
    let targetRow = -1
    for (let i = 1; i < rows.length; i++) {
      if (rows[i][0]?.toLowerCase() === username.toLowerCase()) {
        targetRow = i + 1 // 1-based for Sheets API
        break
      }
    }

    if (targetRow === -1) throw new Error(`Account not found: ${username}`)

    // Get current row data
    const currentRow = rows[targetRow - 1]
    const fields = ['username', 'password_hash', 'role', 'full_name', 'is_active', 'created_at', 'last_login']
    const updatedRow = fields.map((f, idx) => updates[f] ?? currentRow[idx] ?? '')

    await sheets.spreadsheets.values.update({
      spreadsheetId,
      range: `${ACCOUNTS_TAB_NAME}!A${targetRow}:G${targetRow}`,
      valueInputOption: 'USER_ENTERED',
      requestBody: { values: [updatedRow] }
    })
    logger.info('accounts', `Account updated in Sheets: ${username}`)
  },

  async updateLastLogin(username: string, timestamp: string): Promise<void> {
    await this.updateAccount(username, { last_login: timestamp })
  }
}

import { settingsRepository } from '../database/settings.repository'
import { SETTINGS_KEYS, DEFAULT_SHEETS_ID } from '../config/constants'
import { encryptValue, decryptValue } from '../utils/crypto'
import { safeSave } from '../database/db-manager'
import { logger } from '../utils/logger'

export const settingsService = {
  get(key: string): string | null {
    return settingsRepository.get(key)
  },

  set(key: string, value: string | null): void {
    settingsRepository.set(key, value)
    safeSave()
  },

  getAll(): Record<string, string | null> {
    const all = settingsRepository.getAll()
    // Never return encrypted SMTP password to renderer — mask it
    if (all[SETTINGS_KEYS.SMTP_PASS]) {
      all[SETTINGS_KEYS.SMTP_PASS] = '••••••••'
    }
    return all
  },

  getMultiple(keys: string[]): Record<string, string | null> {
    return settingsRepository.getMultiple(keys)
  },

  saveMultiple(settings: Record<string, string | null>): void {
    const sheetsKeys = new Set([
      SETTINGS_KEYS.SHEETS_ID, SETTINGS_KEYS.SHEETS_KEY,
      SETTINGS_KEYS.SHEETS_TAB_CE, SETTINGS_KEYS.SHEETS_TAB_CPE, SETTINGS_KEYS.SHEETS_TAB_EE
    ])
    let sheetsChanged = false

    for (const [key, value] of Object.entries(settings)) {
      // Encrypt SMTP password before storing
      if (key === SETTINGS_KEYS.SMTP_PASS && value) {
        // Skip masked placeholder — don't overwrite real password
        if (value === '••••••••') continue
        settingsRepository.set(key, encryptValue(value))
      } else {
        settingsRepository.set(key, value)
      }
      if (sheetsKeys.has(key)) sheetsChanged = true
    }

    // Clear cached Sheets client if any Sheets settings changed
    if (sheetsChanged) {
      import('../integrations/google-sheets/client').then(({ clearSheetsClient }) => {
        clearSheetsClient()
      }).catch(() => {})
    }

    safeSave()
    logger.info('settings', 'Settings saved', { keys: Object.keys(settings) })
  },

  /** Get decrypted SMTP password */
  getSmtpPassword(): string | null {
    const encrypted = settingsRepository.get(SETTINGS_KEYS.SMTP_PASS)
    if (!encrypted) return null
    try {
      return decryptValue(encrypted)
    } catch {
      logger.warn('settings', 'Failed to decrypt SMTP password')
      return null
    }
  },

  /** Get complete SMTP config */
  getSmtpConfig(): {
    host: string | null
    port: number | null
    user: string | null
    pass: string | null
    from: string | null
  } {
    const settings = settingsRepository.getMultiple([
      SETTINGS_KEYS.SMTP_HOST,
      SETTINGS_KEYS.SMTP_PORT,
      SETTINGS_KEYS.SMTP_USER,
      SETTINGS_KEYS.SMTP_FROM
    ])
    return {
      host: settings[SETTINGS_KEYS.SMTP_HOST],
      port: settings[SETTINGS_KEYS.SMTP_PORT]
        ? parseInt(settings[SETTINGS_KEYS.SMTP_PORT]!, 10)
        : null,
      user: settings[SETTINGS_KEYS.SMTP_USER],
      pass: this.getSmtpPassword(),
      from: settings[SETTINGS_KEYS.SMTP_FROM]
    }
  },

  /** Get Sheets config */
  getSheetsConfig(): {
    spreadsheetId: string | null
    serviceAccountKey: string | null
    sheetTabs: { ce: string; cpe: string; ee: string }
  } {
    const settings = settingsRepository.getMultiple([
      SETTINGS_KEYS.SHEETS_ID,
      SETTINGS_KEYS.SHEETS_KEY,
      SETTINGS_KEYS.SHEETS_TAB_CE,
      SETTINGS_KEYS.SHEETS_TAB_CPE,
      SETTINGS_KEYS.SHEETS_TAB_EE
    ])
    return {
      spreadsheetId: settings[SETTINGS_KEYS.SHEETS_ID] || DEFAULT_SHEETS_ID,
      serviceAccountKey: settings[SETTINGS_KEYS.SHEETS_KEY],
      sheetTabs: {
        ce: settings[SETTINGS_KEYS.SHEETS_TAB_CE] || 'CE',
        cpe: settings[SETTINGS_KEYS.SHEETS_TAB_CPE] || 'CPE',
        ee: settings[SETTINGS_KEYS.SHEETS_TAB_EE] || 'EE'
      }
    }
  },

  /** Check if Sheets is configured (core requirement for sync/accounts) */
  isConfigured(): boolean {
    const sheets = this.getSheetsConfig()
    return !!(sheets.spreadsheetId && sheets.serviceAccountKey)
  },

  /** Test SMTP connection */
  async testSmtp(): Promise<void> {
    const { createTransport } = await import('../integrations/smtp/transport')
    const config = this.getSmtpConfig()
    if (!config.host || !config.port || !config.user || !config.pass) {
      throw new Error('SMTP settings are incomplete. Please fill in all required fields.')
    }
    const transport = createTransport(config as { host: string; port: number; user: string; pass: string })
    await transport.verify()
    logger.info('settings', 'SMTP connection test successful')
  },

  /** Test Sheets connection */
  async testSheets(): Promise<void> {
    const { createSheetsClient } = await import('../integrations/google-sheets/client')
    const config = this.getSheetsConfig()
    if (!config.spreadsheetId || !config.serviceAccountKey) {
      throw new Error('Google Sheets settings are incomplete. Please fill in all required fields.')
    }
    const sheets = createSheetsClient(config.serviceAccountKey)
    // Try to read the spreadsheet title to verify connection
    try {
      await sheets.spreadsheets.get({ spreadsheetId: config.spreadsheetId })
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('not found') || msg.includes('404')) {
        // Parse the service account email from the key JSON for a helpful message
        let email = 'your service account'
        try {
          const parsed = JSON.parse(config.serviceAccountKey!)
          if (parsed.client_email) email = parsed.client_email
        } catch { /* ignore parse error */ }
        throw new Error(
          `Spreadsheet not found. Please share the Google Sheet with ${email} as an Editor.`
        )
      }
      throw err
    }
    logger.info('settings', 'Google Sheets connection test successful')
  }
}

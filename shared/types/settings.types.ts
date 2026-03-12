export interface SmtpConfig {
  host: string
  port: number
  user: string
  pass: string
  from: string
}

export interface SheetsConfig {
  spreadsheetId: string
  serviceAccountKey: string
  sheetTabs: { ce: string; cpe: string; ee: string }
  gformUrls: { ce: string; cpe: string; ee: string }
}

export interface SettingsConfig {
  smtp: Partial<SmtpConfig>
  sheets: Partial<SheetsConfig>
  darkMode: boolean
  autoSync: boolean
  syncInterval: number
}

export interface AccountEntry {
  username: string
  role: string
  fullName: string
  isActive: boolean
  createdAt: string
  lastLogin: string
}

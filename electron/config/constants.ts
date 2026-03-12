// Application constants

export const APP_NAME = 'Alumni DB'
export const APP_ID = 'com.alumni-db.app'

// Database
export const DB_FILENAME = 'alumni.db'
export const DB_BACKUP_EXT = '.bak'
export const DB_TEMP_EXT = '.tmp'

// Auth
export const AUTH_CACHE_FILENAME = 'auth-cache.enc'
export const MAX_LOGIN_ATTEMPTS = 3
export const LOCKOUT_DURATION_MS = 5 * 60 * 1000 // 5 minutes

// Data constraints
export const MIN_GRADUATION_YEAR = 2018
export const LIKERT_MIN = 1
export const LIKERT_MAX = 5

// Programs
export const PROGRAMS = ['BSCE', 'BSCpE', 'BSEE'] as const
export type Program = (typeof PROGRAMS)[number]

// Roles
export const ROLES = ['dean', 'ce_chair', 'cpe_chair', 'ee_chair'] as const
export type Role = (typeof ROLES)[number]

// Role → accessible programs mapping
export const ROLE_PROGRAMS: Record<Role, readonly Program[]> = {
  dean: PROGRAMS,
  ce_chair: ['BSCE'],
  cpe_chair: ['BSCpE'],
  ee_chair: ['BSEE']
}

// Settings keys (stored in settings table)
export const SETTINGS_KEYS = {
  SHEETS_ID: 'sheets_id',
  SHEETS_KEY: 'sheets_key',
  SHEETS_NAME: 'sheets_name',
  SHEETS_TAB_CE: 'sheets_tab_ce',
  SHEETS_TAB_CPE: 'sheets_tab_cpe',
  SHEETS_TAB_EE: 'sheets_tab_ee',
  SMTP_HOST: 'smtp_host',
  SMTP_PORT: 'smtp_port',
  SMTP_USER: 'smtp_user',
  SMTP_PASS: 'smtp_pass',
  SMTP_FROM: 'smtp_from',
  SMTP_TLS: 'smtp_tls',
  GFORM_URL_CE: 'gform_url_ce',
  GFORM_URL_CPE: 'gform_url_cpe',
  GFORM_URL_EE: 'gform_url_ee',
  DARK_MODE: 'dark_mode',
  AUTO_SYNC_ENABLED: 'auto_sync_enabled',
  AUTO_SYNC_INTERVAL: 'auto_sync_interval'
} as const

// Sync status values
export const SYNC_STATUS = {
  PENDING: 'pending',
  SYNCED: 'synced',
  CONFLICT: 'conflict'
} as const

// Google Sheets
export const ACCOUNTS_TAB_NAME = 'Accounts'
export const DEFAULT_SHEETS_ID = '1JdeHdsiURPUHw2VsHgH5G_9SglWbt8gaFe-2KCKQU7g'
export const DEFAULT_SHEETS_KEY = JSON.stringify({
  type: 'service_account',
  project_id: 'omega-linker-489811-h9',
  private_key_id: '14c2d3ede3825f29d5b9c39449767aa442379864',
  private_key:
    '-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQC/e2omfJSCm+VP\nDpj99lSgZ4/DB7tFCqNCa4s9oVBaIl/R+OGWF2qVC98q36HjqXPkIv1gYMQvN7vd\nnVZUvypcfrq123PDglVJitAQNvG9ISDJcxKrFlann2FxJXEksE1NwSVvbOS+uxIN\nWNWo3DElUGifKeb313dEsTSYlnSK2UGPo4IvXBq/QDXgsGw5jR6MDKtqO11zdFo5\nw/7QOfsIwZHepepxAiCLRCD9+PWDIIVVhK4WlfOM+xEECYHF4Y22KAu+jNUrzZKM\nS7ALupUaavmZ61rbftb3QyRhULMcyuE64ms3sQ3SRyFilZJ1qd/GtH4FGNf1YIpV\n+J7AXh3TAgMBAAECggEAWBco4IfTsrqRpesrSzq1+A1sv+agqsSYEwhyyGmcE7tY\npbp/3ZLsP6F0i77SNXBRlpTaSCp8VtSnIu8tNlOz41WSA/Pvr/QX1Ht9+NeuIrpI\n4SSFZBwkxXy3UVxOTvikt66x0C8ilPRu+6DwunyCR45Uc1TNoxuHDR0Q+1nMR8ub\nFOBVkOqtr+MuRDZNswlb6vC+GSmLHo2KdMHgoDykLGaV9q3xaPmY52EaC2m3WMLg\nOipHODpAdeNlKBNNDbpu8RU6/4agU5pK/XVdQwLiIEjbY7zpGvrbV+nOrvoVfS2s\nBfdf0VoipuuBJgcNdA7kYgPYslX+bOIuFxibjEXFYQKBgQDr1fU12sIv+ZH0VkHS\n9e00oBv8w8OTOsWQg/9+aWtcDjdydR/h3o0muSlr9hE+heNTjayQCFGAB8BXshZs\nky3zZ0W+vAhQRSxKzI+gyjwhqNXKWeYr+YMDnn7+NHP+LuJi4apSb17lU4djmYW7\n31RytgQZixQnk6qT0XgU4njvWwKBgQDP2qFjZedQlwqZ/KWAX9+R/NB+M74B0aHB\nHV7WRwGqKSo9mFN6YERtEU91Fxa/cSvuvqt16kDpx7sumcLyaSHpG4vyqRPyxVuD\noPXtZBn+g61NKrj6lHH/tqph+nQpwMt2Jj64teVoL0o+dcxxKaocPcYOH3LgjS3P\n2zR9H3wM6QKBgHb4b4QkgFO9XeDZ5sjqoSgsIRJJG49ZVbMKs8fsnGlLDrOh3FyQ\nbbp8LCY3cwmMd1p+HPBoEd05i9FxmJhbQxIIJgoLR1JfIvH08fvWKbF9P6Sd51yF\nuY8I1N2eTmmK80+Ysdh2MHQVyDX5i5p0FmDr63OLUraIasO5Jw+6E/IDAoGBAJ+P\nkHEDm20sZgEMB+jisHgbgdo/0k8HJIthBpqr68U60Kh0NTEukZjAvyR90wKn2Dfw\nuyNL7wUIRNNjSlpZBqUydl6UGTI2+yey+teADsxpPTKN527FYjYRff61C1O6IvbS\nKTgWusMd+nq0Z3s/ps0DRvU0gzWKa26zMjoTX2FxAoGBALhRupiytLSOztMECJ+M\nW1vzlbPmgIRkrY8C0kQgAn2r2pNFQpk7Kg2APsftlgHXXuB9HHR4VAyElnnDMPm9\nS36cosNxjLErf/XSu9jTUXVIKSQXzTmFGbW++7ACdudcyk6Z6uoWeirT/xe9roH2\nQMs9vhx8ggcaWKbfasR46M7V\n-----END PRIVATE KEY-----\n',
  client_email: 'alumni-db-sync@omega-linker-489811-h9.iam.gserviceaccount.com',
  client_id: '108512088946572831679',
  auth_uri: 'https://accounts.google.com/o/oauth2/auth',
  token_uri: 'https://oauth2.googleapis.com/token',
  auth_provider_x509_cert_url: 'https://www.googleapis.com/oauth2/v1/certs',
  client_x509_cert_url:
    'https://www.googleapis.com/robot/v1/metadata/x509/alumni-db-sync%40omega-linker-489811-h9.iam.gserviceaccount.com',
  universe_domain: 'googleapis.com'
})
export const DEFAULT_TAB_CE = 'CE'
export const DEFAULT_TAB_CPE = 'CPE'
export const DEFAULT_TAB_EE = 'EE'

// Logger
export const LOG_FILENAME = 'app.log'
export const LOG_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

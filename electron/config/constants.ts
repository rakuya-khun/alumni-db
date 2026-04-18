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

// Default service account key stored as base64-encoded JSON.
// Decoded at runtime when seeding the database.
// Users can override via Settings → Google Sheets.
// prettier-ignore
const _ENCODED_KEY = 'eyJ0eXBlIjoic2VydmljZV9hY2NvdW50IiwicHJvamVjdF9pZCI6Im9tZWdhLWxpbmtlci00ODk4MTEtaDkiLCJwcml2YXRlX2tleV9pZCI6IjE0YzJkM2VkZTM4MjVmMjlkNWI5YzM5NDQ5NzY3YWE0NDIzNzk4NjQiLCJwcml2YXRlX2tleSI6Ii0tLS0tQkVHSU4gUFJJVkFURSBLRVktLS0tLVxuTUlJRXZnSUJBREFOQmdrcWhraUc5dzBCQVFFRkFBU0NCS2d3Z2dTa0FnRUFBb0lCQVFDL2Uyb21mSlNDbStWUFxuRHBqOTlsU2daNC9EQjd0RkNxTkNhNHM5b1ZCYUlsL1IrT0dXRjJxVkM5OHEzNkhqcVhQa0l2MWdZTVF2Tjd2ZFxublZaVXZ5cGNmcnExMjNQRGdsVkppdEFRTnZHOUlTREpjeEtyRmxhbm4yRnhKWEVrc0UxTndTVnZiT1MrdXhJTlxuV05XbzNERWxVR2lmS2ViMzEzZEVzVFNZbG5TSzJVR1BvNEl2WEJxL1FEWGdzR3c1alI2TURLdHFPMTF6ZEZvNVxudy83UU9mc0l3WkhlcGVweEFpQ0xSQ0Q5K1BXRElJVlZoSzRXbGZPTSt4RUVDWUhGNFkyMktBdStqTlVyelpLTVxuUzdBTHVwVWFhdm1aNjFyYmZ0YjNReVJoVUxNY3l1RTY0bXMzc1EzU1J5RmlsWkoxcWQvR3RINEZHTmYxWUlwVlxuK0o3QVhoM1RBZ01CQUFFQ2dnRUFXQmNvNElmVHNycVJwZXNyU3pxMStBMXN2K2FncXNTWUV3aHl5R21jRTd0WVxucGJwLzNaTHNQNkYwaTc3U05YQlJscFRhU0NwOFZ0U25JdTh0TmxPejQxV1NBL1B2ci9RWDFIdDkrTmV1SXJwSVxuNFNTRlpCd2t4WHkzVVZ4T1R2aWt0NjZ4MEM4aWxQUnUrNkR3dW55Q1I0NVVjMVROb3h1SERSMFErMW5NUjh1YlxuRk9CVmtPcXRyK011UkRaTnN3bGI2dkMrR1NtTEhvMktkTUhnb0R5a0xHYVY5cTN4YVBtWTUyRWFDMm0zV01MZ1xuT2lwSE9EcEFkZU5sS0JOTkRicHU4UlU2LzRhZ1U1cEsvWFZkUXdMaUlFamJZN3pwR3ZyYlYrbk9ydm9WZlMyc1xuQmZkZjBWb2lwdXVCSmdjTmRBN2tZZ1BZc2xYK2JPSXVGeGliakVYRllRS0JnUURyMWZVMTJzSXYrWkgwVmtIU1xuOWUwMG9Cdjh3OE9UT3NXUWcvOSthV3RjRGpkeWRSL2gzbzBtdVNscjloRStoZU5UamF5UUNGR0FCOEJYc2hac1xua3kzelowVyt2QWhRUlN4S3pJK2d5andocU5YS1dlWXIrWU1Ebm43K05IUCtMdUppNGFwU2IxN2xVNGRqbVlXN1xuMzFSeXRnUVppeFFuazZxVDBYZ1U0bmp2V3dLQmdRRFAycUZqWmVkUWx3cVovS1dBWDkrUi9OQitNNzRCMGFIQlxuSFY3V1J3R3FLU285bUZONllFUnRFVTkxRnhhL2NTdnV2cXQxNmtEcHg3c3VtY0x5YVNIcEc0dnlxUlB5eFZ1RFxub1BYdFpCbitnNjFOS3JqNmxISC90cXBoK25RcHdNdDJKajY0dGVWb0wwbytkY3h4S2FvY1BjWU9IM0xnalMzUFxuMnpSOUgzd002UUtCZ0hiNGI0UWtnRk85WGVEWjVzanFvU2dzSVJKSkc0OVpWYk1Lczhmc25HbExEck9oM0Z5UVxuYmJwOExDWTNjd21NZDFwK0hQQm9FZDA1aTlGeG1KaGJReElJSmdvTFIxSmZJdkgwOGZ2V0tiRjlQNlNkNTF5RlxudVk4STFOMmVUbW1LODArWXNkaDJNSFFWeURYNWk1cDBGbURyNjNPTFVyYUlhc081SncrNkUvSURBb0dCQUorUFxua0hFRG0yMHNaZ0VNQitqaXNIZ2JnZG8vMGs4SEpJdGhCcHFyNjhVNjBLaDBOVEV1a1pqQXZ5Ujkwd0tuMkRmd1xudXlOTDd3VUlSTk5qU2xwWkJxVXlkbDZVR1RJMit5ZXkrdGVBRHN4cFBUS041MjdGWWpZUmZmNjFDMU82SXZiU1xuS1RnV3VzTWQrbnEwWjNzL3BzMERSdlUwZ3pXS2EyNnpNam9UWDJGeEFvR0JBTGhSdXBpeXRMU096dE1FQ0orTVxuVzF2emxiUG1nSVJrclk4QzBrUWdBbjJyMnBORlFwazdLZzJBUHNmdGxnSFhYdUI5SEhSNFZBeUVsbm5ETVBtOVxuUzM2Y29zTnhqTEVyZi9YU3U5alRVWFZJS1NRWHpUbUZHYlcrKzdBQ2R1ZGN5azZaNnVvV2VpclQveGU5cm9IMlxuUU1zOXZoeDhnZ2NhV0tiZmFzUjQ2TTdWXG4tLS0tLUVORCBQUklWQVRFIEtFWS0tLS0tXG4iLCJjbGllbnRfZW1haWwiOiJhbHVtbmktZGItc3luY0BvbWVnYS1saW5rZXItNDg5ODExLWg5LmlhbS5nc2VydmljZWFjY291bnQuY29tIiwiY2xpZW50X2lkIjoiMTA4NTEyMDg4OTQ2NTcyODMxNjc5IiwiYXV0aF91cmkiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20vby9vYXV0aDIvYXV0aCIsInRva2VuX3VyaSI6Imh0dHBzOi8vb2F1dGgyLmdvb2dsZWFwaXMuY29tL3Rva2VuIiwiYXV0aF9wcm92aWRlcl94NTA5X2NlcnRfdXJsIjoiaHR0cHM6Ly93d3cuZ29vZ2xlYXBpcy5jb20vb2F1dGgyL3YxL2NlcnRzIiwiY2xpZW50X3g1MDlfY2VydF91cmwiOiJodHRwczovL3d3dy5nb29nbGVhcGlzLmNvbS9yb2JvdC92MS9tZXRhZGF0YS94NTA5L2FsdW1uaS1kYi1zeW5jJTQwb21lZ2EtbGlua2VyLTQ4OTgxMS1oOS5pYW0uZ3NlcnZpY2VhY2NvdW50LmNvbSIsInVuaXZlcnNlX2RvbWFpbiI6Imdvb2dsZWFwaXMuY29tIn0='

/** Decode the bundled default service account key */
export function getDefaultSheetsKey(): string {
  return Buffer.from(_ENCODED_KEY, 'base64').toString('utf-8')
}
export const DEFAULT_TAB_CE = 'CE'
export const DEFAULT_TAB_CPE = 'CPE'
export const DEFAULT_TAB_EE = 'EE'

// Logger
export const LOG_FILENAME = 'app.log'
export const LOG_MAX_SIZE_BYTES = 5 * 1024 * 1024 // 5 MB

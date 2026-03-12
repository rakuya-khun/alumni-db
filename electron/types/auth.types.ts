export interface AccountsRow {
  username: string
  password_hash: string
  role: string
  full_name: string
  is_active: boolean
  created_at: string
  last_login: string
}

export interface AuthCache {
  accounts: AccountsRow[]
  cachedAt: string
}

export interface LockoutState {
  attempts: number
  lockedUntil: number | null
}

export interface UserSession {
  username: string
  role: string
  fullName: string
  accessiblePrograms: string[]
}

export interface LoginCredentials {
  username: string
  password: string
}

export interface UserSession {
  username: string
  role: UserRole
  fullName: string
  accessiblePrograms: string[]
}

export type UserRole = 'Dean' | 'CE Chair' | 'CpE Chair' | 'EE Chair'

export interface AuthResult {
  session: UserSession
  isOffline: boolean
}

export interface CachedAccount {
  username: string
  password_hash: string
  role: UserRole
  full_name: string
  is_active: boolean
}

export interface AccountEntry {
  username: string
  role: UserRole
  fullName: string
  isActive: boolean
  createdAt: string
  lastLogin: string
}

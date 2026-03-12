export type { LoginCredentials, UserSession, UserRole, AuthResult, AccountEntry } from '../../shared/types/auth.types'

export type AuthMode = 'online' | 'offline'

export interface LoginFormState {
  username: string
  password: string
  error: string | null
  attempts: number
  isLockedOut: boolean
  lockoutEndTime: number | null
}

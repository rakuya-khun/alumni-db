import * as bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'
import { isOnline } from '../utils/network'
import { encryptToFile, decryptFromFile } from '../utils/crypto'
import { getAuthCachePath } from '../config/paths'
import { MAX_LOGIN_ATTEMPTS, LOCKOUT_DURATION_MS, ROLE_PROGRAMS } from '../config/constants'

interface UserSession {
  username: string
  role: string
  fullName: string
  accessiblePrograms: string[]
}

interface AuthResult {
  session: UserSession
  isOffline: boolean
}

interface AccountEntry {
  username: string
  password_hash: string
  role: string
  full_name: string
  is_active: boolean
  created_at: string
  last_login: string
}

interface LockoutState {
  attempts: number
  lockedUntil: number | null
}

const lockoutMap = new Map<string, LockoutState>()
let currentSession: UserSession | null = null

/** Map backend snake_case role to frontend display role */
const ROLE_DISPLAY: Record<string, string> = {
  dean: 'Dean',
  ce_chair: 'CE Chair',
  cpe_chair: 'CpE Chair',
  ee_chair: 'EE Chair'
}

/** Reverse: display role → internal role */
const DISPLAY_TO_ROLE: Record<string, string> = {
  'dean': 'dean',
  'ce chair': 'ce_chair',
  'cpe chair': 'cpe_chair',
  'ee chair': 'ee_chair'
}

/** Normalize any role format (display or internal) to internal key */
function normalizeRole(role: string): string {
  const lower = role.toLowerCase()
  // Already internal format
  if (ROLE_DISPLAY[lower]) return lower
  // Display format → internal
  if (DISPLAY_TO_ROLE[lower]) return DISPLAY_TO_ROLE[lower]
  // Last resort: return as-is
  return role
}

// ── Dev seed account (offline bootstrap) ──────────────────────
const DEV_ACCOUNT: AccountEntry = {
  username: 'devadmin',
  // bcrypt hash of 'devadmin'
  password_hash: '$2a$10$Z3EoLM9yJ.kjAI651Kkx6.mliJZWv9R0woFwFvT91OKmetUPHq3x2',
  role: 'dean',
  full_name: 'Dev Administrator',
  is_active: true,
  created_at: '2025-01-01T00:00:00.000Z',
  last_login: ''
}

/** Ensure an offline auth cache exists with at least the dev account */
function ensureDevSeed(): void {
  const existing = readCachedAccounts()
  if (existing && existing.length > 0) return
  cacheAccounts([DEV_ACCOUNT])
  logger.info('auth', 'Seeded dev account into offline auth cache')
}

function getLockout(username: string): LockoutState {
  if (!lockoutMap.has(username)) {
    lockoutMap.set(username, { attempts: 0, lockedUntil: null })
  }
  return lockoutMap.get(username)!
}

function checkLockout(username: string): void {
  const state = getLockout(username)
  if (state.lockedUntil && Date.now() < state.lockedUntil) {
    const remaining = Math.ceil((state.lockedUntil - Date.now()) / 1000)
    throw new Error(
      `Account is temporarily locked. Please try again in ${remaining} seconds.`
    )
  }
  // Reset lockout if expired
  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    state.attempts = 0
    state.lockedUntil = null
  }
}

function recordFailedAttempt(username: string): void {
  const state = getLockout(username)
  state.attempts++
  if (state.attempts >= MAX_LOGIN_ATTEMPTS) {
    state.lockedUntil = Date.now() + LOCKOUT_DURATION_MS
    logger.warn('auth', `Account locked: ${username} (${MAX_LOGIN_ATTEMPTS} failed attempts)`)
  }
}

function resetLockout(username: string): void {
  lockoutMap.delete(username)
}

/** Cache accounts locally for offline use */
function cacheAccounts(accounts: AccountEntry[]): void {
  try {
    const cachePath = getAuthCachePath()
    encryptToFile(cachePath, JSON.stringify(accounts))
    logger.info('auth', 'Auth cache updated')
  } catch (error) {
    logger.warn('auth', 'Failed to update auth cache', { error: (error as Error).message })
  }
}

/** Read cached accounts for offline auth */
function readCachedAccounts(): AccountEntry[] | null {
  try {
    const cachePath = getAuthCachePath()
    const data = decryptFromFile(cachePath)
    if (!data) return null
    return JSON.parse(data)
  } catch {
    return null
  }
}

export const authService = {
  async login(username: string, password: string): Promise<AuthResult> {
    ensureDevSeed()
    checkLockout(username)

    let accounts: AccountEntry[] | null = null
    let usedOffline = false

    if (isOnline()) {
      try {
        const sheetsAccounts = await this.fetchAccountsFromSheets()
        if (sheetsAccounts && sheetsAccounts.length > 0) {
          // Merge dev seed if not already in Sheets accounts
          const hasDevAdmin = sheetsAccounts.some(
            (a) => a.username.toLowerCase() === DEV_ACCOUNT.username.toLowerCase()
          )
          accounts = hasDevAdmin ? sheetsAccounts : [...sheetsAccounts, DEV_ACCOUNT]
          cacheAccounts(accounts)
        } else {
          logger.info('auth', 'Accounts tab is empty or missing — using cached accounts')
        }
      } catch (error) {
        logger.warn('auth', 'Online auth failed, falling back to cache', {
          error: (error as Error).message
        })
      }
    }

    // Fallback to cached accounts
    if (!accounts) {
      accounts = readCachedAccounts()
      if (!accounts) {
        throw new Error(
          'Cannot authenticate. No internet connection and no cached credentials available. Please connect to the internet and try again.'
        )
      }
      usedOffline = true
      logger.info('auth', 'Using offline cached auth')
    }

    const account = accounts.find(
      (a) => a.username.toLowerCase() === username.toLowerCase() && a.is_active
    )

    if (!account) {
      recordFailedAttempt(username)
      throw new Error('Invalid username or password.')
    }

    const passwordMatch = await bcrypt.compare(password, account.password_hash)
    if (!passwordMatch) {
      recordFailedAttempt(username)
      throw new Error('Invalid username or password.')
    }

    resetLockout(username)

    const internalRole = normalizeRole(account.role)
    const programs = ROLE_PROGRAMS[internalRole as keyof typeof ROLE_PROGRAMS]
    if (!programs) {
      throw new Error(`Unknown role: ${account.role}`)
    }

    currentSession = {
      username: account.username,
      role: ROLE_DISPLAY[internalRole] || account.role,
      fullName: account.full_name,
      accessiblePrograms: [...programs]
    }

    logger.info('auth', `Login successful: ${account.username} (${account.role})`)

    // Update last_login in Sheets (fire and forget)
    if (isOnline()) {
      this.updateLastLogin(account.username).catch(() => {})
    }

    return { session: currentSession!, isOffline: usedOffline }
  },

  logout(): void {
    if (currentSession) {
      logger.info('auth', `Logout: ${currentSession.username}`)
    }
    currentSession = null
  },

  getSession(): UserSession | null {
    return currentSession
  },

  async getAccounts(): Promise<AccountEntry[]> {
    if (isOnline()) {
      try {
        const accounts = await this.fetchAccountsFromSheets()
        if (accounts) return accounts
      } catch (error) {
        logger.warn('auth', 'Failed to fetch accounts from Sheets', {
          error: (error as Error).message
        })
      }
    }
    return readCachedAccounts() ?? []
  },

  async createAccount(payload: {
    username: string
    password: string
    role: string
    fullName: string
  }): Promise<void> {
    const { accountsAdapter } = await import('../integrations/google-sheets/accounts.adapter')
    const hash = await bcrypt.hash(payload.password, 12)
    const internalRole = normalizeRole(payload.role)
    await accountsAdapter.createAccount({
      username: payload.username,
      password_hash: hash,
      role: internalRole,
      full_name: payload.fullName,
      is_active: true,
      created_at: new Date().toISOString(),
      last_login: ''
    })
    logger.info('auth', `Account created: ${payload.username} (${internalRole})`)
  },

  async updateAccount(payload: {
    username: string
    password?: string
    role?: string
    fullName?: string
    isActive?: boolean
  }): Promise<void> {
    const { accountsAdapter } = await import('../integrations/google-sheets/accounts.adapter')
    const updates: Record<string, string> = {}
    if (payload.password) {
      updates.password_hash = await bcrypt.hash(payload.password, 12)
    }
    if (payload.role) updates.role = payload.role
    if (payload.fullName) updates.full_name = payload.fullName
    if (payload.isActive !== undefined) updates.is_active = String(payload.isActive)
    await accountsAdapter.updateAccount(payload.username, updates)
    logger.info('auth', `Account updated: ${payload.username}`)
  },

  async fetchAccountsFromSheets(): Promise<AccountEntry[]> {
    const { accountsAdapter } = await import('../integrations/google-sheets/accounts.adapter')
    return accountsAdapter.fetchAccounts()
  },

  async updateLastLogin(username: string): Promise<void> {
    try {
      const { accountsAdapter } = await import('../integrations/google-sheets/accounts.adapter')
      await accountsAdapter.updateLastLogin(username, new Date().toISOString())
    } catch (error) {
      logger.warn('auth', 'Failed to update last_login', { error: (error as Error).message })
    }
  }
}

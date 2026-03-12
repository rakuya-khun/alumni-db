import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { authService } from '../services/auth.service'
import { loginSchema } from '../../shared/schemas/login.schema'
import { accountSchema, accountUpdateSchema } from '../../shared/schemas/account.schema'

const CH = IPC_CHANNELS.AUTH

export function registerAuthHandlers(): void {
  ipcMain.handle(CH.LOGIN, async (_event, payload: { username: string; password: string }) => {
    try {
      const validated = loginSchema.parse(payload)
      const result = await authService.login(validated.username, validated.password)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.LOGIN} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.LOGOUT, async () => {
    try {
      authService.logout()
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.LOGOUT} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_SESSION, async () => {
    try {
      const session = authService.getSession()
      return { success: true, data: session }
    } catch (error) {
      logger.error('ipc', `${CH.GET_SESSION} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_ACCOUNTS, async () => {
    try {
      const rawAccounts = await authService.getAccounts()
      // Map snake_case backend fields to camelCase frontend AccountEntry
      const accounts = rawAccounts.map((a) => ({
        username: a.username,
        role: a.role,
        fullName: a.full_name ?? '',
        isActive: a.is_active ?? true,
        createdAt: a.created_at ?? '',
        lastLogin: a.last_login ?? ''
      }))
      return { success: true, data: accounts }
    } catch (error) {
      logger.error('ipc', `${CH.GET_ACCOUNTS} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.CREATE_ACCOUNT, async (_event, payload) => {
    try {
      const validated = accountSchema.parse(payload)
      await authService.createAccount(validated)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.CREATE_ACCOUNT} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.UPDATE_ACCOUNT, async (_event, payload) => {
    try {
      const validated = accountUpdateSchema.parse(payload)
      await authService.updateAccount(validated)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.UPDATE_ACCOUNT} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

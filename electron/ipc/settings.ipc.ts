import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { settingsService } from '../services/settings.service'

const CH = IPC_CHANNELS.SETTINGS

export function registerSettingsHandlers(): void {
  ipcMain.handle(CH.GET, async (_event, payload?: { keys?: string[] }) => {
    try {
      const result = payload?.keys
        ? settingsService.getMultiple(payload.keys)
        : settingsService.getAll()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.SAVE, async (_event, settings: Record<string, string | null>) => {
    try {
      settingsService.saveMultiple(settings)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.SAVE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.TEST_SMTP, async () => {
    try {
      await settingsService.testSmtp()
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.TEST_SMTP} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.TEST_SHEETS, async () => {
    try {
      await settingsService.testSheets()
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.TEST_SHEETS} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

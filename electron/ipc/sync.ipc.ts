import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { syncService } from '../services/sync.service'
import { conflictService } from '../services/conflict.service'
import { autoSyncService } from '../services/auto-sync.service'

const CH = IPC_CHANNELS.SYNC

export function registerSyncHandlers(): void {
  ipcMain.handle(CH.PULL, async () => {
    try {
      const result = await syncService.pull()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.PULL} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.PUSH, async () => {
    try {
      const result = await syncService.push()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.PUSH} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.FULL, async () => {
    try {
      const result = await syncService.fullSync()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.FULL} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_STATUS, async () => {
    try {
      const result = syncService.getStatus()
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_STATUS} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.RESOLVE_CONFLICT, async (_event, id: number, resolution: 'local' | 'remote') => {
    try {
      await conflictService.resolve(id, resolution)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.RESOLVE_CONFLICT} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.AUTO_SYNC_START, async (_event, intervalSeconds?: number) => {
    try {
      const intervalMs = ((intervalSeconds ?? 30) * 1000)
      autoSyncService.start(intervalMs)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.AUTO_SYNC_START} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.AUTO_SYNC_STOP, async () => {
    try {
      autoSyncService.stop()
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.AUTO_SYNC_STOP} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

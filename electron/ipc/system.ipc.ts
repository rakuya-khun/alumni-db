import { ipcMain, app } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import * as os from 'os'

const CH = IPC_CHANNELS.SYSTEM

export function registerSystemHandlers(): void {
  ipcMain.handle(CH.GET_VERSION, async () => {
    try {
      return { success: true, data: app.getVersion() }
    } catch (error) {
      logger.error('ipc', `${CH.GET_VERSION} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_INFO, async () => {
    try {
      return {
        success: true,
        data: {
          version: app.getVersion(),
          electron: process.versions.electron,
          chrome: process.versions.chrome,
          node: process.versions.node,
          platform: process.platform,
          arch: process.arch,
          osVersion: os.release(),
          userData: app.getPath('userData')
        }
      }
    } catch (error) {
      logger.error('ipc', `${CH.GET_INFO} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

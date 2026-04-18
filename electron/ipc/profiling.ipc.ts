import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { alumniService } from '../services/alumni.service'
import { alumniHistoryService } from '../services/alumni-history.service'
import { assertProgramAccess } from '../utils/rbac'

const CH = IPC_CHANNELS.PROFILING

export function registerProfilingHandlers(): void {
  ipcMain.handle(CH.GET_PROFILE, async (_event, id: number) => {
    try {
      const result = await alumniService.getById(id)
      if (result) assertProgramAccess(result.program)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_PROFILE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_HISTORY, async (_event, alumniId: number) => {
    try {
      // Verify access to the alumni record
      const alumni = await alumniService.getById(alumniId)
      if (alumni) assertProgramAccess(alumni.program)
      const result = alumniHistoryService.getByAlumniId(alumniId)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_HISTORY} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_SNAPSHOT, async (_event, alumniId: number) => {
    try {
      // Verify access to the alumni record
      const alumni = await alumniService.getById(alumniId)
      if (alumni) assertProgramAccess(alumni.program)
      const result = alumniHistoryService.getSnapshot(alumniId)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_SNAPSHOT} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

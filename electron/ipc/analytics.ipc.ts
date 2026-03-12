import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { analyticsService } from '../services/analytics.service'

const CH = IPC_CHANNELS.ANALYTICS

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(CH.GET_DASHBOARD, async (_event, programs?: string[]) => {
    try {
      const result = analyticsService.getDashboard(programs)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_DASHBOARD} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_SURVEY_DATA, async (_event, column?: string, programs?: string[]) => {
    try {
      const result = analyticsService.getSurveyData(programs, column)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_SURVEY_DATA} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_WEIGHTED_MEANS, async (_event, programs?: string[]) => {
    try {
      const result = analyticsService.getWeightedMeans(programs)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_WEIGHTED_MEANS} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { analyticsService } from '../services/analytics.service'
import { scopeFilters } from '../utils/rbac'
import type { AnalyticsFilters } from '../database/analytics.repository'

const CH = IPC_CHANNELS.ANALYTICS

export function registerAnalyticsHandlers(): void {
  ipcMain.handle(CH.GET_DASHBOARD, async (_event, filters?: AnalyticsFilters) => {
    try {
      const scoped = scopeFilters(filters ?? {})
      const result = analyticsService.getDashboard(scoped)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_DASHBOARD} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_SURVEY_DATA, async (_event, column?: string, filters?: AnalyticsFilters) => {
    try {
      const scoped = scopeFilters(filters ?? {})
      const result = analyticsService.getSurveyData(scoped, column)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_SURVEY_DATA} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_WEIGHTED_MEANS, async (_event, filters?: AnalyticsFilters) => {
    try {
      const scoped = scopeFilters(filters ?? {})
      const result = analyticsService.getWeightedMeans(scoped)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_WEIGHTED_MEANS} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

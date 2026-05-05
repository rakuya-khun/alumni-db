import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { peoService } from '../services/peo.service'
import { scopeFilters } from '../utils/rbac'
import type { PeoFilters } from '../../shared/types/peo.types'

const CH = IPC_CHANNELS.PEO

export function registerPeoHandlers(): void {
  ipcMain.handle(CH.COMPUTE, async (_event, filters?: PeoFilters) => {
    try {
      const scoped = scopeFilters(filters ?? {}) as PeoFilters
      const result = peoService.compute(scoped)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.COMPUTE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_OUTCOME_RATES, async (_event, filters?: PeoFilters) => {
    try {
      const scoped = scopeFilters(filters ?? {}) as PeoFilters
      const result = peoService.getOutcomeRates(scoped)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_OUTCOME_RATES} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

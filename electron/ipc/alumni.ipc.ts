import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { alumniService } from '../services/alumni.service'
import { authService } from '../services/auth.service'

const CH = IPC_CHANNELS.ALUMNI

export function registerAlumniHandlers(): void {
    ipcMain.handle(CH.GET_SPECIALIZATIONS, async () => {
      try {
        const values = await alumniService.getDistinctSpecializations()
        return { success: true, data: values }
      } catch (error) {
        logger.error('ipc', `${CH.GET_SPECIALIZATIONS} failed`, { error: (error as Error).message })
        return { success: false, error: (error as Error).message }
      }
    })

    ipcMain.handle(CH.GET_WORK_REGIONS, async () => {
      try {
        const values = await alumniService.getDistinctWorkRegions()
        return { success: true, data: values }
      } catch (error) {
        logger.error('ipc', `${CH.GET_WORK_REGIONS} failed`, { error: (error as Error).message })
        return { success: false, error: (error as Error).message }
      }
    })

    ipcMain.handle(CH.GET_EMPLOYMENT_POSITIONS, async () => {
      try {
        const values = await alumniService.getDistinctEmploymentPositions()
        return { success: true, data: values }
      } catch (error) {
        logger.error('ipc', `${CH.GET_EMPLOYMENT_POSITIONS} failed`, { error: (error as Error).message })
        return { success: false, error: (error as Error).message }
      }
    })
  ipcMain.handle(CH.GET_ALL, async (_event, filters?: Record<string, unknown>) => {
    try {
      // Inject role-based program filter from current session
      const session = authService.getSession()
      const safeFilters = { ...filters } as Record<string, unknown>
      if (session) {
        const allowed = session.accessiblePrograms as string[]
        const requested = Array.isArray(safeFilters.programs) ? safeFilters.programs as string[] : []
        if (requested.length > 0) {
          // Intersect user selection with role-allowed programs
          const intersection = requested.filter((p) => allowed.includes(p))
          safeFilters.programs = intersection.length > 0 ? intersection : allowed
        } else {
          safeFilters.programs = allowed
        }
      }
      const result = await alumniService.getAll(safeFilters)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_ALL} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.GET_BY_ID, async (_event, id: number) => {
    try {
      const result = await alumniService.getById(id)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_BY_ID} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.CREATE, async (_event, data: Record<string, unknown>) => {
    try {
      const id = await alumniService.create(data)
      return { success: true, data: id }
    } catch (error) {
      logger.error('ipc', `${CH.CREATE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.UPDATE, async (_event, id: number, data: Record<string, unknown>) => {
    try {
      await alumniService.update(id, data)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.UPDATE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.DELETE, async (_event, id: number) => {
    try {
      await alumniService.delete(id)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.DELETE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.SEARCH, async (_event, query: string, programs?: string[]) => {
    try {
      const result = await alumniService.search(query, programs)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.SEARCH} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

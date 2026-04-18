import { ipcMain } from 'electron'
import { IPC_CHANNELS } from '../../shared/ipc-channels'
import { logger } from '../utils/logger'
import { alumniService } from '../services/alumni.service'
import { scopeFilters, assertProgramAccess } from '../utils/rbac'
import { alumniSchema } from '../../shared/schemas/alumni.schema'

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
      const safeFilters = scopeFilters(filters)
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
      if (result) assertProgramAccess(result.program)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.GET_BY_ID} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.CREATE, async (_event, data: Record<string, unknown>) => {
    try {
      const validated = alumniSchema.parse(data)
      assertProgramAccess(validated.program)
      const id = await alumniService.create(validated)
      return { success: true, data: id }
    } catch (error) {
      logger.error('ipc', `${CH.CREATE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.UPDATE, async (_event, id: number, data: Record<string, unknown>) => {
    try {
      const validated = alumniSchema.partial().parse(data)
      // Check access to the existing record
      const existing = await alumniService.getById(id)
      if (existing) assertProgramAccess(existing.program)
      // If changing program, check access to the new one too
      if (validated.program) assertProgramAccess(validated.program)
      await alumniService.update(id, validated)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.UPDATE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.DELETE, async (_event, id: number) => {
    try {
      const existing = await alumniService.getById(id)
      if (existing) assertProgramAccess(existing.program)
      await alumniService.delete(id)
      return { success: true }
    } catch (error) {
      logger.error('ipc', `${CH.DELETE} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })

  ipcMain.handle(CH.SEARCH, async (_event, query: string, programs?: string[]) => {
    try {
      const scoped = scopeFilters({ programs })
      const result = await alumniService.search(query, scoped.programs)
      return { success: true, data: result }
    } catch (error) {
      logger.error('ipc', `${CH.SEARCH} failed`, { error: (error as Error).message })
      return { success: false, error: (error as Error).message }
    }
  })
}

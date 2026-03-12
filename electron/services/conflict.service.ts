import { alumniRepository } from '../database/alumni.repository'
import { syncQueueRepository } from '../database/sync-queue.repository'
import { safeSave } from '../database/db-manager'
import { logger } from '../utils/logger'
import { settingsService } from './settings.service'

export const conflictService = {
  async resolve(id: number, resolution: 'local' | 'remote'): Promise<void> {
    const record = alumniRepository.getById(id)
    if (!record) throw new Error(`Record #${id} not found`)
    if (record.sync_status !== 'conflict') {
      throw new Error(`Record #${id} is not in conflict state`)
    }

    if (resolution === 'local') {
      // Keep local data, push to Sheets on next sync
      syncQueueRepository.resolveConflict(id)
      // Mark as pending so it gets pushed
      alumniRepository.update(id, { sync_status: 'pending' })
    } else {
      // Keep remote data — re-pull from the correct tab for this record's program
      const { sheetsAdapter } = await import('../integrations/google-sheets/sheets.adapter')
      const { mapSheetRowToAlumni } = await import('../integrations/google-sheets/mapper')

      const { sheetTabs } = settingsService.getSheetsConfig()
      const programToTab: Record<string, string> = {
        'BSCE': sheetTabs.ce,
        'BSCpE': sheetTabs.cpe,
        'BSEE': sheetTabs.ee
      }
      const tabName = programToTab[record.program] ?? sheetTabs.ce

      const allRows = await sheetsAdapter.readAllRows(tabName)
      if (allRows.length < 2) {
        syncQueueRepository.resolveConflict(id)
        safeSave()
        return
      }

      const headers = allRows[0]
      const dataRows = allRows.slice(1)
      const matching = dataRows.find((row) => {
        const mapped = mapSheetRowToAlumni(row, headers)
        return (
          mapped.full_name === record.full_name &&
          mapped.program === record.program &&
          mapped.year_graduated === record.year_graduated
        )
      })

      if (matching) {
        const mapped = mapSheetRowToAlumni(matching, headers)
        alumniRepository.update(id, { ...mapped, sync_status: 'synced' })
      } else {
        // Remote not found — just resolve the conflict
        syncQueueRepository.resolveConflict(id)
      }
    }

    safeSave()
    logger.info('conflict', `Resolved conflict for #${id}: ${resolution}`)
  },

  getConflicts(programs?: string[]) {
    return syncQueueRepository.getConflictRecords(programs)
  }
}

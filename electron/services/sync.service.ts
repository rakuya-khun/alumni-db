import { alumniRepository } from '../database/alumni.repository'
import { syncQueueRepository } from '../database/sync-queue.repository'
import { safeSave } from '../database/db-manager'
import { isOnline } from '../utils/network'
import { logger } from '../utils/logger'
import { settingsService } from './settings.service'

interface SyncResult {
  pulled: number
  pushed: number
  conflicts: number
}

export const syncService = {
  async pull(): Promise<SyncResult> {
    if (!isOnline()) throw new Error('No internet connection. Cannot sync.')
    if (!settingsService.isConfigured()) {
      throw new Error('Please configure Google Sheets in Settings before syncing.')
    }

    const { sheetsAdapter } = await import('../integrations/google-sheets/sheets.adapter')
    const { mapSheetRowToAlumni } = await import('../integrations/google-sheets/mapper')

    const { sheetTabs } = settingsService.getSheetsConfig()
    const tabs = [
      { tab: sheetTabs.ce,  program: 'BSCE' },
      { tab: sheetTabs.cpe, program: 'BSCpE' },
      { tab: sheetTabs.ee,  program: 'BSEE' },
    ]

    let pulled = 0
    let conflicts = 0
    let tabErrors = 0

    for (const { tab: tabName, program: programCode } of tabs) {
      let allRows: string[][]
      try {
        allRows = await sheetsAdapter.readAllRows(tabName)
      } catch (error) {
        const msg = error instanceof Error ? error.message : String(error)
        if (msg.includes('not found') || msg.includes('404')) {
          tabErrors++
          if (tabErrors === tabs.length) {
            throw new Error(
              'Cannot access the Google Sheet. Please make sure the spreadsheet is shared with the service account as an Editor.'
            )
          }
        }
        logger.warn('sync', `Skipping tab "${tabName}" — not found or empty`, { error })
        continue
      }

      if (allRows.length < 2) continue

      const headers = allRows[0]
      const dataRows = allRows.slice(1)

      for (const sheetRow of dataRows) {
        const mapped = mapSheetRowToAlumni(sheetRow, headers)
        // Inject program from tab context if sheet doesn't have a program column
        if (!mapped.program) mapped.program = programCode
        if (!mapped.full_name || !mapped.program || !mapped.year_graduated) continue

        // Enforce year constraint — skip pre-2018 alumni
        const yearGrad = Number(mapped.year_graduated)
        if (yearGrad < 2018) continue

        const existing = alumniRepository.findByCompositeKey(
          mapped.full_name as string,
          mapped.program as string,
          mapped.year_graduated as number
        )

        if (!existing) {
          alumniRepository.create({ ...mapped, sync_status: 'synced' })
          pulled++
        } else if (existing.sync_status === 'pending') {
          syncQueueRepository.markConflict(existing.id)
          conflicts++
        } else {
          alumniRepository.update(existing.id, mapped)
          syncQueueRepository.markSynced(existing.id)
          pulled++
        }
      }
    }

    safeSave()
    logger.info('sync', `Pull complete: ${pulled} pulled, ${conflicts} conflicts`)
    return { pulled, pushed: 0, conflicts }
  },

  async push(): Promise<SyncResult> {
    if (!isOnline()) throw new Error('No internet connection. Cannot sync.')
    if (!settingsService.isConfigured()) {
      throw new Error('Please configure Google Sheets in Settings before syncing.')
    }

    const { sheetsAdapter } = await import('../integrations/google-sheets/sheets.adapter')
    const { mapAlumniToSheetRow } = await import('../integrations/google-sheets/mapper')

    const { sheetTabs } = settingsService.getSheetsConfig()
    const programToTab: Record<string, string> = {
      'BSCE': sheetTabs.ce,
      'BSCpE': sheetTabs.cpe,
      'BSEE': sheetTabs.ee
    }

    // Read headers from each tab so push respects real column order
    const tabHeaders: Record<string, string[]> = {}
    for (const tabName of Object.values(programToTab)) {
      if (!tabHeaders[tabName]) {
        try {
          const rows = await sheetsAdapter.readAllRows(tabName)
          tabHeaders[tabName] = rows.length > 0 ? rows[0] : []
        } catch {
          tabHeaders[tabName] = []
        }
      }
    }

    const pendingRecords = syncQueueRepository.getPendingRecords()
    let pushed = 0

    for (const record of pendingRecords) {
      try {
        const tabName = programToTab[record.program] ?? sheetTabs.ce
        const headers = tabHeaders[tabName]
        const sheetRow = mapAlumniToSheetRow(record, headers.length > 0 ? headers : undefined)
        await sheetsAdapter.upsertRow(
          record.full_name,
          record.program,
          record.year_graduated,
          sheetRow,
          tabName
        )
        syncQueueRepository.markSynced(record.id)
        pushed++
      } catch (error) {
        logger.warn('sync', `Failed to push record #${record.id}`, {
          error: (error as Error).message
        })
      }
    }

    safeSave()
    logger.info('sync', `Push complete: ${pushed} pushed`)
    return { pulled: 0, pushed, conflicts: 0 }
  },

  async fullSync(): Promise<SyncResult> {
    const pullResult = await this.pull()
    const pushResult = await this.push()

    return {
      pulled: pullResult.pulled,
      pushed: pushResult.pushed,
      conflicts: pullResult.conflicts
    }
  },

  getStatus(): {
    pendingCount: number
    conflictCount: number
    isOnline: boolean
    lastSyncAt: string | null
  } {
    return {
      pendingCount: syncQueueRepository.getPendingCount(),
      conflictCount: syncQueueRepository.getConflictCount(),
      isOnline: isOnline(),
      lastSyncAt: syncQueueRepository.getLastSyncTime()
    }
  }
}

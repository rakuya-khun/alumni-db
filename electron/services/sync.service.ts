import { alumniRepository } from '../database/alumni.repository'
import { syncQueueRepository } from '../database/sync-queue.repository'
import { safeSave } from '../database/db-manager'
import { isOnline } from '../utils/network'
import { logger } from '../utils/logger'
import { settingsService } from './settings.service'

/** Normalize a name: trim, collapse multiple spaces to single */
function normalizeName(name: string): string {
  return name.trim().replace(/\s+/g, ' ')
}

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
        if (!mapped.full_name) continue

        mapped.full_name = normalizeName(mapped.full_name as string)

        if (mapped.year_graduated) {
          // ── New Alumni row (has year_graduated) ──
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
        } else {
          // ── Update Alumni row (no year_graduated) ──
          // Look up existing record by name + program only
          const existing = alumniRepository.findByNameAndProgram(
            mapped.full_name as string,
            mapped.program as string
          )
          if (!existing) continue // Can't create without year_graduated — skip

          if (existing.sync_status === 'pending') {
            syncQueueRepository.markConflict(existing.id)
            conflicts++
          } else {
            // Merge only non-empty fields from Update row — don't overwrite existing data with blanks
            const mergeData: Record<string, unknown> = {}
            for (const [key, value] of Object.entries(mapped)) {
              if (key === 'created_at') continue          // Keep original timestamp
              if (value === null || value === undefined) continue
              if (value === '') continue
              mergeData[key] = value
            }
            // Remove keys that shouldn't be set during merge
            delete mergeData.full_name   // Already matched
            delete mergeData.program     // Already matched
            delete mergeData.sync_status // Will be set explicitly

            if (Object.keys(mergeData).length > 0) {
              alumniRepository.update(existing.id, mergeData)
              syncQueueRepository.markSynced(existing.id)
              pulled++
            }
          }
        }
      }
    }

    safeSave()

    // Auto-deduplicate: merge and remove duplicate records
    let deduped = 0
    const dupGroups = alumniRepository.findDuplicateGroups()
    for (const group of dupGroups) {
      for (const removeId of group.removeIds) {
        alumniRepository.mergeAndDelete(group.keepId, removeId)
        deduped++
      }
    }
    if (deduped > 0) {
      safeSave()
      logger.info('sync', `Deduplicated ${deduped} duplicate records`)
    }

    logger.info('sync', `Pull complete: ${pulled} pulled, ${conflicts} conflicts, ${deduped} deduped`)
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

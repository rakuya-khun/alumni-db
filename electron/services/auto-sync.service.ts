import { logger } from '../utils/logger'
import { isOnline } from '../utils/network'
import { syncQueueRepository } from '../database/sync-queue.repository'
import { syncService } from './sync.service'

let intervalHandle: ReturnType<typeof setInterval> | null = null
const DEFAULT_INTERVAL_MS = 30 * 1000 // 30 seconds

export const autoSyncService = {
  start(intervalMs?: number): void {
    if (intervalHandle) {
      logger.info('auto-sync', 'Auto-sync already running')
      return
    }

    const interval = intervalMs ?? DEFAULT_INTERVAL_MS
    logger.info('auto-sync', `Starting auto-sync every ${interval / 1000}s`)

    intervalHandle = setInterval(async () => {
      try {
        if (!isOnline()) {
          logger.info('auto-sync', 'Skipped: offline')
          return
        }

        // Don't auto-sync if there are unresolved conflicts
        const conflictCount = syncQueueRepository.getConflictCount()
        if (conflictCount > 0) {
          logger.info('auto-sync', `Skipped: ${conflictCount} unresolved conflicts`)
          return
        }

        const result = await syncService.fullSync()
        logger.info('auto-sync', 'Completed', {
          pulled: result.pulled,
          pushed: result.pushed,
          conflicts: result.conflicts
        })
      } catch (error) {
        logger.error('auto-sync', 'Failed', { error: (error as Error).message })
      }
    }, interval)
  },

  stop(): void {
    if (intervalHandle) {
      clearInterval(intervalHandle)
      intervalHandle = null
      logger.info('auto-sync', 'Stopped')
    }
  },

  isRunning(): boolean {
    return intervalHandle !== null
  }
}

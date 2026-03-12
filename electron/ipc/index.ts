import { registerAuthHandlers } from './auth.ipc'
import { registerAlumniHandlers } from './alumni.ipc'
import { registerAnalyticsHandlers } from './analytics.ipc'
import { registerProfilingHandlers } from './profiling.ipc'
import { registerExportHandlers } from './export.ipc'
import { registerEmailHandlers } from './email.ipc'
import { registerSyncHandlers } from './sync.ipc'
import { registerSettingsHandlers } from './settings.ipc'
import { registerSystemHandlers } from './system.ipc'
import { logger } from '../utils/logger'

/**
 * Register all IPC handlers for every domain.
 * Called once during app startup in main.ts.
 */
export function registerIpcHandlers(): void {
  registerAuthHandlers()
  registerAlumniHandlers()
  registerAnalyticsHandlers()
  registerProfilingHandlers()
  registerExportHandlers()
  registerEmailHandlers()
  registerSyncHandlers()
  registerSettingsHandlers()
  registerSystemHandlers()

  logger.info('ipc', 'All IPC handlers registered')
}

import { logger } from './logger'

/**
 * Auto-updater placeholder.
 * electron-updater integration will be added when the app is published.
 * For now this is a no-op module.
 */
export function initUpdater(): void {
  logger.info('updater', 'Auto-updater not configured (placeholder)')
}

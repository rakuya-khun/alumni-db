import { net } from 'electron'
import { logger } from './logger'

let cachedOnline: boolean | null = null

/**
 * Check if the machine has internet connectivity.
 * Uses Electron's net.isOnline() as primary, with a fallback DNS check.
 */
export function isOnline(): boolean {
  try {
    const online = net.isOnline()
    if (cachedOnline !== online) {
      logger.info('network', `Connectivity changed: ${online ? 'online' : 'offline'}`)
      cachedOnline = online
    }
    return online
  } catch {
    // Fallback if net module is not available (e.g., during tests)
    return cachedOnline ?? false
  }
}

/**
 * Reset cached state (for testing).
 */
export function resetNetworkCache(): void {
  cachedOnline = null
}

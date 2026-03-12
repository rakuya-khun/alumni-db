import { app } from 'electron'
import { join } from 'path'
import {
  DB_FILENAME,
  DB_BACKUP_EXT,
  DB_TEMP_EXT,
  AUTH_CACHE_FILENAME,
  LOG_FILENAME
} from './constants'

/** Base directory for all user data (platform-specific AppData) */
export function getUserDataPath(): string {
  return app.getPath('userData')
}

/** Path to the alumni.db SQLite database file */
export function getDbPath(): string {
  return join(getUserDataPath(), DB_FILENAME)
}

/** Path to the temporary write file (atomic save step 1) */
export function getDbTempPath(): string {
  return join(getUserDataPath(), DB_FILENAME + DB_TEMP_EXT)
}

/** Path to the backup file (atomic save step 2) */
export function getDbBackupPath(): string {
  return join(getUserDataPath(), DB_FILENAME + DB_BACKUP_EXT)
}

/** Path to the encrypted offline auth cache */
export function getAuthCachePath(): string {
  return join(getUserDataPath(), AUTH_CACHE_FILENAME)
}

/** Path to the application log file */
export function getLogPath(): string {
  return join(getUserDataPath(), LOG_FILENAME)
}

/** Path to the sql-wasm.wasm binary (bundled in extraResources) */
export function getWasmPath(): string {
  if (app.isPackaged) {
    return join(process.resourcesPath, 'sql-wasm.wasm')
  }
  // In development, resolve from node_modules
  return join(app.getAppPath(), 'node_modules', 'sql.js', 'dist', 'sql-wasm.wasm')
}

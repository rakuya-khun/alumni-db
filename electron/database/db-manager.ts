import initSqlJs, { Database } from 'sql.js'
import { readFileSync, writeFileSync, renameSync, unlinkSync, existsSync, openSync, fsyncSync, closeSync } from 'fs'
import { getDbPath, getDbTempPath, getDbBackupPath, getWasmPath } from '../config/paths'
import { logger } from '../utils/logger'
import { createTables, insertDefaults } from './schema'
import { runMigrations } from './migrations/index'

let db: Database | null = null

/**
 * Initialize the database: load sql.js WASM, open or create alumni.db,
 * run schema creation and migrations.
 */
export async function initDb(): Promise<void> {
  const wasmPath = getWasmPath()
  const dbPath = getDbPath()

  logger.info('db', `Initializing database at ${dbPath}`)
  logger.info('db', `WASM path: ${wasmPath}`)

  // Recover from interrupted atomic save
  recoverFromCrash(dbPath)

  let wasmBinary: Buffer
  try {
    wasmBinary = readFileSync(wasmPath)
  } catch (err) {
    throw new Error(`Cannot read sql-wasm.wasm at ${wasmPath}: ${(err as Error).message}`)
  }
  const SQL = await initSqlJs({ wasmBinary })

  if (existsSync(dbPath)) {
    const fileBuffer = readFileSync(dbPath)
    db = new SQL.Database(fileBuffer)
    logger.info('db', 'Existing database loaded')
  } else {
    db = new SQL.Database()
    logger.info('db', 'New database created')
  }

  // Enable foreign keys (journal_mode not applicable for sql.js in-memory WASM)
  db.run('PRAGMA foreign_keys = ON')

  // Validate DB is usable (catches corrupt .db files)
  try {
    db.exec('SELECT 1')
  } catch {
    logger.warn('db', 'Database file is corrupt — recreating')
    db.close()
    if (existsSync(dbPath)) unlinkSync(dbPath)
    db = new SQL.Database()
    logger.info('db', 'Fresh database created after corruption recovery')
    db.run('PRAGMA foreign_keys = ON')
  }

  createTables(db)
  insertDefaults(db)
  runMigrations(db)

  // Persist the freshly-created or migrated database
  safeSave()

  logger.info('db', 'Database initialization complete')
}

/**
 * Get the current database instance. Throws if not initialized.
 */
export function getDb(): Database {
  if (!db) {
    throw new Error('Database not initialized. Call initDb() first.')
  }
  return db
}

/**
 * Atomic write-rename save: .tmp → fsync → .bak → rename → cleanup.
 * Guarantees a valid .db file at all times — survives crashes.
 */
export function safeSave(): void {
  if (!db) return

  const dbPath = getDbPath()
  const tmpPath = getDbTempPath()
  const bakPath = getDbBackupPath()

  const data = db.export()
  const buffer = Buffer.from(data)

  // Step 1: Write to temp file and fsync
  writeFileSync(tmpPath, buffer)
  const fd = openSync(tmpPath, 'r+')
  fsyncSync(fd)
  closeSync(fd)

  // Step 2: Rename current db to backup (if it exists)
  if (existsSync(dbPath)) {
    renameSync(dbPath, bakPath)
  }

  // Step 3: Rename temp to db
  renameSync(tmpPath, dbPath)

  // Step 4: Remove backup
  if (existsSync(bakPath)) {
    unlinkSync(bakPath)
  }
}

/**
 * Flush database to disk on shutdown. Safe to call multiple times.
 */
export function flushDb(): void {
  if (!db) return
  try {
    safeSave()
    logger.info('db', 'Database flushed to disk')
  } catch (error) {
    logger.error('db', 'Failed to flush database', {
      message: error instanceof Error ? error.message : String(error)
    })
  }
}

/**
 * Recover from a crashed atomic save by restoring .bak or .tmp files.
 */
function recoverFromCrash(dbPath: string): void {
  const tmpPath = getDbTempPath()
  const bakPath = getDbBackupPath()

  // If .tmp exists but .db doesn't, the rename was interrupted after backup
  if (existsSync(tmpPath) && !existsSync(dbPath)) {
    if (existsSync(bakPath)) {
      // Restore from backup — the .tmp might be incomplete
      renameSync(bakPath, dbPath)
      unlinkSync(tmpPath)
      logger.warn('db', 'Recovered database from backup after crash')
    } else {
      // Only .tmp exists — likely a first-time interrupted save, use .tmp
      renameSync(tmpPath, dbPath)
      logger.warn('db', 'Recovered database from temp file after crash')
    }
    return
  }

  // Clean up orphaned files
  if (existsSync(tmpPath)) {
    unlinkSync(tmpPath)
    logger.warn('db', 'Cleaned up orphaned temp file')
  }
  if (existsSync(bakPath) && existsSync(dbPath)) {
    unlinkSync(bakPath)
    logger.warn('db', 'Cleaned up orphaned backup file')
  }
}

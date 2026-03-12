import { Database } from 'sql.js'
import { logger } from '../../utils/logger'

interface Migration {
  version: number
  description: string
  up: (db: Database) => void
}

/**
 * Add new migrations here. Each must have a unique, sequential version number.
 * Migrations run inside a transaction and are applied once per database.
 */
const migrations: Migration[] = [
  {
    version: 2,
    description: 'Add research_conducted and community_involvement columns',
    up: (db) => {
      db.run('ALTER TABLE alumni ADD COLUMN research_conducted TEXT')
      db.run('ALTER TABLE alumni ADD COLUMN community_involvement TEXT')
    }
  },
  {
    version: 3,
    description: 'Remove deprecated settings keys (sheets_spreadsheet_id, sheets_service_account_key)',
    up: (db) => {
      db.run("DELETE FROM settings WHERE key IN ('sheets_spreadsheet_id', 'sheets_service_account_key')")
    }
  },
  {
    version: 4,
    description: 'Normalize program column values to short codes (BSCE, BSCpE, BSEE)',
    up: (db) => {
      db.run("UPDATE alumni SET program = 'BSCE' WHERE program LIKE '%civil%'")
      db.run("UPDATE alumni SET program = 'BSCpE' WHERE program LIKE '%computer%'")
      db.run("UPDATE alumni SET program = 'BSEE' WHERE program LIKE '%electrical%'")
      // alumni_history stores snapshots as JSON in a `snapshot` column — no individual `program` column
    }
  }
]

/**
 * Run all pending migrations. Compares current schema_version from meta table
 * against the migration list and applies any that haven't been run yet.
 */
export function runMigrations(db: Database): void {
  const currentVersion = getCurrentVersion(db)
  const pending = migrations.filter((m) => m.version > currentVersion)

  if (pending.length === 0) {
    logger.info('migrations', `Schema is up to date (version ${currentVersion})`)
    return
  }

  logger.info('migrations', `Running ${pending.length} migration(s) from v${currentVersion}`)

  for (const migration of pending) {
    db.run('BEGIN TRANSACTION')
    try {
      migration.up(db)
      db.run("UPDATE meta SET value = ? WHERE key = 'schema_version'", [
        String(migration.version)
      ])
      db.run('COMMIT')
      logger.info(
        'migrations',
        `Applied migration v${migration.version}: ${migration.description}`
      )
    } catch (error) {
      db.run('ROLLBACK')
      logger.error('migrations', `Migration v${migration.version} failed`, {
        description: migration.description,
        error: error instanceof Error ? error.message : String(error)
      })
      throw error
    }
  }
}

function getCurrentVersion(db: Database): number {
  const result = db.exec("SELECT value FROM meta WHERE key = 'schema_version'")
  if (result.length === 0 || result[0].values.length === 0) {
    return 0
  }
  return parseInt(String(result[0].values[0][0]), 10) || 0
}

import type { Database } from 'sql.js'

export interface DbManager {
  initDb(): Promise<void>
  getDb(): Database
  safeSave(): void
  flushDb(): void
}

export interface MigrationEntry {
  version: number
  name: string
  up(db: Database): void
}

export interface QueryResult<T = Record<string, unknown>> {
  rows: T[]
  rowCount: number
}

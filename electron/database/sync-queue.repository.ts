import { getDb } from './db-manager'
import type { AlumniRow } from './alumni.repository'

function toRows(result: { columns: string[]; values: unknown[][] }[]): AlumniRow[] {
  if (result.length === 0) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as AlumniRow
  })
}

export const syncQueueRepository = {
  /** Count of records with sync_status = 'pending' */
  getPendingCount(programs?: string[]): number {
    const db = getDb()
    let sql = "SELECT COUNT(*) FROM alumni WHERE sync_status = 'pending'"
    const params: unknown[] = []
    if (programs && programs.length > 0) {
      const placeholders = programs.map(() => '?').join(', ')
      sql += ` AND program IN (${placeholders})`
      params.push(...programs)
    }
    const result = db.exec(sql, params)
    if (result.length === 0) return 0
    return Number(result[0].values[0][0])
  },

  /** All records with sync_status = 'pending' */
  getPendingRecords(programs?: string[]): AlumniRow[] {
    const db = getDb()
    let sql = "SELECT * FROM alumni WHERE sync_status = 'pending'"
    const params: unknown[] = []
    if (programs && programs.length > 0) {
      const placeholders = programs.map(() => '?').join(', ')
      sql += ` AND program IN (${placeholders})`
      params.push(...programs)
    }
    sql += ' ORDER BY updated_at ASC'
    return toRows(db.exec(sql, params))
  },

  /** Mark a single record as synced */
  markSynced(id: number): void {
    const db = getDb()
    db.run(
      "UPDATE alumni SET sync_status = 'synced', synced_at = datetime('now') WHERE id = ?",
      [id]
    )
  },

  /** Mark a single record as having a conflict */
  markConflict(id: number): void {
    const db = getDb()
    db.run("UPDATE alumni SET sync_status = 'conflict' WHERE id = ?", [id])
  },

  /** Count of records with sync_status = 'conflict' */
  getConflictCount(programs?: string[]): number {
    const db = getDb()
    let sql = "SELECT COUNT(*) FROM alumni WHERE sync_status = 'conflict'"
    const params: unknown[] = []
    if (programs && programs.length > 0) {
      const placeholders = programs.map(() => '?').join(', ')
      sql += ` AND program IN (${placeholders})`
      params.push(...programs)
    }
    const result = db.exec(sql, params)
    if (result.length === 0) return 0
    return Number(result[0].values[0][0])
  },

  /** Get all conflict records */
  getConflictRecords(programs?: string[]): AlumniRow[] {
    const db = getDb()
    let sql = "SELECT * FROM alumni WHERE sync_status = 'conflict'"
    const params: unknown[] = []
    if (programs && programs.length > 0) {
      const placeholders = programs.map(() => '?').join(', ')
      sql += ` AND program IN (${placeholders})`
      params.push(...programs)
    }
    sql += ' ORDER BY updated_at ASC'
    return toRows(db.exec(sql, params))
  },

  /** Resolve a conflict by accepting local data (set back to synced) */
  resolveConflict(id: number): void {
    const db = getDb()
    db.run(
      "UPDATE alumni SET sync_status = 'synced', synced_at = datetime('now') WHERE id = ?",
      [id]
    )
  },

  /** Get the most recent synced_at timestamp */
  getLastSyncTime(): string | null {
    const db = getDb()
    const result = db.exec(
      "SELECT MAX(synced_at) FROM alumni WHERE synced_at IS NOT NULL"
    )
    if (result.length === 0 || result[0].values.length === 0) return null
    const val = result[0].values[0][0]
    return val ? String(val) : null
  },

  /** Reset all sync statuses to 'pending' (for full re-sync) */
  resetAll(): void {
    const db = getDb()
    db.run("UPDATE alumni SET sync_status = 'pending', synced_at = NULL")
  }
}

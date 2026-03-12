import { getDb } from './db-manager'

export interface AlumniHistoryRow {
  id: number
  alumni_id: number
  snapshot: string
  changed_fields: string
  created_at: string
}

function toRows(result: { columns: string[]; values: unknown[][] }[]): AlumniHistoryRow[] {
  if (result.length === 0) return []
  const { columns, values } = result[0]
  return values.map((row) => {
    const obj: Record<string, unknown> = {}
    columns.forEach((col, i) => {
      obj[col] = row[i]
    })
    return obj as AlumniHistoryRow
  })
}

export const alumniHistoryRepository = {
  createSnapshot(alumniId: number, snapshot: string, changedFields: string): void {
    const db = getDb()
    db.run(
      'INSERT INTO alumni_history (alumni_id, snapshot, changed_fields) VALUES (?, ?, ?)',
      [alumniId, snapshot, changedFields]
    )
  },

  getByAlumniId(alumniId: number): AlumniHistoryRow[] {
    const db = getDb()
    const result = db.exec(
      'SELECT * FROM alumni_history WHERE alumni_id = ? ORDER BY created_at DESC',
      [alumniId]
    )
    return toRows(result)
  },

  getLatest(alumniId: number): AlumniHistoryRow | null {
    const db = getDb()
    const result = db.exec(
      'SELECT * FROM alumni_history WHERE alumni_id = ? ORDER BY created_at DESC LIMIT 1',
      [alumniId]
    )
    const rows = toRows(result)
    return rows[0] ?? null
  },

  getCount(alumniId: number): number {
    const db = getDb()
    const result = db.exec(
      'SELECT COUNT(*) FROM alumni_history WHERE alumni_id = ?',
      [alumniId]
    )
    if (result.length === 0) return 0
    return Number(result[0].values[0][0])
  }
}

import { getDb } from './db-manager'

export interface AlumniRow {
  [key: string]: unknown
  id: number
  full_name: string
  program: string
  year_graduated: number
  sync_status: string
  created_at: string
  updated_at: string
}

export interface AlumniFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
  syncStatus?: string
  isEmployed?: number
  hasLicense?: number
  search?: string
  specialization?: string[]
  workRegion?: string[]
  employmentPosition?: string[]
}

/**
 * Build a WHERE clause + params for role-filtered + user-filtered queries.
 */
function buildWhereClause(filters: AlumniFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []


  if (filters.programs && filters.programs.length > 0) {
    const placeholders = filters.programs.map(() => '?').join(', ')
    conditions.push(`program IN (${placeholders})`)
    params.push(...filters.programs)
  }

  if (filters.yearFrom != null) {
    conditions.push('year_graduated >= ?')
    params.push(filters.yearFrom)
  }

  if (filters.yearTo != null) {
    conditions.push('year_graduated <= ?')
    params.push(filters.yearTo)
  }

  if (filters.syncStatus) {
    conditions.push('sync_status = ?')
    params.push(filters.syncStatus)
  }

  if (filters.isEmployed != null) {
    conditions.push('is_employed = ?')
    params.push(filters.isEmployed)
  }

  if (filters.hasLicense != null) {
    conditions.push('has_license = ?')
    params.push(filters.hasLicense)
  }

  if (filters.specialization && filters.specialization.length > 0) {
    const placeholders = filters.specialization.map(() => '?').join(', ')
    conditions.push(`specialization IN (${placeholders})`)
    params.push(...filters.specialization)
  }

  if (filters.workRegion && filters.workRegion.length > 0) {
    const placeholders = filters.workRegion.map(() => '?').join(', ')
    conditions.push(`work_region IN (${placeholders})`)
    params.push(...filters.workRegion)
  }


  if (filters.employmentPosition && filters.employmentPosition.length > 0) {
    const placeholders = filters.employmentPosition.map(() => '?').join(', ')
    conditions.push(`current_position IN (${placeholders})`)
    params.push(...filters.employmentPosition)
  }

  if (filters.search) {
    conditions.push('(full_name LIKE ? OR gmail_address LIKE ? OR company_name LIKE ?)')
    const term = `%${filters.search}%`
    params.push(term, term, term)
  }

  const clause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  return { clause, params }
}

/**
 * Convert sql.js result columns + values into an array of row objects.
 */
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

export const alumniRepository = {
    /** Get distinct specializations */
    getDistinctSpecializations(): string[] {
      const db = getDb()
      const result = db.exec('SELECT DISTINCT specialization FROM alumni WHERE specialization IS NOT NULL AND specialization != ""')
      if (result.length === 0) return []
      return result[0].values.map((row) => String(row[0]))
    },

    /** Get distinct work regions */
    getDistinctWorkRegions(): string[] {
      const db = getDb()
      const result = db.exec('SELECT DISTINCT work_region FROM alumni WHERE work_region IS NOT NULL AND work_region != ""')
      if (result.length === 0) return []
      return result[0].values.map((row) => String(row[0]))
    },

    /** Get distinct employment positions */
    getDistinctEmploymentPositions(): string[] {
      const db = getDb()
      const result = db.exec('SELECT DISTINCT current_position FROM alumni WHERE current_position IS NOT NULL AND current_position != ""')
      if (result.length === 0) return []
      return result[0].values.map((row) => String(row[0]))
    },
  getAll(filters: AlumniFilters = {}): AlumniRow[] {
    const db = getDb()
    const { clause, params } = buildWhereClause(filters)
    const result = db.exec(`SELECT * FROM alumni ${clause} ORDER BY updated_at DESC`, params)
    return toRows(result)
  },

  getById(id: number): AlumniRow | null {
    const db = getDb()
    const result = db.exec('SELECT * FROM alumni WHERE id = ?', [id])
    const rows = toRows(result)
    return rows[0] ?? null
  },

  create(data: Record<string, unknown>): number {
    const db = getDb()
    const keys = Object.keys(data)
    const placeholders = keys.map(() => '?').join(', ')
    const values = keys.map((k) => data[k])

    db.run(
      `INSERT INTO alumni (${keys.join(', ')}) VALUES (${placeholders})`,
      values
    )

    const idResult = db.exec('SELECT last_insert_rowid() as id')
    return Number(idResult[0].values[0][0])
  },

  update(id: number, data: Record<string, unknown>): void {
    const db = getDb()
    const keys = Object.keys(data)
    const setClauses = keys.map((k) => `${k} = ?`).join(', ')
    const values = keys.map((k) => data[k])

    db.run(
      `UPDATE alumni SET ${setClauses}, updated_at = datetime('now'), sync_status = 'pending' WHERE id = ?`,
      [...values, id]
    )
  },

  delete(id: number): void {
    const db = getDb()
    db.run('DELETE FROM alumni WHERE id = ?', [id])
  },

  search(query: string, programs: string[]): AlumniRow[] {
    return this.getAll({ programs, search: query })
  },

  getCount(filters: AlumniFilters = {}): number {
    const db = getDb()
    const { clause, params } = buildWhereClause(filters)
    const result = db.exec(`SELECT COUNT(*) as count FROM alumni ${clause}`, params)
    if (result.length === 0) return 0
    return Number(result[0].values[0][0])
  },

  /** Get all records pending sync */
  getPending(programs?: string[]): AlumniRow[] {
    return this.getAll({ programs, syncStatus: 'pending' })
  },

  /** Mark a record as synced */
  markSynced(id: number): void {
    const db = getDb()
    db.run(
      "UPDATE alumni SET sync_status = 'synced', synced_at = datetime('now') WHERE id = ?",
      [id]
    )
  },

  /** Mark a record as having a conflict */
  markConflict(id: number): void {
    const db = getDb()
    db.run("UPDATE alumni SET sync_status = 'conflict' WHERE id = ?", [id])
  },

  /** Find by composite key (used for sync matching) */
  findByCompositeKey(
    fullName: string,
    program: string,
    yearGraduated: number
  ): AlumniRow | null {
    const db = getDb()
    const result = db.exec(
      'SELECT * FROM alumni WHERE full_name = ? AND program = ? AND year_graduated = ?',
      [fullName, program, yearGraduated]
    )
    const rows = toRows(result)
    return rows[0] ?? null
  }
}

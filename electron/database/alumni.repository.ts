import { getDb } from './db-manager'
import type { AlumniFilters } from '../../shared/types/alumni.types'

export type { AlumniFilters }

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
    const likeClauses = filters.specialization.map(() => `(specialization = ? OR specialization LIKE ? OR specialization LIKE ? OR specialization LIKE ?)`).join(' OR ')
    conditions.push(`(${likeClauses})`)
    for (const s of filters.specialization) {
      params.push(s, `${s},%`, `%, ${s},%`, `%, ${s}`)
    }
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

  if (filters.jobRelevance && filters.jobRelevance.length > 0) {
    const placeholders = filters.jobRelevance.map(() => '?').join(', ')
    conditions.push(`job_relevance IN (${placeholders})`)
    params.push(...filters.jobRelevance)
  }

  if (filters.jobLevel && filters.jobLevel.length > 0) {
    const placeholders = filters.jobLevel.map(() => '?').join(', ')
    conditions.push(`job_level IN (${placeholders})`)
    params.push(...filters.jobLevel)
  }

  if (filters.employmentStatus && filters.employmentStatus.length > 0) {
    const placeholders = filters.employmentStatus.map(() => '?').join(', ')
    conditions.push(`employment_status IN (${placeholders})`)
    params.push(...filters.employmentStatus)
  }

  if (filters.industrySector && filters.industrySector.length > 0) {
    const placeholders = filters.industrySector.map(() => '?').join(', ')
    conditions.push(`industry_sector IN (${placeholders})`)
    params.push(...filters.industrySector)
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

/** Normalize a name into sorted tokens for fuzzy matching */
function nameTokens(name: string): string {
  return name
    .toLowerCase()
    .replace(/[.,]/g, '')      // strip commas and periods
    .split(/\s+/)              // split on whitespace
    .filter(Boolean)
    .sort()
    .join(' ')
}

export const alumniRepository = {
    /** Get distinct specializations */
    getDistinctSpecializations(): string[] {
      const db = getDb()
      const result = db.exec('SELECT specialization FROM alumni WHERE specialization IS NOT NULL AND specialization != ""')
      if (result.length === 0) return []
      const seen = new Set<string>()
      for (const row of result[0].values) {
        const raw = String(row[0])
        for (const part of raw.split(',')) {
          const trimmed = part.trim()
          if (trimmed) seen.add(trimmed)
        }
      }
      return Array.from(seen).sort()
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

  /** Find by composite key with fuzzy name matching (handles reordering, case, whitespace) */
  findByCompositeKey(
    fullName: string,
    program: string,
    yearGraduated: number
  ): AlumniRow | null {
    const db = getDb()
    const trimmedName = fullName.trim()

    // 1. Exact match (case-insensitive, trimmed)
    const exact = db.exec(
      'SELECT * FROM alumni WHERE LOWER(TRIM(full_name)) = LOWER(?) AND program = ? AND year_graduated = ?',
      [trimmedName, program, yearGraduated]
    )
    const exactRows = toRows(exact)
    if (exactRows.length > 0) return exactRows[0]

    // 2. Token-based fuzzy match (handles name reordering like "Surname, Given" vs "Given Surname")
    const candidates = db.exec(
      'SELECT * FROM alumni WHERE program = ? AND year_graduated = ?',
      [program, yearGraduated]
    )
    const candidateRows = toRows(candidates)
    if (candidateRows.length === 0) return null

    const inputTokens = nameTokens(trimmedName)
    for (const row of candidateRows) {
      if (nameTokens(row.full_name) === inputTokens) {
        return row
      }
    }

    return null
  },

  /** Find by name and program with fuzzy name matching (no year constraint) */
  findByNameAndProgram(fullName: string, program: string): AlumniRow | null {
    const db = getDb()
    const trimmedName = fullName.trim()

    // 1. Exact match (case-insensitive, trimmed) — may return multiple, take first
    const exact = db.exec(
      'SELECT * FROM alumni WHERE LOWER(TRIM(full_name)) = LOWER(?) AND program = ?',
      [trimmedName, program]
    )
    const exactRows = toRows(exact)
    if (exactRows.length > 0) return exactRows[0]

    // 2. Token-based fuzzy match (handles name reordering)
    const candidates = db.exec(
      'SELECT * FROM alumni WHERE program = ?',
      [program]
    )
    const candidateRows = toRows(candidates)
    if (candidateRows.length === 0) return null

    const inputTokens = nameTokens(trimmedName)
    for (const row of candidateRows) {
      if (nameTokens(row.full_name) === inputTokens) {
        return row
      }
    }

    return null
  },

  /** Find groups of duplicate records based on fuzzy name tokens + program + year_graduated */
  findDuplicateGroups(): { keepId: number; removeIds: number[] }[] {
    const db = getDb()
    const result = db.exec('SELECT * FROM alumni ORDER BY id ASC')
    const allRows = toRows(result)
    if (allRows.length === 0) return []

    // Group by program + year_graduated
    const groups = new Map<string, AlumniRow[]>()
    for (const row of allRows) {
      const key = `${row.program}|${row.year_graduated}`
      if (!groups.has(key)) groups.set(key, [])
      groups.get(key)!.push(row)
    }

    const duplicates: { keepId: number; removeIds: number[] }[] = []

    for (const rows of groups.values()) {
      if (rows.length < 2) continue

      // Cluster by token similarity
      const clusters = new Map<string, AlumniRow[]>()
      for (const row of rows) {
        const tokens = nameTokens(row.full_name)
        if (!clusters.has(tokens)) clusters.set(tokens, [])
        clusters.get(tokens)!.push(row)
      }

      for (const cluster of clusters.values()) {
        if (cluster.length < 2) continue
        // Keep the first (lowest id), remove the rest
        const [keep, ...rest] = cluster
        duplicates.push({
          keepId: keep.id,
          removeIds: rest.map((r) => r.id),
        })
      }
    }

    return duplicates
  },

  /** Merge non-empty fields from removeId into keepId, then delete removeId */
  mergeAndDelete(keepId: number, removeId: number): void {
    const db = getDb()
    const keepResult = db.exec('SELECT * FROM alumni WHERE id = ?', [keepId])
    const removeResult = db.exec('SELECT * FROM alumni WHERE id = ?', [removeId])
    const keepRows = toRows(keepResult)
    const removeRows = toRows(removeResult)
    if (keepRows.length === 0 || removeRows.length === 0) return

    const keep = keepRows[0]
    const remove = removeRows[0]

    // Merge: fill empty fields in keep with non-empty values from remove
    const updates: Record<string, unknown> = {}
    const skipFields = new Set(['id', 'created_at', 'updated_at', 'sync_status', 'synced_at'])

    for (const key of Object.keys(remove)) {
      if (skipFields.has(key)) continue
      const keepVal = keep[key]
      const removeVal = remove[key]
      // If keep is empty but remove has data, take it
      if ((keepVal === null || keepVal === undefined || keepVal === '') &&
          removeVal !== null && removeVal !== undefined && removeVal !== '') {
        updates[key] = removeVal
      }
    }

    if (Object.keys(updates).length > 0) {
      const setClauses = Object.keys(updates).map((k) => `${k} = ?`).join(', ')
      const values = Object.values(updates)
      db.run(
        `UPDATE alumni SET ${setClauses}, updated_at = datetime('now') WHERE id = ?`,
        [...values, keepId]
      )
    }

    // Delete the duplicate
    db.run('DELETE FROM alumni WHERE id = ?', [removeId])
  },
}

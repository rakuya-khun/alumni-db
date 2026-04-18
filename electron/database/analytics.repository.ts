import { getDb } from './db-manager'

export interface AnalyticsFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
}

/** Helper: build WHERE clause from analytics filters */
function buildWhere(filters?: AnalyticsFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []
  if (filters?.programs && filters.programs.length > 0) {
    const placeholders = filters.programs.map(() => '?').join(', ')
    conditions.push(`program IN (${placeholders})`)
    params.push(...filters.programs)
  }
  if (filters?.yearFrom != null) {
    conditions.push('year_graduated >= ?')
    params.push(filters.yearFrom)
  }
  if (filters?.yearTo != null) {
    conditions.push('year_graduated <= ?')
    params.push(filters.yearTo)
  }
  const clause = conditions.length > 0 ? 'WHERE ' + conditions.join(' AND ') : ''
  return { clause, params }
}

/** Helper: build AND clause from analytics filters (for queries that already have WHERE) */
function buildAnd(filters?: AnalyticsFilters): { clause: string; params: unknown[] } {
  const conditions: string[] = []
  const params: unknown[] = []
  if (filters?.programs && filters.programs.length > 0) {
    const placeholders = filters.programs.map(() => '?').join(', ')
    conditions.push(`program IN (${placeholders})`)
    params.push(...filters.programs)
  }
  if (filters?.yearFrom != null) {
    conditions.push('year_graduated >= ?')
    params.push(filters.yearFrom)
  }
  if (filters?.yearTo != null) {
    conditions.push('year_graduated <= ?')
    params.push(filters.yearTo)
  }
  const clause = conditions.length > 0 ? 'AND ' + conditions.join(' AND ') : ''
  return { clause, params }
}

function scalarResult(result: { columns: string[]; values: unknown[][] }[]): number {
  if (result.length === 0 || result[0].values.length === 0) return 0
  return Number(result[0].values[0][0]) || 0
}

export const analyticsRepository = {
  /** Total alumni count for the given filters */
  getTotalCount(filters?: AnalyticsFilters): number {
    const db = getDb()
    const { clause, params } = buildWhere(filters)
    return scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
  },

  /** KPI 1: % Board Passers (has_license = 1) — excludes BSCpE (no PRC board exam) */
  getBoardPasserRate(filters?: AnalyticsFilters): { total: number; passers: number; rate: number } {
    const db = getDb()
    // Only CE and EE have PRC board exams; exclude CpE from board passer calculation
    const srcPrograms = filters?.programs && filters.programs.length > 0
      ? filters.programs.filter((p) => p !== 'BSCpE')
      : ['BSCE', 'BSEE']
    if (srcPrograms.length === 0) {
      return { total: 0, passers: 0, rate: 0 }
    }
    const boardFilters: AnalyticsFilters = { ...filters, programs: srcPrograms }
    const { clause, params } = buildWhere(boardFilters)
    const total = scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
    const { clause: andClause, params: andParams } = buildAnd(boardFilters)
    const passers = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE has_license = 1 ${andClause}`,
        andParams
      )
    )
    const rate = total > 0 ? (passers / total) * 100 : 0
    return { total, passers, rate: Math.round(rate * 100) / 100 }
  },

  /** KPI 2: % Employed (is_employed = 1) */
  getEmploymentRate(filters?: AnalyticsFilters): { total: number; employed: number; rate: number } {
    const db = getDb()
    const { clause, params } = buildWhere(filters)
    const total = scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
    const { clause: andClause, params: andParams } = buildAnd(filters)
    const employed = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE is_employed = 1 ${andClause}`,
        andParams
      )
    )
    const rate = total > 0 ? (employed / total) * 100 : 0
    return { total, employed, rate: Math.round(rate * 100) / 100 }
  },

  /** KPI 3: % Field-Related Employment (job_relevance is 'very_related' or 'related') */
  getFieldRelatedRate(
    filters?: AnalyticsFilters
  ): { employed: number; fieldRelated: number; rate: number } {
    const db = getDb()
    const { clause: andClause, params: andParams } = buildAnd(filters)
    const employed = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE is_employed = 1 ${andClause}`,
        andParams
      )
    )
    const fieldRelated = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE is_employed = 1 AND LOWER(job_relevance) IN ('highly related', 'moderately related') ${andClause}`,
        andParams
      )
    )
    const rate = employed > 0 ? (fieldRelated / employed) * 100 : 0
    return { employed, fieldRelated, rate: Math.round(rate * 100) / 100 }
  },

  /** KPI 4: % Supervisory/Managerial */
  getSupervisoryRate(
    filters?: AnalyticsFilters
  ): { employed: number; supervisory: number; rate: number } {
    const db = getDb()
    const { clause: andClause, params: andParams } = buildAnd(filters)
    const employed = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE is_employed = 1 ${andClause}`,
        andParams
      )
    )
    // All programs use same job_level values from Google Forms:
    // Supervisory/Team Lead, Managerial (CE/EE may also have 'Yes' for legacy data)
    const supervisory = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE is_employed = 1 AND (LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) = 'yes') ${andClause}`,
        andParams
      )
    )
    const rate = employed > 0 ? (supervisory / employed) * 100 : 0
    return { employed, supervisory, rate: Math.round(rate * 100) / 100 }
  },

  /** Frequency distribution for any column, grouped by value */
  getFrequencyDistribution(
    column: string,
    filters?: AnalyticsFilters
  ): { value: string; count: number }[] {
    const db = getDb()
    // Allowlist columns to prevent SQL injection
    const allowedColumns = [
      'program', 'year_graduated', 'sex', 'has_honors', 'has_license',
      'is_employed', 'employment_status', 'job_level', 'job_relevance',
      'salary_range', 'time_to_first_job', 'first_job_method', 'work_region',
      'industry_sector', 'has_grad_school', 'curriculum_relevance',
      'unemployment_reason', 'has_awards', 'professional_title', 'specialization'
    ]
    if (!allowedColumns.includes(column)) return []

    const { clause, params } = buildWhere(filters)
    const whereOrAnd = clause ? 'AND' : 'WHERE'
    const result = db.exec(
      `SELECT ${column} as value, COUNT(*) as count FROM alumni ${clause} ${whereOrAnd} ${column} IS NOT NULL AND ${column} != '' GROUP BY ${column} ORDER BY count DESC`,
      params
    )
    if (result.length === 0) return []
    return result[0].values.map((row: unknown[]) => ({
      value: String(row[0] ?? 'N/A'),
      count: Number(row[1])
    }))
  },

  /** Weighted mean for the 9 competency Likert-scale items (1–5) */
  getCompetencyMeans(filters?: AnalyticsFilters): { competency: string; mean: number }[] {
    const db = getDb()
    const competencies = [
      'comp_engineering_knowledge',
      'comp_problem_solving',
      'comp_engineering_design',
      'comp_communication',
      'comp_teamwork',
      'comp_ethics',
      'comp_leadership',
      'comp_lifelong_learning',
      'comp_modern_tools'
    ]

    const { clause, params } = buildWhere(filters)

    return competencies.map((col) => {
      const result = db.exec(
        `SELECT AVG(CAST(${col} AS REAL)) FROM alumni ${clause} ${clause ? 'AND' : 'WHERE'} ${col} IS NOT NULL`,
        params
      )
      const mean = scalarResult(result)
      return { competency: col, mean: Math.round(mean * 100) / 100 }
    })
  },

  /** Count by year for a given set of programs */
  getCountByYear(filters?: AnalyticsFilters): { year: number; count: number }[] {
    const db = getDb()
    const { clause, params } = buildWhere(filters)
    const result = db.exec(
      `SELECT year_graduated, COUNT(*) as count FROM alumni ${clause} GROUP BY year_graduated ORDER BY year_graduated`,
      params
    )
    if (result.length === 0) return []
    return result[0].values.map((row: unknown[]) => ({
      year: Number(row[0]),
      count: Number(row[1])
    }))
  },

  /** Competency frequency distribution (returns rows like 'comp_name:scale_value') */
  getCompetencyFrequency(filters?: AnalyticsFilters): { value: string; count: number }[] {
    const db = getDb()
    const competencies = [
      'comp_engineering_knowledge',
      'comp_problem_solving',
      'comp_engineering_design',
      'comp_communication',
      'comp_teamwork',
      'comp_ethics',
      'comp_leadership',
      'comp_lifelong_learning',
      'comp_modern_tools'
    ]
    const { clause, params } = buildWhere(filters)
    const rows: { value: string; count: number }[] = []

    for (const col of competencies) {
      for (const scale of [1, 2, 3, 4, 5]) {
        const andOrWhere = clause ? 'AND' : 'WHERE'
        const result = db.exec(
          `SELECT COUNT(*) FROM alumni ${clause} ${andOrWhere} ${col} = ?`,
          [...params, scale]
        )
        const count = scalarResult(result)
        rows.push({ value: `${col}:${scale}`, count })
      }
    }
    return rows
  },

  /** Frequency distribution for JSON array TEXT columns (e.g., advanced_study_reason, job_challenges) */
  getJsonArrayFrequency(column: string, filters?: AnalyticsFilters): { value: string; count: number }[] {
    const allowedJsonColumns = ['advanced_study_reason', 'job_challenges', 'useful_competencies', 'first_job_method']
    if (!allowedJsonColumns.includes(column)) return []

    const db = getDb()
    const { clause, params } = buildWhere(filters)
    const result = db.exec(
      `SELECT ${column} FROM alumni ${clause}`,
      params
    )
    if (result.length === 0) return []

    const freq = new Map<string, number>()
    for (const row of result[0].values) {
      const raw = row[0]
      if (!raw) continue
      try {
        const arr = JSON.parse(String(raw))
        if (Array.isArray(arr)) {
          for (const item of arr) {
            const val = String(item).trim()
            if (val) freq.set(val, (freq.get(val) ?? 0) + 1)
          }
        } else {
          const val = String(raw).trim()
          if (val) freq.set(val, (freq.get(val) ?? 0) + 1)
        }
      } catch {
        // Not valid JSON — try comma-separated, then treat as single value
        const str = String(raw).trim()
        if (str.includes(',')) {
          for (const part of str.split(',')) {
            const val = part.trim()
            if (val) freq.set(val, (freq.get(val) ?? 0) + 1)
          }
        } else if (str) {
          freq.set(str, (freq.get(str) ?? 0) + 1)
        }
      }
    }

    return Array.from(freq.entries())
      .map(([value, count]) => ({ value, count }))
      .sort((a, b) => b.count - a.count)
  },

  /** Frequency distribution for comma-separated multi-value TEXT columns (e.g., professional_title, specialization) */
  getMultiValueFrequency(
    column: string,
    filters?: AnalyticsFilters,
    options?: { caseInsensitive?: boolean }
  ): { value: string; count: number }[] {
    const allowedColumns = [
      'program', 'year_graduated', 'sex', 'has_honors', 'has_license',
      'is_employed', 'employment_status', 'job_level', 'job_relevance',
      'salary_range', 'time_to_first_job', 'first_job_method', 'work_region',
      'industry_sector', 'has_grad_school', 'curriculum_relevance',
      'unemployment_reason', 'has_awards', 'professional_title', 'specialization'
    ]
    if (!allowedColumns.includes(column)) return []

    const db = getDb()
    const { clause, params } = buildWhere(filters)
    const whereOrAnd = clause ? 'AND' : 'WHERE'
    const result = db.exec(
      `SELECT ${column} FROM alumni ${clause} ${whereOrAnd} ${column} IS NOT NULL AND ${column} != ''`,
      params
    )
    if (result.length === 0) return []

    const caseInsensitive = options?.caseInsensitive ?? false
    const freq = new Map<string, number>()
    const displayMap = new Map<string, string>() // lowercase key → first-seen capitalization

    for (const row of result[0].values) {
      const raw = row[0]
      if (!raw) continue
      const parts = String(raw).split(',')
      for (const part of parts) {
        const trimmed = part.trim()
        if (!trimmed) continue
        const key = caseInsensitive ? trimmed.toLowerCase() : trimmed
        if (caseInsensitive && !displayMap.has(key)) {
          displayMap.set(key, trimmed)
        }
        freq.set(key, (freq.get(key) ?? 0) + 1)
      }
    }

    return Array.from(freq.entries())
      .map(([key, count]) => ({
        value: caseInsensitive ? (displayMap.get(key) ?? key) : key,
        count
      }))
      .sort((a, b) => b.count - a.count)
  },

  /** Count by program */
  getCountByProgram(filters?: AnalyticsFilters): { program: string; count: number }[] {
    const db = getDb()
    const { clause, params } = buildWhere(filters)
    const result = db.exec(
      `SELECT program, COUNT(*) as count FROM alumni ${clause} GROUP BY program ORDER BY program`,
      params
    )
    if (result.length === 0) return []
    return result[0].values.map((row: unknown[]) => ({
      program: String(row[0]),
      count: Number(row[1])
    }))
  }
}

import { getDb } from './db-manager'

/** Helper: build program filter clause + params */
function programFilter(programs?: string[]): { clause: string; params: unknown[] } {
  if (!programs || programs.length === 0) return { clause: '', params: [] }
  const placeholders = programs.map(() => '?').join(', ')
  return { clause: `WHERE program IN (${placeholders})`, params: [...programs] }
}

function programAnd(programs?: string[]): { clause: string; params: unknown[] } {
  if (!programs || programs.length === 0) return { clause: '', params: [] }
  const placeholders = programs.map(() => '?').join(', ')
  return { clause: `AND program IN (${placeholders})`, params: [...programs] }
}

function scalarResult(result: { columns: string[]; values: unknown[][] }[]): number {
  if (result.length === 0 || result[0].values.length === 0) return 0
  return Number(result[0].values[0][0]) || 0
}

export const analyticsRepository = {
  /** Total alumni count for the given programs */
  getTotalCount(programs?: string[]): number {
    const db = getDb()
    const { clause, params } = programFilter(programs)
    return scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
  },

  /** KPI 1: % Board Passers (has_license = 1) */
  getBoardPasserRate(programs?: string[]): { total: number; passers: number; rate: number } {
    const db = getDb()
    const { clause, params } = programFilter(programs)
    const total = scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
    const { clause: andClause, params: andParams } = programAnd(programs)
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
  getEmploymentRate(programs?: string[]): { total: number; employed: number; rate: number } {
    const db = getDb()
    const { clause, params } = programFilter(programs)
    const total = scalarResult(db.exec(`SELECT COUNT(*) FROM alumni ${clause}`, params))
    const { clause: andClause, params: andParams } = programAnd(programs)
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
    programs?: string[]
  ): { employed: number; fieldRelated: number; rate: number } {
    const db = getDb()
    const { clause: andClause, params: andParams } = programAnd(programs)
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
    programs?: string[]
  ): { employed: number; supervisory: number; rate: number } {
    const db = getDb()
    const { clause: andClause, params: andParams } = programAnd(programs)
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
    programs?: string[]
  ): { value: string; count: number }[] {
    const db = getDb()
    // Allowlist columns to prevent SQL injection
    const allowedColumns = [
      'program', 'year_graduated', 'sex', 'has_honors', 'has_license',
      'is_employed', 'employment_status', 'job_level', 'job_relevance',
      'salary_range', 'time_to_first_job', 'first_job_method', 'work_region',
      'industry_sector', 'has_grad_school', 'curriculum_relevance',
      'unemployment_reason', 'has_awards'
    ]
    if (!allowedColumns.includes(column)) return []

    const { clause, params } = programFilter(programs)
    const result = db.exec(
      `SELECT ${column} as value, COUNT(*) as count FROM alumni ${clause} GROUP BY ${column} ORDER BY count DESC`,
      params
    )
    if (result.length === 0) return []
    return result[0].values.map((row: unknown[]) => ({
      value: String(row[0] ?? 'N/A'),
      count: Number(row[1])
    }))
  },

  /** Weighted mean for the 9 competency Likert-scale items (1–5) */
  getCompetencyMeans(programs?: string[]): { competency: string; mean: number }[] {
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

    const { clause, params } = programFilter(programs)

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
  getCountByYear(programs?: string[]): { year: number; count: number }[] {
    const db = getDb()
    const { clause, params } = programFilter(programs)
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
  getCompetencyFrequency(programs?: string[]): { value: string; count: number }[] {
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
    const { clause, params } = programFilter(programs)
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
  getJsonArrayFrequency(column: string, programs?: string[]): { value: string; count: number }[] {
    const allowedJsonColumns = ['advanced_study_reason', 'job_challenges', 'useful_competencies', 'first_job_method']
    if (!allowedJsonColumns.includes(column)) return []

    const db = getDb()
    const { clause, params } = programFilter(programs)
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

  /** Count by program */
  getCountByProgram(programs?: string[]): { program: string; count: number }[] {
    const db = getDb()
    const { clause, params } = programFilter(programs)
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

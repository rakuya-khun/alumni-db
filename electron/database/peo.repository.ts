import { getDb } from './db-manager'
import type { PeoFilters } from '../../shared/types/peo.types'

/**
 * PEO Repository — computes raw counts for Program Educational Objectives.
 * See docs/PEO-IMPLEMENTATION-PLAN.md §3-§5.
 *
 * Note: only `programs`, `yearFrom`, `yearTo` from PeoFilters are applied here.
 * `denominatorMode` and `asOfYear` are handled by the service layer.
 */

/** Helper: build WHERE clause from PEO filters */
function buildWhere(filters?: PeoFilters): { clause: string; params: unknown[] } {
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

/** Helper: build AND clause from PEO filters (for queries that already have WHERE) */
function buildAnd(filters?: PeoFilters): { clause: string; params: unknown[] } {
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

// ---------------------------------------------------------------------------
// Reusable SQL fragments (no user input — safe to inline)
// ---------------------------------------------------------------------------

const JOB_RELATED_SQL = `LOWER(job_relevance) IN ('highly related', 'moderately related')`

// PEO 1 indicators
const LICENSE_SQL = `(has_license = 1 OR (other_certifications IS NOT NULL AND TRIM(other_certifications) != ''))`
const SUPERVISORY_SQL = `(LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) LIKE '%team lead%' OR LOWER(job_level) = 'yes')`

// PEO 2 indicators
const COMMUNITY_DIRECT_SQL = `(
  community_involvement IS NOT NULL
  AND LOWER(TRIM(community_involvement)) NOT IN ('', 'none', 'n/a', 'na', 'no', '-', '0')
)`
const COMMUNITY_PROXY_SECTOR_SQL = `(
  LOWER(industry_sector) LIKE '%government%'
  OR LOWER(industry_sector) LIKE '%public sector%'
  OR LOWER(industry_sector) LIKE '%public service%'
  OR LOWER(industry_sector) LIKE '%public works%'
  OR LOWER(industry_sector) LIKE '%academe%'
  OR LOWER(industry_sector) LIKE '%academic%'
  OR LOWER(industry_sector) LIKE '%university%'
  OR LOWER(industry_sector) LIKE '%education%'
  OR LOWER(industry_sector) LIKE '%school%'
  OR LOWER(industry_sector) LIKE '%research%'
  OR LOWER(industry_sector_other) LIKE '%government%'
  OR LOWER(industry_sector_other) LIKE '%public sector%'
  OR LOWER(industry_sector_other) LIKE '%public service%'
  OR LOWER(industry_sector_other) LIKE '%public works%'
  OR LOWER(industry_sector_other) LIKE '%lgu%'
  OR LOWER(industry_sector_other) LIKE '%academe%'
  OR LOWER(industry_sector_other) LIKE '%academic%'
  OR LOWER(industry_sector_other) LIKE '%university%'
  OR LOWER(industry_sector_other) LIKE '%education%'
  OR LOWER(industry_sector_other) LIKE '%school%'
  OR LOWER(industry_sector_other) LIKE '%research%'
)`
const COMMUNITY_PROXY_KEYWORD_SQL = `(LOWER(current_position) LIKE '%community%' OR LOWER(current_position) LIKE '%extension%' OR LOWER(current_position) LIKE '%volunteer%' OR LOWER(current_position) LIKE '%outreach%' OR LOWER(current_position) LIKE '%ngo%' OR LOWER(current_position) LIKE '%barangay%' OR LOWER(current_position) LIKE '%welfare%' OR LOWER(current_position) LIKE '%public service%' OR LOWER(current_position) LIKE '%social worker%')`
const COMMUNITY_ANY_SQL = `((${COMMUNITY_DIRECT_SQL}) OR (${COMMUNITY_PROXY_SECTOR_SQL}) OR (${COMMUNITY_PROXY_KEYWORD_SQL}))`

// PEO 3 indicators
const RESEARCH_DIRECT_SQL = `(
  research_conducted IS NOT NULL
  AND LOWER(TRIM(research_conducted)) NOT IN ('', 'none', 'n/a', 'na', 'no', '-', '0')
)`
const RESEARCH_GRAD_SCHOOL_SQL = `has_grad_school = 1`
const RESEARCH_ADVANCED_REASON_SQL = `LOWER(advanced_study_reason) LIKE '%research interest%'`
const RESEARCH_PROXY_KEYWORD_SQL = `(LOWER(current_position) LIKE '%research%' OR LOWER(current_position) LIKE '%r&d%' OR LOWER(current_position) LIKE '%scientist%' OR LOWER(current_position) LIKE '%professor%' OR LOWER(current_position) LIKE '%laboratory%' OR LOWER(current_position) LIKE '%data scientist%' OR LOWER(current_position) LIKE '%innovation%')`
const RESEARCH_ANY_SQL = `((${RESEARCH_DIRECT_SQL}) OR (${RESEARCH_GRAD_SCHOOL_SQL}) OR (${RESEARCH_ADVANCED_REASON_SQL}) OR (${RESEARCH_PROXY_KEYWORD_SQL}))`

// Innovation sector — per-program allowlist (literals only, no user input)
const INNOVATION_SECTOR_SQL = `(
  (program = 'BSCE' AND (
       LOWER(industry_sector) LIKE '%consulting%'
    OR LOWER(industry_sector) LIKE '%construction%'
    OR LOWER(industry_sector) LIKE '%infrastructure%'
    OR LOWER(industry_sector) LIKE '%academe%'
    OR LOWER(industry_sector) LIKE '%research%'
    OR LOWER(industry_sector) LIKE '%education%'
    OR LOWER(industry_sector) LIKE '%school%'
    OR LOWER(industry_sector_other) LIKE '%consulting%'
    OR LOWER(industry_sector_other) LIKE '%construction%'
    OR LOWER(industry_sector_other) LIKE '%infrastructure%'
    OR LOWER(industry_sector_other) LIKE '%academe%'
    OR LOWER(industry_sector_other) LIKE '%research%'
    OR LOWER(industry_sector_other) LIKE '%education%'
    OR LOWER(industry_sector_other) LIKE '%school%'
  ))
  OR (program = 'BSCpE' AND (
       LOWER(industry_sector) LIKE '%information technology%'
    OR LOWER(industry_sector) LIKE '%software%'
    OR LOWER(industry_sector) LIKE '%telecom%'
    OR LOWER(industry_sector) LIKE '%semiconductor%'
    OR LOWER(industry_sector) LIKE '%electronics%'
    OR LOWER(industry_sector) LIKE '%cyber%'
    OR LOWER(industry_sector) LIKE '%fintech%'
    OR LOWER(industry_sector) LIKE '%insurtech%'
    OR LOWER(industry_sector) LIKE '%devops%'
    OR LOWER(industry_sector) LIKE '%devtools%'
    OR LOWER(industry_sector) LIKE '%qa%'
    OR LOWER(industry_sector) LIKE '%testing%'
    OR LOWER(industry_sector) LIKE '%test automation%'
    OR LOWER(industry_sector) LIKE '%hardware%'
    OR LOWER(industry_sector) LIKE '%embedded%'
    OR LOWER(industry_sector) LIKE '%iot%'
    OR LOWER(industry_sector) LIKE '%networking%'
    OR LOWER(industry_sector) LIKE '%it consulting%'
    OR LOWER(industry_sector) LIKE '%systems integration%'
    OR LOWER(industry_sector) LIKE '%data%'
    OR LOWER(industry_sector) LIKE '%ai%'
    OR LOWER(industry_sector) LIKE '%machine learning%'
    OR LOWER(industry_sector) LIKE '%cloud%'
    OR LOWER(industry_sector) LIKE '%automotive%'
    OR LOWER(industry_sector) LIKE '%academe%'
    OR LOWER(industry_sector) LIKE '%research%'
    OR LOWER(industry_sector) LIKE '%education%'
    OR LOWER(industry_sector) LIKE '%school%'
    OR LOWER(industry_sector_other) LIKE '%information technology%'
    OR LOWER(industry_sector_other) LIKE '%software%'
    OR LOWER(industry_sector_other) LIKE '%telecom%'
    OR LOWER(industry_sector_other) LIKE '%semiconductor%'
    OR LOWER(industry_sector_other) LIKE '%electronics%'
    OR LOWER(industry_sector_other) LIKE '%cyber%'
    OR LOWER(industry_sector_other) LIKE '%fintech%'
    OR LOWER(industry_sector_other) LIKE '%insurtech%'
    OR LOWER(industry_sector_other) LIKE '%devops%'
    OR LOWER(industry_sector_other) LIKE '%devtools%'
    OR LOWER(industry_sector_other) LIKE '%qa%'
    OR LOWER(industry_sector_other) LIKE '%testing%'
    OR LOWER(industry_sector_other) LIKE '%test automation%'
    OR LOWER(industry_sector_other) LIKE '%hardware%'
    OR LOWER(industry_sector_other) LIKE '%embedded%'
    OR LOWER(industry_sector_other) LIKE '%iot%'
    OR LOWER(industry_sector_other) LIKE '%networking%'
    OR LOWER(industry_sector_other) LIKE '%it consulting%'
    OR LOWER(industry_sector_other) LIKE '%systems integration%'
    OR LOWER(industry_sector_other) LIKE '%data%'
    OR LOWER(industry_sector_other) LIKE '%ai%'
    OR LOWER(industry_sector_other) LIKE '%machine learning%'
    OR LOWER(industry_sector_other) LIKE '%cloud%'
    OR LOWER(industry_sector_other) LIKE '%automotive%'
    OR LOWER(industry_sector_other) LIKE '%academe%'
    OR LOWER(industry_sector_other) LIKE '%research%'
    OR LOWER(industry_sector_other) LIKE '%education%'
    OR LOWER(industry_sector_other) LIKE '%school%'
  ))
  OR (program = 'BSEE' AND (
       LOWER(industry_sector) LIKE '%power%'
    OR LOWER(industry_sector) LIKE '%energy%'
    OR LOWER(industry_sector) LIKE '%telecom%'
    OR LOWER(industry_sector) LIKE '%semiconductor%'
    OR LOWER(industry_sector) LIKE '%electronics%'
    OR LOWER(industry_sector) LIKE '%academe%'
    OR LOWER(industry_sector) LIKE '%research%'
    OR LOWER(industry_sector) LIKE '%education%'
    OR LOWER(industry_sector) LIKE '%school%'
    OR LOWER(industry_sector_other) LIKE '%power%'
    OR LOWER(industry_sector_other) LIKE '%energy%'
    OR LOWER(industry_sector_other) LIKE '%renewable%'
    OR LOWER(industry_sector_other) LIKE '%telecom%'
    OR LOWER(industry_sector_other) LIKE '%semiconductor%'
    OR LOWER(industry_sector_other) LIKE '%electronics%'
    OR LOWER(industry_sector_other) LIKE '%academe%'
    OR LOWER(industry_sector_other) LIKE '%research%'
    OR LOWER(industry_sector_other) LIKE '%education%'
    OR LOWER(industry_sector_other) LIKE '%school%'
  ))
)`

// Combined PEO pass conditions
const PEO1_PASS_SQL = `is_employed = 1 AND ((${JOB_RELATED_SQL}) OR (${LICENSE_SQL}) OR (${SUPERVISORY_SQL}))`
const PEO2_PASS_SQL = `is_employed = 1 AND ((${JOB_RELATED_SQL}) OR ${COMMUNITY_ANY_SQL} OR (has_awards = 1))`
const PEO3_PASS_SQL = `is_employed = 1 AND ((${JOB_RELATED_SQL}) OR ${RESEARCH_ANY_SQL} OR ${INNOVATION_SECTOR_SQL})`

// Outcome alignment (for PeoOutcomeRates)
const ALIGNED_SQL = `is_employed = 1 AND ${JOB_RELATED_SQL}`

// ---------------------------------------------------------------------------
// Repository
// ---------------------------------------------------------------------------

export interface PeoComputeOptions {
  filters?: PeoFilters
  asOfYear?: number
}

export interface PeoCounts {
  denominator: number
  employed: number
  peo1Passing: number
  peo2Passing: number
  peo3Passing: number
  indicators: {
    // PEO 1
    jobRelated: number
    license: number
    supervisory: number
    // PEO 2
    communityDirect: number
    communityProxySector: number
    communityProxyKeyword: number
    hasAwards: number
    // PEO 3
    researchDirect: number
    researchGradSchool: number
    researchAdvancedReason: number
    researchProxyKeyword: number
    innovationSector: number
  }
}

export interface PeoOutcomeCounts {
  cohorts: {
    recent: { total: number; aligned: number }
    mid: { total: number; aligned: number }
    established: { total: number; aligned: number }
  }
  overallTotal: number
  overallAligned: number
}

/** Count rows matching `WHERE <cond> <andClause>` with given filter params. */
function countWhere(cond: string, filters?: PeoFilters): number {
  const db = getDb()
  const { clause: andClause, params } = buildAnd(filters)
  return scalarResult(db.exec(`SELECT COUNT(*) FROM alumni WHERE ${cond} ${andClause}`, params))
}

export const peoRepository = {
  /**
   * Compute raw PEO counts. Returns total denominator and employed gate
   * separately; the service decides which to use based on denominatorMode.
   */
  computePeoCounts(filters?: PeoFilters): PeoCounts {
    const db = getDb()

    // Denominator: total in scope
    const { clause: whereClause, params: whereParams } = buildWhere(filters)
    const denominator = scalarResult(
      db.exec(`SELECT COUNT(*) FROM alumni ${whereClause}`, whereParams)
    )

    // Employed gate
    const employed = countWhere('is_employed = 1', filters)

    // Combined PEO pass counts
    const peo1Passing = countWhere(PEO1_PASS_SQL, filters)
    const peo2Passing = countWhere(PEO2_PASS_SQL, filters)
    const peo3Passing = countWhere(PEO3_PASS_SQL, filters)

    // Indicator breakdowns — each over the employed population
    // PEO 1
    const jobRelated = countWhere(`is_employed = 1 AND ${JOB_RELATED_SQL}`, filters)
    const license = countWhere(`is_employed = 1 AND ${LICENSE_SQL}`, filters)
    const supervisory = countWhere(`is_employed = 1 AND ${SUPERVISORY_SQL}`, filters)

    // PEO 2
    const communityDirect = countWhere(`is_employed = 1 AND ${COMMUNITY_DIRECT_SQL}`, filters)
    const communityProxySector = countWhere(
      `is_employed = 1 AND ${COMMUNITY_PROXY_SECTOR_SQL}`,
      filters
    )
    const communityProxyKeyword = countWhere(
      `is_employed = 1 AND ${COMMUNITY_PROXY_KEYWORD_SQL}`,
      filters
    )
    const hasAwards = countWhere('is_employed = 1 AND has_awards = 1', filters)

    // PEO 3
    const researchDirect = countWhere(`is_employed = 1 AND ${RESEARCH_DIRECT_SQL}`, filters)
    const researchGradSchool = countWhere(
      `is_employed = 1 AND ${RESEARCH_GRAD_SCHOOL_SQL}`,
      filters
    )
    const researchAdvancedReason = countWhere(
      `is_employed = 1 AND ${RESEARCH_ADVANCED_REASON_SQL}`,
      filters
    )
    const researchProxyKeyword = countWhere(
      `is_employed = 1 AND ${RESEARCH_PROXY_KEYWORD_SQL}`,
      filters
    )
    const innovationSector = countWhere(`is_employed = 1 AND ${INNOVATION_SECTOR_SQL}`, filters)

    return {
      denominator,
      employed,
      peo1Passing,
      peo2Passing,
      peo3Passing,
      indicators: {
        jobRelated,
        license,
        supervisory,
        communityDirect,
        communityProxySector,
        communityProxyKeyword,
        hasAwards,
        researchDirect,
        researchGradSchool,
        researchAdvancedReason,
        researchProxyKeyword,
        innovationSector,
      },
    }
  },

  /**
   * Compute outcome alignment rates split by graduation cohort.
   * Cohorts (Y = asOfYear):
   *   recent:      year_graduated >= Y - 2
   *   mid:         year_graduated BETWEEN Y - 5 AND Y - 3
   *   established: year_graduated >= 2018 AND year_graduated <= Y - 6
   */
  computeOutcomeRates(filters?: PeoFilters, asOfYear?: number): PeoOutcomeCounts {
    const db = getDb()
    const Y = asOfYear ?? new Date().getFullYear()

    const { clause: andClause, params: baseParams } = buildAnd(filters)

    // --- Cohort: recent (year_graduated >= Y - 2) ---
    const recentCondParams = [Y - 2, ...baseParams]
    const recentTotal = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE year_graduated >= ? ${andClause}`,
        recentCondParams
      )
    )
    const recentAligned = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE ${ALIGNED_SQL} AND year_graduated >= ? ${andClause}`,
        [Y - 2, ...baseParams]
      )
    )

    // --- Cohort: mid (BETWEEN Y - 5 AND Y - 3) ---
    const midTotal = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE year_graduated BETWEEN ? AND ? ${andClause}`,
        [Y - 5, Y - 3, ...baseParams]
      )
    )
    const midAligned = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE ${ALIGNED_SQL} AND year_graduated BETWEEN ? AND ? ${andClause}`,
        [Y - 5, Y - 3, ...baseParams]
      )
    )

    // --- Cohort: established (>= 2018 AND <= Y - 6) ---
    const establishedTotal = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE year_graduated >= 2018 AND year_graduated <= ? ${andClause}`,
        [Y - 6, ...baseParams]
      )
    )
    const establishedAligned = scalarResult(
      db.exec(
        `SELECT COUNT(*) FROM alumni WHERE ${ALIGNED_SQL} AND year_graduated >= 2018 AND year_graduated <= ? ${andClause}`,
        [Y - 6, ...baseParams]
      )
    )

    // --- Overall (sum of cohorts; equivalent to >= 2018 within filters) ---
    const overallTotal = recentTotal + midTotal + establishedTotal
    const overallAligned = recentAligned + midAligned + establishedAligned

    return {
      cohorts: {
        recent: { total: recentTotal, aligned: recentAligned },
        mid: { total: midTotal, aligned: midAligned },
        established: { total: establishedTotal, aligned: establishedAligned },
      },
      overallTotal,
      overallAligned,
    }
  },
}

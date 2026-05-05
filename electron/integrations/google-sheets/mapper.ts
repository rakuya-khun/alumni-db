/**
 * Bidirectional mapping between Google Sheets column headers
 * and alumni table column names.
 *
 * Handles real Google Form headers (numbered questions, matrix brackets,
 * "Others" conditionals) via multi-strategy fuzzy matching.
 */

// ── Exact-match table (lowercase header → DB column) ─────────────────────

const HEADER_TO_COLUMN: Record<string, string> = {
  // === Clean / short-form headers (backward compat) ===
  'timestamp': 'created_at',
  'full name': 'full_name',
  'date of birth': 'date_of_birth',
  'sex': 'sex',
  'if others, please specify (sex)': 'sex_other',
  'permanent address': 'permanent_address',
  'contact number': 'contact_number',
  'gmail address': 'gmail_address',
  'facebook link': 'facebook_link',
  'program': 'program',
  'year graduated': 'year_graduated',
  'honors received': 'has_honors',
  'if yes, what honors': 'honors_received',
  'curriculum relevance': 'curriculum_relevance',
  'engineering knowledge': 'comp_engineering_knowledge',
  'problem solving': 'comp_problem_solving',
  'engineering design': 'comp_engineering_design',
  'communication': 'comp_communication',
  'teamwork': 'comp_teamwork',
  'ethics': 'comp_ethics',
  'leadership': 'comp_leadership',
  'lifelong learning': 'comp_lifelong_learning',
  'modern tools': 'comp_modern_tools',
  'useful competencies': 'useful_competencies',
  'if others, please specify (competencies)': 'useful_competencies_other',
  'areas to improve': 'areas_to_improve',
  'professional license': 'has_license',
  'professional title': 'professional_title',
  'if others (professional title)': 'professional_title_other',
  'license exam date': 'license_exam_date',
  'other certifications': 'other_certifications',
  'graduate school': 'has_grad_school',
  'graduate program': 'grad_school_program',
  'reason for advanced study': 'advanced_study_reason',
  'if others (advanced study)': 'advanced_study_reason_other',
  'specialization': 'specialization',
  'currently employed': 'is_employed',
  'reason not employed': 'unemployment_reason',
  'if others (unemployment)': 'unemployment_reason_other',
  'employment status': 'employment_status',
  'if others (employment status)': 'employment_status_other',
  'current position': 'current_position',
  'job level': 'job_level',
  'company name': 'company_name',
  'company address': 'company_address',
  'work region': 'work_region',
  'if others (work region)': 'work_region_other',
  'industry sector': 'industry_sector',
  'if others (industry sector)': 'industry_sector_other',
  'job relevance': 'job_relevance',
  'salary range': 'salary_range',
  'time to first job': 'time_to_first_job',
  'first job method': 'first_job_method',
  'if others (first job method)': 'first_job_method_other',
  'is this your first job': 'is_first_job',
  'job challenges': 'job_challenges',
  'if others (job challenges)': 'job_challenges_other',
  'position after 2 years': 'position_2yr',
  'position after 4 years': 'position_4yr',
  'position after 6 years': 'position_6yr',
  'awards received': 'has_awards',
  'if yes, what awards': 'awards_received',

  // === Likely Google Form long-form question headers ===
  // Section II
  'full name (surname, given name, m.i)': 'full_name',
  'full name (surname, given name, m.i.)': 'full_name',
  'permanent home address': 'permanent_address',
  'active gmail address': 'gmail_address',
  'facebook profile link': 'facebook_link',
  // Section III
  'degree and program/course taken': 'program',
  'degree and program / course taken': 'program',
  'did you receive any latin honors or special awards during your studies?': 'has_honors',
  // Section IV
  'how relevant is the curriculum to your current employment?': 'curriculum_relevance',
  'which competencies from the program have been most useful in your job?': 'useful_competencies',
  'in your opinion, what area/s should the university focus on improving?': 'areas_to_improve',
  'what area/s should the university focus on improving?': 'areas_to_improve',
  // Section V — only PRC license = board passer (not generic "professional certificates")
  'do you have a prc license/professional certificate?': 'has_license',
  'do you have a prc license / professional certificate?': 'has_license',
  'do you possess a professional regulation commission (prc) license?': 'has_license',
  'do you possess professional regulation commission (prc) license?': 'has_license',
  'do you possess primary professional certificates?': 'has_license',
  '5. do you possess primary professional certificates?': 'has_license',
  'what is your professional title?': 'professional_title',
  'date of licensure exam (month and year)': 'license_exam_date',
  'other certifications/licenses (if any)': 'other_certifications',
  'other certifications / licenses (if any)': 'other_certifications',
  'have you enrolled or been enrolled in graduate school?': 'has_grad_school',
  'please specify the graduate school program': 'grad_school_program',
  'reason for pursuing advanced studies': 'advanced_study_reason',
  'field of specialization': 'specialization',
  // Section VI
  'are you currently employed?': 'is_employed',
  'reason for not being employed': 'unemployment_reason',
  'current employment status': 'employment_status',
  'present position/designation (please do not abbreviate)': 'current_position',
  'present position / designation (please do not abbreviate)': 'current_position',
  'present position/designation': 'current_position',
  'are you in the supervisory/managerial level?': 'job_level',
  'are you in the supervisory / managerial level?': 'job_level',
  'what is your job classification?': 'job_level',
  'company/organization name (please do not abbreviate)': 'company_name',
  'company / organization name (please do not abbreviate)': 'company_name',
  'company/organization name': 'company_name',
  'company/organization address': 'company_address',
  'company / organization address': 'company_address',
  'address of company/organization you are currently employed to': 'company_address',
  'address of company/organization you are currently employed to (e.g. calamba, laguna)': 'company_address',
  'place of work assignment (region)': 'work_region',
  'place of work assignment': 'work_region',
  'is your job related to your degree?': 'job_relevance',
  'monthly salary range': 'salary_range',
  'how long did it take you to find your first job after graduation?': 'time_to_first_job',
  'how did you obtain your first job?': 'first_job_method',
  'is your current job your first job since graduating?': 'is_first_job',
  'what challenges did you face in finding your first job?': 'job_challenges',
  'challenges encountered in finding your first job': 'job_challenges',
  // Section VII
  'job position after 2 years from graduation': 'position_2yr',
  'job position after 4 years from graduation': 'position_4yr',
  'job position after 6 years from graduation': 'position_6yr',
  'job position within 2 years from graduation': 'position_2yr',
  'job position within 4 years from graduation': 'position_4yr',
  'job position within 6 years from graduation': 'position_6yr',
  'have you received any awards, recognitions, or promotions?': 'has_awards',
  'have you received awards, recognitions, or promotions in your employment?': 'has_awards',
  'awards, recognitions, or promotions?': 'has_awards',
  // Research & community involvement
  'if any, list research conducted and other projects': 'research_conducted',
  'list research conducted and other projects': 'research_conducted',
  'if you have any extensive/community or industry involvement, please specify': 'community_involvement',
  'extensive/community or industry involvement': 'community_involvement',
  // Real sheet alternative wordings
  'when did you obtain your first job after graduation?': 'time_to_first_job',
  'what made you pursue advanced studies?': 'advanced_study_reason',
  'what made you pursue advanced studies? (check all that applies)': 'advanced_study_reason',
  'graduated with latin honors or special awards?': 'has_honors',
  // EE tab typo ("Job Position 6 within from graduation")
  'job position 6 within from graduation': 'position_6yr',
}

// ── Reverse mapping ──────────────────────────────────────────────────────

const COLUMN_TO_HEADER: Record<string, string> = {}
for (const [header, column] of Object.entries(HEADER_TO_COLUMN)) {
  // Keep the first (short) header for each column
  if (!COLUMN_TO_HEADER[column]) COLUMN_TO_HEADER[column] = header
}

// ── Competency matrix bracket keywords ───────────────────────────────────

const COMPETENCY_BRACKET_MAP: Record<string, string> = {
  'engineering knowledge': 'comp_engineering_knowledge',
  'technical competence': 'comp_engineering_knowledge',
  'problem-solving': 'comp_problem_solving',
  'problem solving': 'comp_problem_solving',
  'engineering design': 'comp_engineering_design',
  'project development': 'comp_engineering_design',
  'communication': 'comp_communication',
  'teamwork': 'comp_teamwork',
  'collaboration': 'comp_teamwork',
  'ethic': 'comp_ethics',
  'professional responsibility': 'comp_ethics',
  'leadership': 'comp_leadership',
  'initiative': 'comp_leadership',
  'lifelong learning': 'comp_lifelong_learning',
  'modern': 'comp_modern_tools',
  'tools and technologies': 'comp_modern_tools',
}

// ── "Others" follow-up mapping ───────────────────────────────────────────

/** Maps a main column to its conditional "Others (specify)" column */
const MAIN_TO_OTHER: Record<string, string> = {
  'sex': 'sex_other',
  'useful_competencies': 'useful_competencies_other',
  'professional_title': 'professional_title_other',
  'advanced_study_reason': 'advanced_study_reason_other',
  'unemployment_reason': 'unemployment_reason_other',
  'employment_status': 'employment_status_other',
  'work_region': 'work_region_other',
  'industry_sector': 'industry_sector_other',
  'first_job_method': 'first_job_method_other',
  'job_challenges': 'job_challenges_other',
}

// ── Helper functions ─────────────────────────────────────────────────────

/** Strip leading question numbers: "1. ", "13a. ", "37/38. " */
function stripQuestionNumber(header: string): string {
  return header.replace(/^\d+[a-z]?(?:[./]\d+[a-z]?)?\.?\s*/i, '').trim()
}

/** Check if this header is an "others/specify" follow-up */
function isOthersHeader(header: string): boolean {
  const h = header.toLowerCase()
  return (
    h.includes('if others') ||
    h.includes('others, please specify') ||
    h.includes('others (please specify') ||
    (/^others?\s*(\(|$)/i.test(h))
  )
}

/** Check if this header is a "if yes, specify" follow-up */
function isIfYesSpecify(header: string): boolean {
  const h = header.toLowerCase()
  return h.includes('if yes') && h.includes('specify')
}

/** Check if header should be skipped (consent, status, non-data) */
function isSkippable(header: string): boolean {
  const h = header.toLowerCase()
  return h.includes('data privacy') || h.includes('informed consent') || h.includes('what is your status')
}

// ── Core resolver ────────────────────────────────────────────────────────

/**
 * Resolve any Google Sheets column header to a DB column name.
 *
 * Strategy order:
 * 1. Skip known non-data columns (consent, status)
 * 2. Exact match in HEADER_TO_COLUMN
 * 3. Strip question number → exact match
 * 4. Matrix bracket extraction → competency match
 * 5. "Others/specify" contextual match (uses lastMainColumn)
 * 6. Keyword fallback
 */
export function resolveHeaderColumn(
  rawHeader: string,
  lastMainColumn?: string | null
): string | null {
  const header = rawHeader.toLowerCase().trim()
  if (!header) return null

  // 1. Skip non-data columns
  if (isSkippable(header)) return null

  // 2. Exact match
  if (HEADER_TO_COLUMN[header]) return HEADER_TO_COLUMN[header]

  // 3. Strip question number and retry
  const stripped = stripQuestionNumber(header)
  if (stripped && HEADER_TO_COLUMN[stripped]) return HEADER_TO_COLUMN[stripped]

  // 4. Matrix bracket extraction (e.g. "Rate the following ... [Communication skills]")
  const bracketMatch = header.match(/\[([^\]]+)\]/)
  if (bracketMatch) {
    const inner = bracketMatch[1].toLowerCase()
    for (const [keyword, column] of Object.entries(COMPETENCY_BRACKET_MAP)) {
      if (inner.includes(keyword)) return column
    }
  }

  // 5a. "If yes, please specify" context
  if (isIfYesSpecify(header) || isIfYesSpecify(stripped)) {
    if (lastMainColumn === 'has_honors') return 'honors_received'
    if (lastMainColumn === 'has_awards') return 'awards_received'
    if (lastMainColumn === 'has_grad_school') return 'grad_school_program'
  }

  // 5b. "Others/specify" context
  if (isOthersHeader(header) || isOthersHeader(stripped)) {
    if (lastMainColumn && MAIN_TO_OTHER[lastMainColumn]) return MAIN_TO_OTHER[lastMainColumn]
  }

  // 6. Keyword fallback on the stripped (numberless) header
  const s = stripped.toLowerCase()

  if (s.includes('full name')) return 'full_name'
  if (s.includes('date of birth') || s.includes('birthday')) return 'date_of_birth'
  if (/\bsex\b/.test(s) && !s.includes('specify')) return 'sex'
  if (s.includes('permanent') && s.includes('address')) return 'permanent_address'
  if (s.includes('contact number') || s.includes('phone number')) return 'contact_number'
  if (s.includes('gmail')) return 'gmail_address'
  if (s.includes('facebook')) return 'facebook_link'
  if ((s.includes('degree') || s.includes('course')) && s.includes('program')) return 'program'
  if (s.includes('year graduated') || s.includes('year of graduation')) return 'year_graduated'
  if (s.includes('latin honors') || (s.includes('honors') && s.includes('awards') && s.includes('during'))) return 'has_honors'
  if (s.includes('how relevant') && s.includes('curriculum')) return 'curriculum_relevance'
  if (s.includes('competencies') && (s.includes('useful') || s.includes('most useful'))) return 'useful_competencies'
  if (s.includes('area') && s.includes('improv')) return 'areas_to_improve'
  if (s.includes('primary professional certificates')) return 'has_license'
  if (s.includes('prc license') || s.includes('regulation commission') || (s.includes('prc') && s.includes('license'))) return 'has_license'
  if (s.includes('professional title')) return 'professional_title'
  if ((s.includes('licensure') || s.includes('exam')) && s.includes('month')) return 'license_exam_date'
  if (s.includes('other certifications') || s.includes('other licenses') || s.includes('certifications obtained') || s.includes('licensure/certifications')) return 'other_certifications'
  if (s.includes('enrolled') && s.includes('graduate school')) return 'has_grad_school'
  if (s.includes('graduate school program') || s.includes('specify the graduate')) return 'grad_school_program'
  if ((s.includes('reason') || s.includes('pursue')) && s.includes('advanced stud')) return 'advanced_study_reason'
  if (s.includes('specialization') || s.includes('field of special')) return 'specialization'
  if (s.includes('company') && s.includes('name') && !s.includes('address')) return 'company_name'
  if ((s.includes('company') || s.includes('organization')) && s.includes('address')) return 'company_address'
  if (s.includes('address') && s.includes('currently employed')) return 'company_address'
  if (s.includes('currently employed') && !s.includes('address')) return 'is_employed'
  if (s.includes('reason') && s.includes('not') && s.includes('employed')) return 'unemployment_reason'
  if (s.includes('employment status')) return 'employment_status'
  if (s.includes('present position') || s.includes('designation')) return 'current_position'
  if (s.includes('supervisory') || s.includes('managerial') || s.includes('job classification')) return 'job_level'
  if (s.includes('place of work') || s.includes('work assignment')) return 'work_region'
  if (s.includes('industry sector')) return 'industry_sector'
  if (s.includes('job') && s.includes('related') && s.includes('degree')) return 'job_relevance'
  if (s.includes('salary range') || s.includes('monthly salary')) return 'salary_range'
  if ((s.includes('how long') || (s.includes('when') && s.includes('obtain'))) && s.includes('first job')) return 'time_to_first_job'
  if (s.includes('how') && s.includes('obtain') && s.includes('first job')) return 'first_job_method'
  if (s.includes('first job') && s.includes('since graduating')) return 'is_first_job'
  if (s.includes('challenge') && s.includes('first job')) return 'job_challenges'
  if (s.includes('position') && s.includes('2 year')) return 'position_2yr'
  if (s.includes('position') && s.includes('4 year')) return 'position_4yr'
  if (s.includes('position') && (s.includes('6 year') || (/\b6\b/.test(s) && s.includes('graduation')))) return 'position_6yr'
  if (s.includes('awards') && (s.includes('recognitions') || s.includes('promotions'))) return 'has_awards'
  if (s.includes('research conducted') || s.includes('research') && s.includes('projects')) return 'research_conducted'
  if (s.includes('community') && s.includes('involvement') || s.includes('extensive') && s.includes('involvement')) return 'community_involvement'

  return null
}

// ── Program name normalization ────────────────────────────────────────────

/** Map raw Google Form / Sheets program values to standard short codes */
const PROGRAM_NORM: [RegExp, string][] = [
  [/civil/i, 'BSCE'],
  [/computer/i, 'BSCpE'],
  [/electrical/i, 'BSEE'],
  [/^BSCE$/i, 'BSCE'],
  [/^BSCpE$/i, 'BSCpE'],
  [/^BSEE$/i, 'BSEE'],
  [/^CE$/i, 'BSCE'],
  [/^CpE$/i, 'BSCpE'],
  [/^EE$/i, 'BSEE'],
]

export function normalizeProgram(raw: unknown): string | null {
  if (!raw) return null
  const s = String(raw).trim()
  if (!s) return null
  for (const [pattern, code] of PROGRAM_NORM) {
    if (pattern.test(s)) return code
  }
  return s // keep as-is if no match
}

// ── Boolean field list ───────────────────────────────────────────────────

const BOOLEAN_COLUMNS = new Set([
  'has_honors', 'has_license', 'is_employed', 'has_grad_school', 'is_first_job', 'has_awards'
])

// ── Public mapping functions ─────────────────────────────────────────────

/**
 * Convert a Google Sheets row (with headers) to an alumni DB-compatible object.
 * Uses fuzzy header resolution to handle real Google Form question text.
 */
export function mapSheetRowToAlumni(row: string[], headers?: string[]): Record<string, unknown> {
  if (!headers) return {}

  const result: Record<string, unknown> = {}
  let lastMainColumn: string | null = null

  for (let i = 0; i < headers.length; i++) {
    const column = resolveHeaderColumn(headers[i], lastMainColumn)
    if (!column) continue

    // Track context for "others" resolution (skip follow-up columns)
    if (!column.endsWith('_other') && column !== 'honors_received' &&
        column !== 'awards_received' && column !== 'grad_school_program') {
      lastMainColumn = column
    }

    let value: unknown = row[i] ?? null

    // Type conversions
    if (column === 'year_graduated' && value) {
      value = parseInt(String(value), 10) || null
    }
    if (column === 'program') {
      value = normalizeProgram(value)
    }
    if (column === 'curriculum_relevance' && value) {
      value = parseInt(String(value), 10) || null
    }
    if (BOOLEAN_COLUMNS.has(column)) {
      const strVal = String(value ?? '').trim().toLowerCase()
      if (!strVal || strVal === 'null' || strVal === 'undefined') {
        value = null
      } else {
        value = strVal === 'yes' || strVal === '1' || strVal === 'true' ? 1 : 0
      }
    }
    if (column.startsWith('comp_') && value) {
      value = parseInt(String(value), 10) || null
    }

    // Don't overwrite a non-empty value with null or empty string (handles duplicate columns from Google Forms)
    if ((value === null || value === '') && result[column] != null && result[column] !== '') continue

    result[column] = value
  }

  // Ensure boolean fields default to null if no matching column was found in the sheet.
  // This clears stale data during sync (e.g. CPE has no PRC License column).
  for (const col of BOOLEAN_COLUMNS) {
    if (!(col in result)) result[col] = null
  }

  return result
}

/**
 * Convert an alumni DB row to a Google Sheets row array,
 * ordered to match the given headers (from the real sheet).
 */
export function mapAlumniToSheetRow(
  alumni: Record<string, unknown>,
  headers?: string[]
): string[] {
  if (!headers) {
    headers = Object.keys(HEADER_TO_COLUMN)
  }

  let lastMainColumn: string | null = null

  return headers.map((header) => {
    const column = resolveHeaderColumn(header, lastMainColumn)

    // Track context
    if (column && !column.endsWith('_other') && column !== 'honors_received' &&
        column !== 'awards_received' && column !== 'grad_school_program') {
      lastMainColumn = column
    }

    if (!column) return ''
    const value = alumni[column]
    if (value === null || value === undefined) return ''
    if (BOOLEAN_COLUMNS.has(column)) {
      return Number(value) === 1 ? 'Yes' : 'No'
    }
    return String(value)
  })
}

export { HEADER_TO_COLUMN, COLUMN_TO_HEADER }

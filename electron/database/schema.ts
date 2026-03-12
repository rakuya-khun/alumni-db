import { Database } from 'sql.js'
import { logger } from '../utils/logger'
import {
  SETTINGS_KEYS,
  DEFAULT_SHEETS_ID,
  DEFAULT_SHEETS_KEY,
  DEFAULT_TAB_CE,
  DEFAULT_TAB_CPE,
  DEFAULT_TAB_EE
} from '../config/constants'

/**
 * Create all tables if they don't exist.
 * Called on every startup — safe to run repeatedly.
 */
export function createTables(db: Database): void {
  db.run('BEGIN TRANSACTION')

  try {
    // --- meta table: tracks schema version for migrations ---
    db.run(`
      CREATE TABLE IF NOT EXISTS meta (
        key   TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `)

    // --- settings table: key-value config store ---
    db.run(`
      CREATE TABLE IF NOT EXISTS settings (
        key   TEXT PRIMARY KEY,
        value TEXT
      )
    `)

    // --- alumni table: ~58 columns from questionnaire + system columns ---
    db.run(`
      CREATE TABLE IF NOT EXISTS alumni (
        id                          INTEGER PRIMARY KEY AUTOINCREMENT,

        /* Section II: Respondent Information */
        full_name                   TEXT NOT NULL,
        date_of_birth               TEXT,
        sex                         TEXT,
        sex_other                   TEXT,
        permanent_address           TEXT,
        contact_number              TEXT,
        gmail_address               TEXT,
        facebook_link               TEXT,

        /* Section III: Academic Profile */
        program                     TEXT NOT NULL,
        year_graduated              INTEGER NOT NULL,
        has_honors                  INTEGER,
        honors_received             TEXT,

        /* Section IV: Curriculum & Competencies */
        curriculum_relevance        INTEGER,
        comp_engineering_knowledge  INTEGER,
        comp_problem_solving        INTEGER,
        comp_engineering_design     INTEGER,
        comp_communication          INTEGER,
        comp_teamwork               INTEGER,
        comp_ethics                 INTEGER,
        comp_leadership             INTEGER,
        comp_lifelong_learning      INTEGER,
        comp_modern_tools           INTEGER,
        useful_competencies         TEXT,
        useful_competencies_other   TEXT,
        areas_to_improve            TEXT,

        /* Section V: Licensure & Professional Qualifications */
        has_license                 INTEGER,
        professional_title          TEXT,
        professional_title_other    TEXT,
        license_exam_date           TEXT,
        other_certifications        TEXT,
        has_grad_school             INTEGER,
        grad_school_program         TEXT,
        advanced_study_reason       TEXT,
        advanced_study_reason_other TEXT,
        specialization              TEXT,

        /* Section VI: Employment Data */
        is_employed                 INTEGER,
        unemployment_reason         TEXT,
        unemployment_reason_other   TEXT,
        employment_status           TEXT,
        employment_status_other     TEXT,
        current_position            TEXT,
        job_level                   TEXT,
        company_name                TEXT,
        company_address             TEXT,
        work_region                 TEXT,
        work_region_other           TEXT,
        industry_sector             TEXT,
        industry_sector_other       TEXT,
        job_relevance               TEXT,
        salary_range                TEXT,
        time_to_first_job           TEXT,
        first_job_method            TEXT,
        first_job_method_other      TEXT,
        is_first_job                INTEGER,
        job_challenges              TEXT,
        job_challenges_other        TEXT,

        /* Section V-B: Research & Projects */
        research_conducted          TEXT,

        /* Section VII: Career Progression */
        position_2yr                TEXT,
        position_4yr                TEXT,
        position_6yr                TEXT,
        has_awards                  INTEGER,
        awards_received             TEXT,
        community_involvement       TEXT,

        /* System / Metadata */
        sync_status                 TEXT NOT NULL DEFAULT 'pending',
        created_at                  TEXT NOT NULL DEFAULT (datetime('now')),
        updated_at                  TEXT NOT NULL DEFAULT (datetime('now')),
        synced_at                   TEXT
      )
    `)

    // --- alumni_history table: snapshots on every update ---
    db.run(`
      CREATE TABLE IF NOT EXISTS alumni_history (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        alumni_id       INTEGER NOT NULL,
        snapshot        TEXT NOT NULL,
        changed_fields  TEXT,
        created_at      TEXT NOT NULL DEFAULT (datetime('now')),
        FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
      )
    `)

    // --- email_history table: sent email log ---
    db.run(`
      CREATE TABLE IF NOT EXISTS email_history (
        id              INTEGER PRIMARY KEY AUTOINCREMENT,
        subject         TEXT NOT NULL,
        body            TEXT NOT NULL,
        recipients      TEXT NOT NULL,
        recipient_count INTEGER NOT NULL DEFAULT 0,
        status          TEXT NOT NULL DEFAULT 'pending',
        error_message   TEXT,
        sent_at         TEXT NOT NULL DEFAULT (datetime('now'))
      )
    `)

    // Indexes for common queries
    db.run(`CREATE INDEX IF NOT EXISTS idx_alumni_program ON alumni(program)`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_alumni_year ON alumni(year_graduated)`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_alumni_sync ON alumni(sync_status)`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_alumni_name ON alumni(full_name)`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_history_alumni ON alumni_history(alumni_id)`)
    db.run(`CREATE INDEX IF NOT EXISTS idx_email_status ON email_history(status)`)

    db.run('COMMIT')
    logger.info('schema', 'Tables created/verified')
  } catch (error) {
    db.run('ROLLBACK')
    throw error
  }
}

/**
 * Insert default values into meta/settings if they don't already exist.
 */
export function insertDefaults(db: Database): void {
  // Set schema version if not present
  const version = db.exec("SELECT value FROM meta WHERE key = 'schema_version'")
  if (version.length === 0 || version[0].values.length === 0) {
    db.run("INSERT OR IGNORE INTO meta (key, value) VALUES ('schema_version', '2')")
    logger.info('schema', 'Default schema version set to 2')
  }

  // Seed default Google Sheets settings if not already configured
  const defaults: Record<string, string> = {
    [SETTINGS_KEYS.SHEETS_ID]: DEFAULT_SHEETS_ID,
    [SETTINGS_KEYS.SHEETS_KEY]: DEFAULT_SHEETS_KEY,
    [SETTINGS_KEYS.SHEETS_TAB_CE]: DEFAULT_TAB_CE,
    [SETTINGS_KEYS.SHEETS_TAB_CPE]: DEFAULT_TAB_CPE,
    [SETTINGS_KEYS.SHEETS_TAB_EE]: DEFAULT_TAB_EE
  }
  for (const [key, value] of Object.entries(defaults)) {
    db.run(
      'INSERT OR IGNORE INTO settings (key, value) VALUES (?, ?)',
      [key, value]
    )
  }
  logger.info('schema', 'Default settings seeded')
}

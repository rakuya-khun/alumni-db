# Alumni DB — Database

> **Engine:** sql.js (SQLite compiled to WebAssembly)
> **Storage:** Single `alumni.db` file on disk
> **Protection:** Atomic write-rename pattern for crash safety
> **Accounts:** Stored in Google Sheets "Accounts" tab (not in local DB), with encrypted offline cache

---

## Why sql.js?

| Aspect | Detail |
|--------|--------|
| **What is sql.js?** | SQLite compiled to WebAssembly — runs in pure JS, no native bindings needed |
| **Storage** | Single `alumni.db` file on disk (binary SQLite format) |
| **Load** | `fs.readFileSync('alumni.db')` → `new SQL.Database(buffer)` |
| **Save** | `fs.writeFileSync('alumni.db', db.export())` (atomic write-rename pattern) |
| **Queries** | Full SQL: `SELECT`, `INSERT`, `JOIN`, `GROUP BY`, `WHERE`, transactions |
| **Exe packaging** | Zero friction — pure WASM, no `electron-rebuild`. Ships ~1 MB extra in the bundle. |
| **Performance** | Fast enough for <50K records. ~2–5x slower than native `better-sqlite3` but irrelevant at alumni DB scale. |
| **Upgrade path** | Swap to `better-sqlite3` (same SQL) — only the driver file changes. Or to Postgres for web version. |

---

## Crash Protection — Atomic Write-Rename Pattern

The app must never corrupt the database, even if the process crashes mid-write.

### How It Works

1. Write new data to a `.tmp` file
2. Rename current `.db` to `.bak` (atomic OS operation)
3. Rename `.tmp` to `.db` (atomic OS operation)
4. Delete `.bak`

A crash at **any** step leaves at least one valid copy.

### Implementation

```js
function safeSave(db, dbPath) {
  const data = Buffer.from(db.export());
  const tempPath = dbPath + '.tmp';
  const backupPath = dbPath + '.bak';

  // 1. Write to temp file (if crash here, original is untouched)
  fs.writeFileSync(tempPath, data);
  fs.fsyncSync(fs.openSync(tempPath, 'r'));

  // 2. Current → backup (atomic rename)
  if (fs.existsSync(dbPath)) {
    fs.renameSync(dbPath, backupPath);
  }

  // 3. Temp → current (atomic rename)
  fs.renameSync(tempPath, dbPath);

  // 4. Remove backup
  if (fs.existsSync(backupPath)) {
    fs.unlinkSync(backupPath);
  }
}
```

### Recovery Matrix

| Crash Point | What Happens | Recovery |
|---|---|---|
| During step 1 (writing temp) | `alumni.db` is untouched | Delete `.tmp`, use original |
| During step 2 (rename to backup) | Either old name or new name exists | One of them is your valid DB |
| During step 3 (rename temp → real) | `.bak` has your last good copy | Rename `.bak` back to `.db` |
| During step 4 (delete backup) | Both `.db` and `.bak` exist | Just delete `.bak` next time |

On startup, `db-manager.ts` checks for `.tmp` / `.bak` leftovers and auto-recovers.

---

## Accounts — Google Sheets "Accounts" Tab

User accounts are **NOT** stored in the local sql.js database. They are stored in a dedicated **"Accounts" tab** within the same Google Sheets spreadsheet used for alumni data synchronization.

### Why Sheets Instead of Local DB?

| Reason | Explanation |
|--------|-------------|
| **Centralized management** | Dean can manage accounts from any device with spreadsheet access |
| **First-time security** | Initial account is manually added to the spreadsheet — no self-registration vector |
| **Shared across devices** | If the app is installed on multiple machines, all share the same account list |
| **Easy auditing** | Account activity is visible directly in the spreadsheet |

### Accounts Tab Columns

| Column | Type | Description |
|--------|------|-------------|
| `username` | Text | Unique login identifier |
| `password` | Text | Hashed password (bcrypt) |
| `role` | Text | `dean`, `ce_chair`, `cpe_chair`, `ee_chair` |
| `full_name` | Text | Display name |
| `is_active` | Boolean | `TRUE` = can log in, `FALSE` = deactivated |
| `created_at` | Text | ISO 8601 timestamp |
| `last_login` | Text | ISO 8601 — updated on each successful login |

### Encrypted Offline Cache

For offline login fallback, the system caches account records locally at `{userData}/auth-cache.enc`:

- **Encryption:** AES-256-GCM via `electron/utils/crypto.ts`
- **Contents:** Array of `CachedAccount` objects (username, password hash, role, full_name, is_active)
- **Updated:** On every successful online login, the cache is refreshed with latest Sheets data
- **First login:** Must be done online — no cached data exists until the first successful auth

---

## Database Schema

The `alumni` table stores all questionnaire fields. See [data-dictionary.md](data-dictionary.md) for the complete field-by-field mapping from questionnaire → DB columns.

### Tables

#### `alumni` — Main alumni records (~58 columns)

```sql
CREATE TABLE IF NOT EXISTS alumni (
  id                        INTEGER PRIMARY KEY AUTOINCREMENT,

  -- Section II: Respondent Information
  full_name                 TEXT NOT NULL,
  date_of_birth             TEXT,
  sex                       TEXT,
  sex_other                 TEXT,
  permanent_address         TEXT,
  contact_number            TEXT,
  gmail_address             TEXT,
  facebook_link             TEXT,

  -- Section III: Academic Profile
  program                   TEXT NOT NULL,       -- BSCE, BSCpE, BSEE
  year_graduated            INTEGER NOT NULL,
  has_honors                INTEGER DEFAULT 0,
  honors_received           TEXT,

  -- Section IV: Curriculum Relevance & Competencies
  curriculum_relevance      INTEGER,             -- 1–5
  comp_engineering_knowledge INTEGER,
  comp_problem_solving      INTEGER,
  comp_engineering_design   INTEGER,
  comp_communication        INTEGER,
  comp_teamwork             INTEGER,
  comp_ethics               INTEGER,
  comp_leadership           INTEGER,
  comp_lifelong_learning    INTEGER,
  comp_modern_tools         INTEGER,
  useful_competencies       TEXT,                -- JSON array
  useful_competencies_other TEXT,
  areas_to_improve          TEXT,

  -- Section V: Licensure & Professional Qualifications
  has_license               INTEGER DEFAULT 0,
  professional_title        TEXT,
  professional_title_other  TEXT,
  license_exam_date         TEXT,
  other_certifications      TEXT,
  has_grad_school           INTEGER DEFAULT 0,
  grad_school_program       TEXT,
  advanced_study_reason     TEXT,                -- JSON array
  advanced_study_reason_other TEXT,
  specialization            TEXT,

  -- Section VI: Employment Data
  is_employed               INTEGER,
  unemployment_reason       TEXT,                -- JSON array
  unemployment_reason_other TEXT,
  employment_status         TEXT,
  employment_status_other   TEXT,
  current_position          TEXT,
  job_level                 TEXT,
  company_name              TEXT,
  company_address           TEXT,
  work_region               TEXT,
  work_region_other         TEXT,
  industry_sector           TEXT,
  industry_sector_other     TEXT,
  job_relevance             TEXT,
  salary_range              TEXT,
  time_to_first_job         TEXT,
  first_job_method          TEXT,
  first_job_method_other    TEXT,
  is_first_job              INTEGER,             -- EE only
  job_challenges            TEXT,                -- JSON array
  job_challenges_other      TEXT,

  -- Section VII: Career Progression
  position_2yr              TEXT,
  position_4yr              TEXT,
  position_6yr              TEXT,
  has_awards                INTEGER DEFAULT 0,
  awards_received           TEXT,

  -- System / Metadata
  sync_status               TEXT DEFAULT 'pending',  -- pending | synced | conflict
  created_at                TEXT,                     -- ISO 8601
  updated_at                TEXT,                     -- ISO 8601
  synced_at                 TEXT                      -- ISO 8601
);
```

#### `alumni_history` — Versioned snapshots for profiling

```sql
CREATE TABLE IF NOT EXISTS alumni_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  alumni_id       INTEGER NOT NULL,
  snapshot        TEXT NOT NULL,          -- Full JSON snapshot of alumni record at time of update
  changed_fields  TEXT,                   -- JSON array of field names that changed
  updated_at      TEXT NOT NULL,          -- ISO 8601 timestamp
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
);
```

#### `email_history` — Email send log

```sql
CREATE TABLE IF NOT EXISTS email_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  subject         TEXT NOT NULL,
  body            TEXT NOT NULL,
  recipient_count INTEGER NOT NULL,
  recipients      TEXT,                   -- JSON array of gmail addresses
  status          TEXT DEFAULT 'pending', -- pending | completed | failed
  error_message   TEXT,
  sent_at         TEXT                    -- ISO 8601
);
```

#### `settings` — Key-value configuration

```sql
CREATE TABLE IF NOT EXISTS settings (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL
);
```

Settings keys: `institution_name`, `smtp_host`, `smtp_port`, `smtp_user`, `smtp_pass` (encrypted), `smtp_tls`, `sheets_id`, `sheets_key`, `sheets_name`, `gform_link`, `auto_sync_enabled`, `auto_sync_interval`, `dark_mode`

#### `meta` — Migration tracking

```sql
CREATE TABLE IF NOT EXISTS meta (
  key             TEXT PRIMARY KEY,
  value           TEXT NOT NULL
);
```

Used by the migration runner to track the current schema version.

---

## Key SQL Patterns

### Role-Based Filtering (all repositories)

```sql
-- All data queries apply role-based program filter
-- Dean: no filter (all programs)
-- Chairperson: filtered to own program
SELECT * FROM alumni WHERE program IN (?, ?, ?);    -- Dean: ('BSCE', 'BSCpE', 'BSEE')
SELECT * FROM alumni WHERE program = ?;              -- Chairperson: ('BSCE')
```

### Dashboard Aggregation (analytics.repository.ts)

```sql
-- Total responses per program (role-filtered)
SELECT program, COUNT(*) as count FROM alumni
WHERE program IN (?)
GROUP BY program;

-- % Board passers (role-filtered)
SELECT
  COUNT(CASE WHEN has_license = 1 THEN 1 END) as passers,
  COUNT(*) as total
FROM alumni
WHERE program IN (?);

-- Competency weighted mean (role-filtered)
SELECT
  ROUND(AVG(comp_engineering_knowledge), 2) as engineering_knowledge,
  ROUND(AVG(comp_problem_solving), 2) as problem_solving,
  ROUND(AVG(comp_engineering_design), 2) as engineering_design,
  ROUND(AVG(comp_communication), 2) as communication,
  ROUND(AVG(comp_teamwork), 2) as teamwork,
  ROUND(AVG(comp_ethics), 2) as ethics,
  ROUND(AVG(comp_leadership), 2) as leadership,
  ROUND(AVG(comp_lifelong_learning), 2) as lifelong_learning,
  ROUND(AVG(comp_modern_tools), 2) as modern_tools
FROM alumni
WHERE program IN (?);

-- Frequency distribution for a column (role-filtered)
SELECT curriculum_relevance as value, COUNT(*) as frequency
FROM alumni
WHERE curriculum_relevance IS NOT NULL AND program IN (?)
GROUP BY curriculum_relevance
ORDER BY curriculum_relevance;
```

### Alumni History Snapshot (alumni-history.repository.ts)

```sql
-- Insert snapshot on every alumni update
INSERT INTO alumni_history (alumni_id, snapshot, changed_fields, updated_at)
VALUES (?, ?, ?, ?);

-- Get history for profiling timeline
SELECT * FROM alumni_history
WHERE alumni_id = ?
ORDER BY updated_at DESC;
```

### Pending Sync Check (sync-queue.repository.ts)

```sql
-- Get pending records count
SELECT COUNT(*) as pending_count FROM alumni WHERE sync_status = 'pending';

-- Get all pending records for push
SELECT * FROM alumni WHERE sync_status = 'pending';

-- Mark as synced
UPDATE alumni SET sync_status = 'synced', synced_at = ? WHERE id = ?;
```

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [data-dictionary.md](data-dictionary.md) | Complete questionnaire → DB column mapping |
| [architecture.md](architecture.md) | Repository pattern, service layer, how DB fits in |
| [features/login.md](features/login.md) | Accounts Sheet structure, offline cache |
| [features/dashboard.md](features/dashboard.md) | Dashboard analytics queries |
| [features/sync.md](features/sync.md) | Sync engine and conflict detection |

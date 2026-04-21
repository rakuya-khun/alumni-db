# Alumni DB — Detailed ERD (Per-Entity)

> **Scope:** Column-level ERD for every entity in the system, organized by section.
> **Companion doc:** [erd-overview.md](erd-overview.md) — system-wide overview ERD.
> **Source of truth:** [`electron/database/schema.ts`](../../electron/database/schema.ts).

> **Notation:**
> - `PK` = primary key, `FK` = foreign key, `UK` = logical unique key (not always enforced)
> - `NN` = NOT NULL, `D` = has DEFAULT
> - Bracketed text after type = constraint or note
> - Mermaid `erDiagram` does not render CHECK constraints — listed in tables below each diagram

---

## Table of Contents

1. [`alumni`](#1-alumni-main-respondent-record) — main respondent record
2. [`alumni_history`](#2-alumni_history--versioned-snapshots) — versioned snapshots
3. [`email_history`](#3-email_history--bulk-send-log) — bulk send log
4. [`settings`](#4-settings--keyvalue-config) — key/value config
5. [`meta`](#5-meta--migration-tracking) — migration tracking
6. [Google Sheets `Accounts` tab](#6-external-google-sheets-accounts-tab) — external auth source
7. [Google Sheets program tabs](#7-external-google-sheets-program-tabs-ce--cpe--ee) — CE / CpE / EE
8. [`auth-cache.enc`](#8-external-auth-cacheenc--offline-auth-fallback) — offline auth fallback

---

## 1. `alumni` — Main Respondent Record

The widest table in the system: ~58 columns across 6 questionnaire sections + 5 system columns. Every record represents one survey response from one graduate (year ≥ 2018) of one program.

### 1.1 ERD — Section II: Respondent Information

```mermaid
erDiagram
    ALUMNI_RESPONDENT_INFO {
        INTEGER id PK "AUTOINCREMENT"
        TEXT full_name "NN, sync key"
        TEXT date_of_birth "MM/DD/YYYY"
        TEXT sex "Male|Female|Prefer not to say|Others"
        TEXT sex_other "conditional on sex='Others'"
        TEXT permanent_address
        TEXT contact_number
        TEXT gmail_address "used as email recipient"
        TEXT facebook_link
    }
```

### 1.2 ERD — Section III: Academic Profile

```mermaid
erDiagram
    ALUMNI_ACADEMIC {
        TEXT program "NN, BSCE|BSCpE|BSEE, sync key"
        INTEGER year_graduated "NN, >=2018, sync key"
        INTEGER has_honors "0|1"
        TEXT honors_received "conditional on has_honors=1"
    }
```

### 1.3 ERD — Section IV: Curriculum & Competencies

```mermaid
erDiagram
    ALUMNI_COMPETENCIES {
        INTEGER curriculum_relevance "1-5 Likert"
        INTEGER comp_engineering_knowledge "1-5"
        INTEGER comp_problem_solving "1-5"
        INTEGER comp_engineering_design "1-5"
        INTEGER comp_communication "1-5"
        INTEGER comp_teamwork "1-5"
        INTEGER comp_ethics "1-5"
        INTEGER comp_leadership "1-5"
        INTEGER comp_lifelong_learning "1-5"
        INTEGER comp_modern_tools "1-5"
        TEXT useful_competencies "JSON array"
        TEXT useful_competencies_other "conditional"
        TEXT areas_to_improve "free-form"
    }
```

### 1.4 ERD — Section V: Licensure & Graduate School

```mermaid
erDiagram
    ALUMNI_LICENSURE {
        INTEGER has_license "0|1"
        TEXT professional_title "program-specific options"
        TEXT professional_title_other "conditional"
        TEXT license_exam_date "e.g. April 2025"
        TEXT other_certifications "free-form"
        INTEGER has_grad_school "0|1"
        TEXT grad_school_program "conditional"
        TEXT advanced_study_reason "JSON array"
        TEXT advanced_study_reason_other "conditional"
        TEXT specialization "program-specific, conditional"
    }
```

### 1.5 ERD — Section VI: Employment Data

```mermaid
erDiagram
    ALUMNI_EMPLOYMENT {
        INTEGER is_employed "0|1"
        TEXT unemployment_reason "JSON array, conditional"
        TEXT unemployment_reason_other "conditional"
        TEXT employment_status "Regular|Temporary|Casual|Contractual|Self-Employed|Others"
        TEXT employment_status_other "conditional"
        TEXT current_position
        TEXT job_level "program-specific format"
        TEXT company_name
        TEXT company_address
        TEXT work_region "NCR|CAR|Region I-XIII|BARMM|Others"
        TEXT work_region_other "conditional"
        TEXT industry_sector "program-specific options"
        TEXT industry_sector_other "conditional"
        TEXT job_relevance "Highly|Moderately|Slightly|Not related"
        TEXT salary_range "5 bands"
        TEXT time_to_first_job "7 ranges"
        TEXT first_job_method "8 methods"
        TEXT first_job_method_other "conditional"
        INTEGER is_first_job "0|1, EE only"
        TEXT job_challenges "JSON array"
        TEXT job_challenges_other "conditional"
    }
```

### 1.6 ERD — Section VII: Career Progression + System Columns

```mermaid
erDiagram
    ALUMNI_CAREER_AND_SYSTEM {
        TEXT research_conducted "Section V-B"
        TEXT position_2yr
        TEXT position_4yr
        TEXT position_6yr
        INTEGER has_awards "0|1"
        TEXT awards_received "conditional"
        TEXT community_involvement
        TEXT sync_status "NN, D='pending', pending|synced|conflict"
        TEXT created_at "NN, D=datetime('now')"
        TEXT updated_at "NN, D=datetime('now')"
        TEXT synced_at "set on successful sync"
    }
```

### 1.7 Constraints & Application-Level Rules

| Rule | Layer | Enforcement |
|------|-------|-------------|
| `id` is auto-increment surrogate | SQL | `INTEGER PRIMARY KEY AUTOINCREMENT` |
| `full_name` required | SQL + Zod | `NOT NULL` + Zod `.min(1)` |
| `program ∈ {BSCE, BSCpE, BSEE}` | Zod / Service | Stored as free `TEXT` for sync flexibility |
| `year_graduated >= 2018` | Zod / Service | Tracer-study window |
| Composite sync key | Service | `full_name` + `program` + `year_graduated` (uniqueness logical, not enforced by SQL) |
| Likert columns are 1–5 | Zod | DB allows NULL for unanswered items |
| `sync_status` defaults to `pending` on every insert and on every local UPDATE | Repository | Set to `synced` only by sync engine |
| `updated_at` refreshed on every UPDATE | Repository | Application sets value; not a SQL trigger |
| Snapshot inserted into `alumni_history` BEFORE applying UPDATE | Repository | See [§2](#2-alumni_history--versioned-snapshots) |

> Total columns including system metadata: see [data-dictionary.md](data-dictionary.md#complete-column-count-summary).

---

## 2. `alumni_history` — Versioned Snapshots

Append-only audit table. Every UPDATE on `alumni` inserts the *prior* state here before the change is applied — used to drive the Profiling page Timeline tab.

```mermaid
erDiagram
    ALUMNI ||--o{ ALUMNI_HISTORY : "ON DELETE CASCADE"

    ALUMNI {
        INTEGER id PK
        TEXT full_name
        TEXT program
        INTEGER year_graduated
    }

    ALUMNI_HISTORY {
        INTEGER id PK "AUTOINCREMENT"
        INTEGER alumni_id FK "NN, REFERENCES alumni(id) ON DELETE CASCADE"
        TEXT snapshot "NN, JSON of full pre-update record"
        TEXT changed_fields "JSON array of column names that changed"
        TEXT created_at "NN, D=datetime('now')"
    }
```

### 2.1 Rules

| Rule | Detail |
|------|--------|
| **Insertion path** | Repository writes a snapshot inside the same transaction as the UPDATE. |
| **No SQL trigger** | Snapshot logic lives in `alumni-history.repository.ts` to keep `changed_fields` accurate. |
| **Cascade behavior** | Deleting an alumni record cascades to all their history rows. (Hard deletes are rare — typically only Dean role.) |
| **Index** | `idx_history_alumni (alumni_id)` for timeline lookups. |
| **Format of `snapshot`** | JSON string mirroring the `alumni` row at the time of UPDATE — not a structured table, to insulate history from schema evolution. |
| **Format of `changed_fields`** | JSON array of column names, e.g. `["current_position","salary_range"]`. |

---

## 3. `email_history` — Bulk Send Log

Standalone table — no SQL FK to `alumni`. Recipients are stored as a JSON array of `gmail_address` strings (the logical link).

```mermaid
erDiagram
    EMAIL_HISTORY }o..o{ ALUMNI : "recipients[] -> gmail_address (logical)"

    EMAIL_HISTORY {
        INTEGER id PK "AUTOINCREMENT"
        TEXT subject "NN"
        TEXT body "NN"
        TEXT recipients "NN, JSON array of gmail addresses"
        INTEGER recipient_count "NN, D=0"
        TEXT status "NN, D='pending', pending|completed|failed"
        TEXT error_message "set when status='failed'"
        TEXT sent_at "NN, D=datetime('now')"
    }

    ALUMNI {
        INTEGER id PK
        TEXT gmail_address "logical join target"
    }
```

### 3.1 Rules

| Rule | Detail |
|------|--------|
| **Why no FK?** | An email batch may target alumni who have since been deleted; we want the history to survive. JSON array preserves intent without breaking on deletes. |
| **Status transitions** | `pending → completed` on full success, `pending → failed` on SMTP error. Partial failures: status `failed` with `error_message` describing per-recipient failures. |
| **`recipient_count` denormalization** | Cached count avoids JSON parsing for list views. |
| **Index** | `idx_email_status (status)` for filtering on the History page. |

---

## 4. `settings` — Key/Value Config

Flat key/value store. Encryption is per-key, not per-row.

```mermaid
erDiagram
    SETTINGS {
        TEXT key PK "NN"
        TEXT value "may be AES-256-GCM encrypted"
    }
```

### 4.1 Known Keys

| Key | Encrypted? | Default | Purpose |
|-----|-----------|---------|---------|
| `institution_name` | No | `"SLSU College of Engineering"` | Header on reports |
| `smtp_host` | No | unset | Outbound SMTP server |
| `smtp_port` | No | `587` | SMTP port |
| `smtp_user` | No | unset | SMTP username |
| `smtp_pass` | **Yes** | unset | SMTP password (AES-256-GCM) |
| `smtp_tls` | No | `true` | TLS on/off |
| `sheets_id` | No | seeded from constants | Google Sheets workbook ID |
| `sheets_key` | **Yes** | seeded encrypted | Service account JSON (AES-256-GCM) |
| `sheets_tab_ce` | No | `"CE"` | Tab name for Civil Engineering |
| `sheets_tab_cpe` | No | `"CpE"` | Tab name for Computer Engineering |
| `sheets_tab_ee` | No | `"EE"` | Tab name for Electrical Engineering |
| `gform_link` | No | unset | URL printed on outreach emails |
| `auto_sync_enabled` | No | `false` | Toggle for periodic sync |
| `auto_sync_interval` | No | unset | Minutes between auto-syncs |
| `dark_mode` | No | unset | UI preference |

### 4.2 Rules

| Rule | Detail |
|------|--------|
| **Defaults seeded once** | `INSERT OR IGNORE` on startup via `insertDefaults()` in `schema.ts`. |
| **Encryption boundary** | Encryption happens in the repository before writing, decryption on read — never on the SQL side. |
| **All callers go through `settings.repository.ts`** | No service or IPC handler reads `settings` directly via `getDb().exec(...)`. |

---

## 5. `meta` — Migration Tracking

Reserved key/value table used by `runMigrations()` to determine which schema migrations to apply.

```mermaid
erDiagram
    META {
        TEXT key PK "NN"
        TEXT value "NN"
    }
```

### 5.1 Known Keys

| Key | Value | Purpose |
|-----|-------|---------|
| `schema_version` | Integer as string (currently `"4"`) | Compared against highest migration in `electron/database/migrations/` |

### 5.2 Rules

| Rule | Detail |
|------|--------|
| **Upgrade path** | When a new migration is added, bump `schema_version` inside the migration's `up()` function. |
| **Downgrade** | Not supported — migrations are forward-only. |
| **Boot sequence** | `createTables()` → `insertDefaults()` (seeds `schema_version`) → `runMigrations()` (advances it) → `safeSave()`. |

---

## 6. External: Google Sheets `Accounts` Tab

Authoritative source for user accounts. **Not a local SQL table** — managed by the Dean directly in the spreadsheet.

```mermaid
erDiagram
    SHEETS_ACCOUNTS_TAB ||--o| AUTH_CACHE_FILE : "encrypted snapshot per successful login"

    SHEETS_ACCOUNTS_TAB {
        TEXT username PK "logical PK"
        TEXT password "bcrypt hash"
        TEXT role "dean|ce_chair|cpe_chair|ee_chair"
        TEXT full_name
        TEXT is_active "TRUE|FALSE"
        TEXT created_at "ISO 8601"
        TEXT last_login "ISO 8601, updated on each login"
    }

    AUTH_CACHE_FILE {
        TEXT username
        TEXT password_hash
        TEXT role
        TEXT full_name
        TEXT is_active
    }
```

### 6.1 Rules

| Rule | Detail |
|------|--------|
| **Why Sheets?** | Centralized management; first account seeded manually (no self-registration). |
| **Hashing** | `bcryptjs` salt rounds = 10. Never stored in plaintext. |
| **Lockout** | 3 failed logins → 5-minute client-side lockout (state lives in renderer auth store, not in Sheets). |
| **Role → program mapping** | `dean` ⇒ `[BSCE, BSCpE, BSEE]`, `ce_chair` ⇒ `[BSCE]`, `cpe_chair` ⇒ `[BSCpE]`, `ee_chair` ⇒ `[BSEE]`. Used for `WHERE program IN (?)` scoping. |
| **`last_login` write** | Sheets API write on each successful online login. |

---

## 7. External: Google Sheets Program Tabs (CE / CpE / EE)

Three tabs (one per program) mirror the `alumni` table's questionnaire columns. Synced bidirectionally with the local DB.

```mermaid
erDiagram
    ALUMNI ||--o| SHEETS_PROGRAM_TAB : "composite key match"

    ALUMNI {
        INTEGER id PK
        TEXT full_name "sync key"
        TEXT program "sync key"
        INTEGER year_graduated "sync key"
        TEXT sync_status "pending|synced|conflict"
        TEXT synced_at
    }

    SHEETS_PROGRAM_TAB {
        TEXT timestamp "Form submit time -> alumni.created_at on pull"
        TEXT full_name "sync key"
        INTEGER year_graduated "sync key"
        TEXT all_other_columns "mirror of alumni questionnaire columns"
    }
```

### 7.1 Sync Rules

| Rule | Detail |
|------|--------|
| **Composite match key** | `full_name` + `program` (implicit per tab) + `year_graduated`. |
| **Pull** | Sheets → DB. New rows: `sync_status='synced'`, `created_at=Timestamp`, `synced_at=now()`. Existing rows updated only if Sheets row is newer. |
| **Push** | DB → Sheets. Only rows where `sync_status='pending'`. On success: `sync_status='synced'`, `synced_at=now()`. |
| **Conflict** | If both sides changed since last sync, mark local row `sync_status='conflict'` and surface in the Sync UI for manual resolution. |
| **Tab routing** | `program` column on the alumni record determines which tab is targeted (`sheets_tab_ce` / `sheets_tab_cpe` / `sheets_tab_ee` from `settings`). |

---

## 8. External: `auth-cache.enc` — Offline Auth Fallback

A single file at `{userData}/auth-cache.enc` holding an AES-256-GCM-encrypted JSON array of `CachedAccount` objects.

```mermaid
erDiagram
    AUTH_CACHE_FILE {
        TEXT username PK "decrypted in-memory only"
        TEXT password_hash "bcrypt"
        TEXT role
        TEXT full_name
        TEXT is_active
    }
```

### 8.1 Rules

| Rule | Detail |
|------|--------|
| **Refresh trigger** | Every successful **online** login overwrites the file with the latest `Accounts` tab contents. |
| **First-run requirement** | The very first login must be online — no cache exists yet. |
| **Decryption** | Loaded into memory only when the network is unavailable; never persisted decrypted. |
| **Eviction** | Manual — user can wipe via Settings → "Clear offline cache". |

---

## 9. Quick-Reference: Where Each Field Lives

| Domain | Local SQL | Google Sheets | Encrypted File |
|--------|-----------|---------------|----------------|
| Alumni questionnaire data | `alumni`, `alumni_history` | `CE`, `CpE`, `EE` tabs | — |
| User accounts | — | `Accounts` tab | `auth-cache.enc` (mirror) |
| Email send log | `email_history` | — | — |
| App configuration | `settings` (some keys encrypted) | — | — |
| Schema version | `meta` | — | — |

---

## 10. Companion Reading

- **[erd-overview.md](erd-overview.md)** — high-level system ERD with all tiers.
- **[database.md](database.md)** — full DDL, crash protection, key SQL queries.
- **[data-dictionary.md](data-dictionary.md)** — questionnaire-by-questionnaire field map (~58 columns).
- **[architecture.md](architecture.md)** — repository / service / IPC layering.

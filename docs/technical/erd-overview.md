# Alumni DB — ERD Overview

> **Scope:** End-to-end Entity-Relationship Diagram of the Alumni DB Management System.
> **Engine:** sql.js (SQLite WASM) — single `alumni.db` file.
> **Companion doc:** [erd-detailed.md](erd-detailed.md) — per-entity column-level ERDs.
> **Source of truth:** [`electron/database/schema.ts`](../../electron/database/schema.ts), [`database.md`](database.md), [`data-dictionary.md`](data-dictionary.md).

---

## 1. System Data Landscape

The system spans **three storage tiers**, only one of which is a relational database:

| Tier | Store | Contents | Owner |
|------|-------|----------|-------|
| **Local SQL** | `alumni.db` (sql.js) | 5 tables: `alumni`, `alumni_history`, `email_history`, `settings`, `meta` | Electron main process |
| **Remote Sheets** | Google Sheets workbook | 4 tabs: `CE`, `CpE`, `EE`, `Accounts` | Google API v4 |
| **Encrypted Cache** | `{userData}/auth-cache.enc` | AES-256-GCM blob of `Accounts` snapshot | Offline auth fallback |

The ERD below covers **all three tiers** so the relationships across them are explicit.

---

## 2. High-Level ERD (All Entities)

```mermaid
erDiagram
    ALUMNI ||--o{ ALUMNI_HISTORY : "snapshots on UPDATE"
    ALUMNI }o--|| SHEETS_PROGRAM_TAB : "syncs via composite key"
    ALUMNI }o..o{ EMAIL_HISTORY : "recipients[] (logical, JSON)"
    SHEETS_ACCOUNTS_TAB ||--o{ AUTH_CACHE_FILE : "encrypted snapshot"
    SETTINGS ||..|| SHEETS_PROGRAM_TAB : "stores sheets_id, sheets_key"
    SETTINGS ||..|| SHEETS_ACCOUNTS_TAB : "stores sheets_id, sheets_key"
    META ||..|| ALUMNI : "tracks schema_version"

    ALUMNI {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        TEXT full_name "NN, Q1, composite sync key"
        TEXT date_of_birth "Q2, MM/DD/YYYY"
        TEXT sex "Q3, Male|Female|Prefer not to say|Others"
        TEXT sex_other "Q3a, conditional on sex='Others'"
        TEXT permanent_address "Q4"
        TEXT contact_number "Q5"
        TEXT gmail_address "Q6, recipient address for bulk emails"
        TEXT facebook_link "Q7"
        TEXT program "NN, Q8, BSCE|BSCpE|BSEE, sync key, role-scope key"
        INTEGER year_graduated "NN, Q9, >=2018, composite sync key"
        INTEGER has_honors "Q10, 0|1"
        TEXT honors_received "Q11, conditional on has_honors=1"
        INTEGER curriculum_relevance "Q12, Likert 1-5"
        INTEGER comp_engineering_knowledge "Q13a, Likert 1-5"
        INTEGER comp_problem_solving "Q13b, Likert 1-5"
        INTEGER comp_engineering_design "Q13c, Likert 1-5"
        INTEGER comp_communication "Q13d, Likert 1-5"
        INTEGER comp_teamwork "Q13e, Likert 1-5"
        INTEGER comp_ethics "Q13f, Likert 1-5"
        INTEGER comp_leadership "Q13g, Likert 1-5"
        INTEGER comp_lifelong_learning "Q13h, Likert 1-5"
        INTEGER comp_modern_tools "Q13i, Likert 1-5"
        TEXT useful_competencies "Q14, JSON array (multi-select)"
        TEXT useful_competencies_other "Q14a, conditional"
        TEXT areas_to_improve "Q15, free-form long text"
        INTEGER has_license "Q16, 0|1, drives % Board Passers KPI"
        TEXT professional_title "Q17, program-specific options"
        TEXT professional_title_other "Q17a, conditional"
        TEXT license_exam_date "Q18, e.g. 'April 2025'"
        TEXT other_certifications "Q19, free-form (TESDA, PMP, etc.)"
        INTEGER has_grad_school "Q20, 0|1"
        TEXT grad_school_program "Q21, conditional on has_grad_school=1"
        TEXT advanced_study_reason "Q22, JSON array (multi-select)"
        TEXT advanced_study_reason_other "Q22a, conditional"
        TEXT specialization "Q23, program-specific, conditional"
        INTEGER is_employed "Q24, 0|1, drives % Employed KPI"
        TEXT unemployment_reason "Q25, JSON array, conditional on is_employed=0"
        TEXT unemployment_reason_other "Q25a, conditional"
        TEXT employment_status "Q26, Regular|Temporary|Casual|Contractual|Self-Employed|Others"
        TEXT employment_status_other "Q26a, conditional"
        TEXT current_position "Q27, no abbreviations"
        TEXT job_level "Q28, program-specific format, drives Supervisory KPI"
        TEXT company_name "Q29, no abbreviations"
        TEXT company_address "Q30"
        TEXT work_region "Q31, NCR|CAR|Region I-XIII|BARMM|Others"
        TEXT work_region_other "Q31a, for international assignments"
        TEXT industry_sector "Q32, program-specific options"
        TEXT industry_sector_other "Q32a, conditional"
        TEXT job_relevance "Q33, drives % Field-Related KPI"
        TEXT salary_range "Q34, 5 bands (Below P15K to Above P50K)"
        TEXT time_to_first_job "Q35, 7 ranges (Immediately to >1 year)"
        TEXT first_job_method "Q36, 8 methods (portal, referral, etc.)"
        TEXT first_job_method_other "Q36a, conditional"
        INTEGER is_first_job "Q37, EE only, 0|1"
        TEXT job_challenges "Q37/38, JSON array (multi-select)"
        TEXT job_challenges_other "Q37a/38a, conditional"
        TEXT research_conducted "Section V-B, free-form"
        TEXT position_2yr "Q38/39, position 2 yrs after graduation"
        TEXT position_4yr "Q39/40, position 4 yrs after graduation"
        TEXT position_6yr "Q40/41, position 6 yrs after graduation"
        INTEGER has_awards "Q41/42, 0|1"
        TEXT awards_received "Q42/43, conditional on has_awards=1"
        TEXT community_involvement "free-form"
        TEXT sync_status "NN, D='pending', pending|synced|conflict"
        TEXT created_at "NN, D=datetime('now'), ISO 8601"
        TEXT updated_at "NN, D=datetime('now'), refreshed on each UPDATE"
        TEXT synced_at "set by sync engine on successful push/pull"
    }

    ALUMNI_HISTORY {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        INTEGER alumni_id FK "NN, REFERENCES alumni(id) ON DELETE CASCADE"
        TEXT snapshot "NN, JSON of full pre-update alumni row"
        TEXT changed_fields "JSON array of column names that changed"
        TEXT created_at "NN, D=datetime('now'), snapshot timestamp"
    }

    EMAIL_HISTORY {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        TEXT subject "NN, email subject line"
        TEXT body "NN, rendered HTML/text body"
        TEXT recipients "NN, JSON array of gmail_address values"
        INTEGER recipient_count "NN, D=0, denormalized count for list views"
        TEXT status "NN, D='pending', pending|completed|failed"
        TEXT error_message "set when status='failed', SMTP error detail"
        TEXT sent_at "NN, D=datetime('now'), batch send timestamp"
    }

    SETTINGS {
        TEXT key PK "NN, e.g. smtp_host, sheets_id, dark_mode"
        TEXT value "encrypted (AES-256-GCM) for smtp_pass and sheets_key"
    }

    META {
        TEXT key PK "NN, reserved key (currently only schema_version)"
        TEXT value "NN, e.g. '4' for schema_version"
    }

    SHEETS_PROGRAM_TAB {
        TEXT timestamp "Form submit time, mapped to alumni.created_at on pull"
        TEXT full_name "composite sync key"
        TEXT program "implicit per tab (CE / CpE / EE)"
        INTEGER year_graduated "composite sync key, >=2018"
        TEXT all_questionnaire_columns "mirrors all alumni questionnaire columns"
    }

    SHEETS_ACCOUNTS_TAB {
        TEXT username PK "logical PK, unique login identifier"
        TEXT password "NN, bcrypt hash (salt rounds 10)"
        TEXT role "NN, dean|ce_chair|cpe_chair|ee_chair"
        TEXT full_name "NN, display name shown in TopBar"
        TEXT is_active "NN, TRUE|FALSE, FALSE blocks login"
        TEXT created_at "ISO 8601, account creation timestamp"
        TEXT last_login "ISO 8601, updated on each successful login"
    }

    AUTH_CACHE_FILE {
        TEXT username PK "logical PK inside AES-256-GCM encrypted blob"
        TEXT password_hash "bcrypt hash mirrored from Sheets"
        TEXT role "mirrored role string"
        TEXT full_name "mirrored display name"
        TEXT is_active "mirrored active flag"
    }
```

---

## 3. Local DB Only (Simplified)

For day-to-day work inside the SQL layer, ignore the external entities:

```mermaid
erDiagram
    ALUMNI ||--o{ ALUMNI_HISTORY : "1 alumni : N snapshots"
    ALUMNI {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        TEXT full_name "NN, composite sync key"
        TEXT program "NN, BSCE|BSCpE|BSEE, role-scope key"
        INTEGER year_graduated "NN, >=2018, composite sync key"
        TEXT sync_status "NN, D='pending', pending|synced|conflict"
        TEXT created_at "NN, D=datetime('now')"
        TEXT updated_at "NN, D=datetime('now')"
        TEXT synced_at "set by sync engine"
    }
    ALUMNI_HISTORY {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        INTEGER alumni_id FK "NN, REFERENCES alumni(id) ON DELETE CASCADE"
        TEXT snapshot "NN, JSON of pre-update row"
        TEXT changed_fields "JSON array of changed column names"
        TEXT created_at "NN, D=datetime('now')"
    }
    EMAIL_HISTORY {
        INTEGER id PK "AUTOINCREMENT surrogate key"
        TEXT subject "NN"
        TEXT recipients "NN, JSON array of gmail addresses"
        INTEGER recipient_count "NN, D=0"
        TEXT status "NN, D='pending'"
        TEXT sent_at "NN, D=datetime('now')"
    }
    SETTINGS {
        TEXT key PK "NN"
        TEXT value "encrypted for smtp_pass, sheets_key"
    }
    META {
        TEXT key PK "NN"
        TEXT value "NN, e.g. schema_version='4'"
    }
```

> Only `alumni → alumni_history` has a hard FK. All other tables are independent — `email_history`, `settings`, and `meta` are standalone.

---

## 4. Relationship Catalog

| # | From | To | Type | Enforcement | Purpose |
|---|------|----|------|-------------|---------|
| R1 | `alumni.id` | `alumni_history.alumni_id` | 1 : N | **Hard FK** (`ON DELETE CASCADE`) | Versioned audit trail; populated by repository on every UPDATE |
| R2 | `alumni` (composite key) | `SHEETS_PROGRAM_TAB` row | 1 : 1 | **Logical** (sync engine) | Match key = `full_name` + `program` + `year_graduated` |
| R3 | `alumni.gmail_address` | `email_history.recipients[]` | N : M | **Logical** (JSON array) | Recipient resolution at send time; not an FK |
| R4 | `SHEETS_ACCOUNTS_TAB` | `auth-cache.enc` | 1 : 1 | **Logical** (refreshed on login) | Offline auth fallback |
| R5 | `settings` | Sheets / SMTP integrations | 1 : 1 | **Logical** | Stores `sheets_id`, `sheets_key` (enc), `smtp_*` (enc) |
| R6 | `meta.schema_version` | Migration runner | 1 : 1 | **Logical** | Drives `runMigrations()` on startup |

> **Why so few hard FKs?** sql.js supports FKs (we enable `PRAGMA foreign_keys = ON`), but most cross-table links are JSON arrays or external stores. Only the alumni → history relationship is a true relational link.

---

## 5. Entity Cardinality Summary

| Entity | Expected Volume | Growth Driver |
|--------|----------------|---------------|
| `alumni` | < 50,000 rows | One row per survey respondent (graduation year ≥ 2018) |
| `alumni_history` | ~5–10× alumni rows | Every UPDATE writes a snapshot |
| `email_history` | < 5,000 rows | One row per send batch |
| `settings` | ~15 rows | Fixed key set (smtp_*, sheets_*, ui prefs) |
| `meta` | 1–5 rows | `schema_version` + reserved keys |
| `SHEETS_PROGRAM_TAB` (×3) | Mirrors `alumni` | Form-driven |
| `SHEETS_ACCOUNTS_TAB` | 4–10 rows | One per faculty user (Dean + 3 chairs) |
| `auth-cache.enc` | Mirrors Accounts tab | Refreshed on each successful online login |

---

## 6. Cross-Cutting Constraints

| Constraint | Where Enforced | Notes |
|-----------|----------------|-------|
| `program ∈ {BSCE, BSCpE, BSEE}` | Zod schema + repository | Not a CHECK constraint — kept as `TEXT` for sync flexibility |
| `year_graduated >= 2018` | Zod schema + service layer | 5-year post-graduation tracer window |
| `sync_status ∈ {pending, synced, conflict}` | Repository defaults to `pending` on insert/update | |
| Role-based scoping | All `alumni*` queries use `WHERE program IN (?)` from `auth.store.accessiblePrograms` | Dean = all 3, Chairs = 1 |
| Atomic writes | `db-manager.safeSave()` (`.tmp` → `.bak` → `.db`) | Never `fs.writeFileSync` directly on `alumni.db` |
| Encryption at rest | `electron/utils/crypto.ts` (AES-256-GCM) | `smtp_pass`, `sheets_key`, `auth-cache.enc` |

---

## 7. Indexes

Defined in [`schema.ts`](../../electron/database/schema.ts):

| Index | Table | Column(s) | Query It Serves |
|-------|-------|-----------|-----------------|
| `idx_alumni_program` | `alumni` | `program` | Role-based scoping (every dashboard / directory query) |
| `idx_alumni_year` | `alumni` | `year_graduated` | Year filters in reports |
| `idx_alumni_sync` | `alumni` | `sync_status` | Pending push detection on Sync page |
| `idx_alumni_name` | `alumni` | `full_name` | Global search & sync composite-key match |
| `idx_history_alumni` | `alumni_history` | `alumni_id` | Profiling timeline lookup |
| `idx_email_status` | `email_history` | `status` | Email history filter |

---

## 8. Read This Next

- **[erd-detailed.md](erd-detailed.md)** — Per-entity ERD with every column, type, default, nullability, and dictionary cross-reference.
- **[database.md](database.md)** — Full schema source, crash-safety design, key SQL patterns.
- **[data-dictionary.md](data-dictionary.md)** — Questionnaire → DB column mapping (~58 columns).

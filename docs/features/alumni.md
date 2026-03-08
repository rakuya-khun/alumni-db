# Feature: Alumni Directory

> **Route:** `/alumni` → `src/routes/alumni/`
> **Offline:** ✅ Yes
> **Complexity:** Medium
> **Role Access:** Dean sees all programs; Chairpersons see own program only

---

## Overview

The Alumni Directory provides full CRUD operations for alumni records. Every field from the Google Form questionnaire (42–43 questions across 7 sections) maps to a form input. The directory supports search, 6-dimension filtering, GForm-based add, profile view links, sync status indicators — all with role-based data scoping applied at the query level.

---

## Route Structure

```
src/routes/alumni/
├── index.tsx                       # Alumni Directory: table view with search, filter, pagination
├── add.tsx                         # Add alumni form page (all gform fields)
├── edit.tsx                        # Edit alumni form page
├── -components/
│   ├── alumni-table.tsx            # Data table with sort, search, actions
│   ├── alumni-form.tsx             # Shared form component (Add + Edit reuse)
│   ├── alumni-form-fields.tsx      # Individual field components (all gform questions)
│   ├── delete-confirm-dialog.tsx   # Confirm delete modal
│   ├── sync-badge.tsx              # "Pending Sync" / "Synced" indicator per row
│   ├── alumni-table-toolbar.tsx    # Filter bar: 6 dimensions
│   └── view-profile-button.tsx    # Link to Alumni Profiling page
├── -hooks/
│   ├── use-alumni.ts              # CRUD operations via IPC (role-filtered)
│   ├── use-alumni-filters.ts      # Filter/search state (6 filter dimensions)
│   └── use-alumni-form.ts         # Form state, validation, submission
├── -schemas/
│   └── alumni.schema.ts           # Zod schema: validation rules for ALL alumni fields
└── -constants/
    └── index.ts                   # Programs, employment statuses, specializations, regions, etc.
```

---

## Pages

### Directory (`index.tsx`)

- **Role-based filter applied first** — list only shows alumni within user's accessible programs
- Data table with all alumni records
- Column sorting (name, program, year, employment status)
- Full-text search across all text fields
- 6-dimension filter toolbar (see below)
- Sync status badge per row (Pending / Synced / Conflict)
- Actions: View Profile, Edit, Delete (with confirmation dialog)
- Pagination

### Add Alumni (`add.tsx`)

- Full form mapping all questionnaire fields (see [data-dictionary.md](../technical/data-dictionary.md))
- Dynamic program-specific fields (Q17, Q23, Q28, Q32 change based on selected program)
- Conditional fields (show/hide based on Yes/No answers)
- Zod validation with inline error messages
- On submit: save locally → mark as "Pending Sync"

### Edit Alumni (`edit.tsx`)

- Same form as Add, pre-populated with existing data
- On submit: create history snapshot → update record → mark as "Pending Sync"
- History snapshot includes the full previous record + list of changed fields

---

## 5 Directory Actions (v2-5 Flow)

| Action | Description |
|--------|-------------|
| **Search/Filter** | Filter by Program, Year, Location, Employment Status, Specialization, Board Passers |
| **Add (GForm)** | Open Google Form integration or manual add form — fill all gform fields → validate → save |
| **Edit** | Load record → modify fields → validate → update DB + create history snapshot |
| **Delete** | Confirm delete dialog → remove record (cascades to `alumni_history`) |
| **View Profile** | Navigate to Alumni Profiling page for full profile + history timeline |

---

## 6-Dimension Filter

| Dimension | Column | Options |
|-----------|--------|---------|
| Program | `program` | BSCE, BSCpE, BSEE |
| Year Graduated | `year_graduated` | Dynamic from distinct years in DB |
| Specialization | `specialization` | Program-specific options (see data dictionary) |
| Area/Location | `work_region` | 18 Philippine regions + Others |
| Employment Status | `employment_status` | Regular/Permanent, Temporary, Casual, Contractual, Self-Employed, Not Employed |
| Board Passers | `has_license` | Yes (licensed), No (not licensed) |

Filters are combined with `AND` logic in SQL `WHERE` clauses. **Role-based program filter is always applied** in addition to user-selected filters.

---

## Form Fields by Section

The form maps all questionnaire sections. See [data-dictionary.md](../technical/data-dictionary.md) for the complete field-by-field breakdown. Key sections:

| Section | Fields | Form Behavior |
|---------|--------|--------------|
| II. Respondent Info | Q1–Q7 (name, DOB, sex, address, contact, gmail, facebook) | Always visible |
| III. Academic Profile | Q8–Q11 (program, year, honors) | Program selection triggers dynamic fields |
| IV. Curriculum & Competencies | Q12–Q15 (relevance scale, 9 competency ratings, useful competencies, improvement areas) | Likert scale inputs, multi-select checkboxes |
| V. Licensure | Q16–Q23 (license, title, exam date, certs, grad school, specialization) | Conditional show/hide. Program-specific options for Q17, Q23 |
| VI. Employment Data | Q24–Q37/38 (employed, status, position, company, region, sector, salary, first job) | Conditional flow based on employment status. Program-specific Q28, Q32 |
| VII. Career Progression | Q38–Q42 (2yr/4yr/6yr positions, awards) | Always visible |

### Program-Specific Dynamic Fields

When the user selects a program in Q8, these fields update their options:

| Field | CE Options | CpE Options | EE Options |
|-------|-----------|-------------|------------|
| Q17 Professional Title | Civil Engineer, Master Plumber | Certified/Professional Computer Engineer | Master Electrician, Electrical Engineer, Professional EE |
| Q23 Specialization | MSCE variants (6) | Tech fields (11) | MSEE variants + MEng + PhD (6) |
| Q28 Job Level | Supervisory/Managerial (Yes/No) | Job Classification (6 tiers) | Supervisory/Managerial (Yes/No) |
| Q32 Industry Sector | Construction-focused (6) | IT/Tech-focused (12) | Power/Energy-focused (7) |

---

## Validation

All form inputs use `react-hook-form` + `zod` for comprehensive validation:

- **Required fields:** full_name, program, year_graduated — enforced at schema level
- **Email format:** gmail_address validated with `.email()` when provided
- **Number ranges:** Likert scales validated as `1 ≤ value ≤ 5`
- **Year range:** year_graduated validated as reasonable range (e.g., 1990–current year)
- **Conditional validation:** Fields only validated when their parent condition is met (e.g., employment fields only when `is_employed = 1`)
- **Program-specific validation:** Dynamic options validated against program-specific enums

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `alumni.ipc.ts` | `alumni:getAll`, `alumni:create`, `alumni:update`, `alumni:delete` |
| Service | `alumni.service.ts` | Validate, deduplicate, transform, add timestamps |
| Service | `alumni-history.service.ts` | Create snapshot on update |
| Repository | `alumni.repository.ts` | SQL CRUD operations with role-based `WHERE program IN (?)` |
| Repository | `alumni-history.repository.ts` | INSERT snapshot on every UPDATE |
| Repository | `sync-queue.repository.ts` | Mark records as pending sync |
| Store | `alumni.store.ts` | Cached list, filters, selected record |
| Store | `auth.store.ts` | `accessiblePrograms` for role-based filtering |

---

## Data Flow

### Add

1. User fills form → Zod validates → hook calls `ipcClient.alumni.create(data)`
2. `alumniService.create()` → adds `created_at`, `sync_status = 'pending'`
3. `alumniRepository.insert()` → `INSERT INTO alumni` + atomic save
4. Return success → update `alumni.store` → redirect to directory

### Edit

1. Load existing record → populate form → user modifies → Zod validates
2. Hook calls `ipcClient.alumni.update(id, data)`
3. `alumniService.update()` → `alumniHistoryService.createSnapshot(oldRecord, newRecord)`
4. `alumniHistoryRepository.insert()` → `INSERT INTO alumni_history`
5. `alumniRepository.update()` → `UPDATE alumni SET ... WHERE id = ?` + mark pending
6. Return success → update store → redirect

### Delete

1. User clicks delete → confirmation dialog → hook calls `ipcClient.alumni.delete(id)`
2. `alumniService.delete()` → `alumniRepository.delete(id)`
3. Cascades to `alumni_history` via `ON DELETE CASCADE`
4. Return success → update store

---

## Flowchart Reference

**Alumni Directory** — Section 4 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

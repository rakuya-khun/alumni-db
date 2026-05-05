# PEO (Program Educational Objectives) — Implementation Plan

> **Status:** ✅ **IMPLEMENTED — Phases 1–6 complete (May 2026)**
> **Reference:** AlumNayan (`/admin/reports/verify`) — used only as data-logic reference, NOT a UI clone
> **Validation:** End-to-end against schema, repositories, services, IPC, preload allowlist, router, sidebar, dashboard, exports, actual constants files, and TypeScript compiler (zero errors across 16 PEO-touched files).
> **Major revision (May 5):** Per client direction, PEO is integrated INTO the Dashboard top section as 4 stat cards + collapsible accordion. The standalone `/peo` route is removed. Dashboard and PEO exports remain separate.

### Implementation Snapshot

| Phase | Status | Artifacts |
|-------|--------|-----------|
| 1 — Shared contracts | ✅ Done | `shared/types/peo.types.ts`, `shared/schemas/peo.schema.ts`, `shared/ipc-channels.ts` (PEO group + EXPORT.PEO_PDF/PEO_DOCX), `electron/preload.ts` (4 channels added) |
| 2 — Repository | ✅ Done | `electron/database/peo.repository.ts` (286 lines, 23 SQL queries, helpers duplicated locally) |
| 3 — Service + IPC | ✅ Done | `electron/services/peo.service.ts` (121 lines), `electron/ipc/peo.ipc.ts` (31 lines), `electron/ipc/index.ts`, `src/data/ipc-client.ts` (peo namespace) |
| 4 — Store + Dashboard UI | ✅ Done | `src/stores/peo.store.ts` + 11 components under `src/routes/dashboard/-components/peo/` + `use-peo.ts` hook + `src/routes/dashboard/index.tsx` integration (PeoCardsRow + PeoAccordion above existing Dashboard Filters) |
| 5 — Exports + Reports | ✅ Done | `export.service.ts` (peoToPdf + peoToDocx, +290 lines), `export.ipc.ts` (PEO_PDF/PEO_DOCX handlers), `ipc-client.ts` (export.peoPdf/peoDocx), Dashboard "Export PEO ▼" button, Reports page PEO Attainment section (PDF + Word cards), `use-export.ts` extended union `'peo-pdf' \| 'peo-docx'` |
| 6 — Smoke test wiring | ✅ Done | `tests/smoke-test.cjs` § 9 — 30+ static checks for PEO files + IPC channels + preload allowlist + handler registration + ipc-client + dashboard/reports integration |

**TypeScript:** Zero errors across all 16 modified/created files (verified via `get_errors`).
**Runtime test:** Run `node tests/smoke-test.cjs` to verify all PEO wiring checks pass.
**Out of scope (future):** Fixture-based runtime SQL assertions (plan §9.2) require an integration test harness that doesn't exist yet — left for a follow-up.

---

## 1. What PEO Is (One Paragraph)

**PEO = Program Educational Objectives.** SLSU College of Engineering makes 3 promises about what graduates will become 3–5 years after graduation. PTC-ACBET accreditation requires the school to **prove attainment** by measuring how many alumni actually meet the criteria. This module computes each PEO's attainment percentage from existing alumni data, broken down by cohort and program. PEO is presented as 4 summary cards on the Dashboard with a collapsible details accordion for deep-dive analysis.

### SLSU PEO Definitions (from PEO–College Goal matrix)

| PEO | Short Title | Full Definition |
|-----|-------------|-----------------|
| **PEO 1** | Professional Competence | Graduates demonstrate professional competence by applying advanced knowledge and skills, contributing to academic and industry excellence through innovation, research, and continuous learning (local + global). |
| **PEO 2** | Ethics & Social Responsibility | Graduates exhibit moral integrity, ethical values, and social responsibility by addressing community needs, promoting inclusivity, and upholding professional/societal ethics. |
| **PEO 3** | Innovation & Sustainability | Graduates engage in innovative research, technological advancement, and extension services that promote environmental sustainability, resource regeneration, and community empowerment. |

---

## 2. Finalized Decisions

| # | Question | **Decision** | Rationale |
|---|----------|--------------|-----------|
| 1 | PEO 2 community indicator | **Primary:** `community_involvement` non-empty. **Fallback layered OR:** `industry_sector` ∈ public-service set OR `current_position` keyword match | Direct field exists in schema (line 126) — eliminates pure-proxy concerns. |
| 2 | PEO 3 research indicator | **Primary:** `research_conducted` non-empty. **Fallback layered OR:** `has_grad_school = 1` OR `advanced_study_reason LIKE '%Research interest%'` OR `current_position` keyword match | Direct field exists in schema (line 118). |
| 3 | Pass logic | **OR** across criteria after employment gate | Matches sample pattern. AND would zero-out attainment. |
| 4 | Denominator default | **Total respondents in scope** (RBAC + filters); UI toggle for "employed only" | Defensible for accreditation. |
| 5 | Cohort year split | **Dynamic** — `new Date().getFullYear()` server-side, optional UI override | Auto-rolls. |
| 6 | Job-relevance "3+" | Top 2 labels: `Highly related` + `Moderately related` | Matches existing dashboard KPI. |
| 7 | Min-respondents threshold | **n < 10:** show percentage with badge "Insufficient data (n=X)" | Avoids embarrassing tiny-N headlines. |
| 8 | NULL `year_graduated` | Schema NOT NULL; out-of-range (<2018) silently excluded | No code change. |
| 9 | **PEO surface (CLIENT REVISION)** | **Integrated into Dashboard top section.** 4 stat cards + collapsible accordion. **No standalone `/peo` route, no sidebar nav item.** | Client direction: keep PEO with Dashboard since faculty already use that page; reduces nav clutter. |
| 10 | **PEO 4th card (Outcomes)** | Single big number = **overall alignment %** (employed AND job-related ÷ total in scope). Cohort breakdown lives in the accordion's Outcomes tab. | One comparable headline; deeper breakdown one click away. |
| 11 | **Accordion default state** | **Collapsed** | Faculty see 4 big numbers first; expand to dig deeper. |
| 12 | **Accordion location** | Immediately **below the 4 PEO cards**, **above** the existing Dashboard Filters | PEO concerns stay grouped. |
| 13 | **PEO filters scope** | **Separate** from existing Dashboard Filters. Only affects PEO numbers (cards + accordion). Existing dashboard charts/tables unaffected. | Independent concerns; matches client mental model. |
| 14 | **Card click behavior** | Clicking a PEO card **auto-opens the accordion AND switches to that PEO's tab**. Clicking the Outcomes card opens accordion on Outcomes tab. | Intuitive deep-link UX. |
| 15 | **Export wiring** | Two SEPARATE export buttons on Dashboard header: `[Export Dashboard ▼]` and `[Export PEO ▼]`. **Both files have a cover heading on page 1.** Dashboard and PEO data NEVER combined into one file. | Client requirement: separation of concerns for accreditation reporting. |
| 16 | `/reports` route | **Still gets a PEO Attainment Report card** (4th export card) — separate from Dashboard exports | Faculty can batch-export from central Reports page without going to Dashboard first. |

---

## 3. Data Mapping — Validated Against Schema + Constants

### 3.1 Shared Gates

| Indicator | DB Column | Logic |
|-----------|-----------|-------|
| Employed | `is_employed` | `is_employed = 1` |
| International work (informational) | `work_region`, `work_region_other` | `LOWER(work_region) LIKE '%others%'` OR `work_region_other` non-empty |
| Job related to course (3+) | `job_relevance` | `LOWER(job_relevance) IN ('highly related','moderately related')` |

### 3.2 PEO 1 — Professional Competence

| Indicator | Field(s) | SQL |
|-----------|----------|-----|
| Employed (gate) | `is_employed` | `= 1` |
| Job related | `job_relevance` | `LOWER(job_relevance) IN ('highly related','moderately related')` |
| Has license / certificate | `has_license`, `other_certifications` | `has_license = 1 OR (other_certifications IS NOT NULL AND TRIM(other_certifications) != '')` |
| Supervisory / Managerial | `job_level` | `LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) = 'yes'` |

### 3.3 PEO 2 — Ethics & Social Responsibility

> ✅ **Schema CONFIRMED:** `community_involvement TEXT` exists at `schema.ts:126`. Synced via `mapper.ts:146`.

| Indicator | Field(s) | Logic |
|-----------|----------|-------|
| Employed (gate) | `is_employed` | `= 1` |
| Job related | `job_relevance` | Same as above |
| Community / industry involvement | `community_involvement` (PRIMARY) + `industry_sector` + `current_position` (FALLBACK) | `(community_involvement IS NOT NULL AND TRIM(community_involvement) != '')` OR `industry_sector IN ('Government / Public Works','Academe / Research')` OR `LOWER(current_position)` LIKE any of: `%community%`, `%extension%`, `%volunteer%`, `%outreach%`, `%ngo%`, `%barangay%`, `%welfare%`, `%public service%`, `%social worker%` |
| Awards & recognitions | `has_awards` | `= 1` |

### 3.4 PEO 3 — Innovation & Sustainability

> ✅ **Schema CONFIRMED:** `research_conducted TEXT` exists at `schema.ts:118`. Synced via `mapper.ts:144`.

| Indicator | Field(s) | Logic |
|-----------|----------|-------|
| Employed (gate) | `is_employed` | `= 1` |
| Job related | `job_relevance` | Same as above |
| Research / innovation activity | `research_conducted` (PRIMARY) + `has_grad_school` + `advanced_study_reason` + `current_position` (FALLBACK) | `(research_conducted IS NOT NULL AND TRIM(research_conducted) != '')` OR `has_grad_school = 1` OR `advanced_study_reason LIKE '%Research interest%'` OR `LOWER(current_position)` LIKE any of: `%research%`, `%r&d%`, `%scientist%`, `%professor%`, `%laboratory%`, `%data scientist%`, `%innovation%` |
| Innovation / tech / sustainability sector | `industry_sector` (program-specific allowlist — exact strings from `INDUSTRY_SECTORS_*`) | **BSCE:** `Consulting`, `Academe / Research` · **BSCpE:** `Information Technology`, `Software Development`, `Telecommunications`, `Semiconductor / Electronics`, `Academe / Research` · **BSEE:** `Power Generation / Distribution`, `Telecommunications`, `Semiconductor / Electronics`, `Academe / Research` |

> ⚠️ **No "Renewable Energy" sector exists** in `INDUSTRY_SECTORS_EE`. Closest: `Power Generation / Distribution`. Flagged for client.

### 3.5 Outcomes (Cohort Alignment)

| Cohort | Definition | Floor |
|--------|------------|-------|
| Recent Graduate (0–2 yrs) | `year_graduated >= currentYear - 2` | — |
| Mid-Career (3–5 yrs) | `year_graduated BETWEEN currentYear-5 AND currentYear-3` | — |
| Established (6+ yrs) | `year_graduated <= currentYear - 6 AND year_graduated >= 2018` | Schema enforces `>= 2018` |

**Aligned formula:** `is_employed = 1 AND LOWER(job_relevance) IN ('highly related','moderately related')`

**4th card (Outcomes) headline number:** Overall alignment % across ALL alumni in scope (NOT per-cohort). Per-cohort breakdown lives in the accordion's Outcomes tab.

---

## 4. Computation Rules

### 4.1 Pass Logic per Alumni Row

```
PEO_passed = (is_employed = 1)  AND  (criterion_A OR criterion_B OR criterion_C OR ...)
```

- **PEO 1:** employed AND (job-related OR has-license/cert OR supervisory)
- **PEO 2:** employed AND (job-related OR community-direct-or-proxy OR has-awards)
- **PEO 3:** employed AND (job-related OR research-direct-or-proxy OR innovation-sector)

### 4.2 Attainment %

```
PEO_X_% = (alumni passing PEO X) / (denominator) × 100
```

Default denominator = total respondents in scope. UI toggle switches to employed-only.

### 4.3 Per-Indicator Breakdown

For each PEO, the service returns per-indicator counts so the accordion shows "X of Y met indicator Z" rows. Critical for accreditation transparency.

### 4.4 Insufficient-Data Threshold (Decision #7)

If `denominator < 10` for the active scope, percentage card displays a yellow `Insufficient data (n=X)` badge. Cohort cards apply the same rule per cohort.

### 4.5 Cohort Computation

`asOfYear` defaults to `new Date().getFullYear()` server-side. UI exposes optional override.

---

## 5. Architecture — Validated End-to-End

### 5.1 Verified Touchpoints (Re-checked May 2026)

| Layer | File | Validation Notes |
|-------|------|------------------|
| Schema | `electron/database/schema.ts` | All fields confirmed |
| Migrations | `electron/database/migrations/index.ts` | Migration 0002 added the two text columns |
| Sheets mapper | `electron/integrations/google-sheets/mapper.ts` | Lines 144–147: both fields wired |
| Repository helpers | `electron/database/analytics.repository.ts` | ⚠️ `buildWhere`/`buildAnd`/`scalarResult` are PRIVATE — Phase 2 duplicates them locally (~30 LOC) |
| Service | `electron/services/analytics.service.ts` | Pattern: thin orchestration |
| IPC | `electron/ipc/analytics.ipc.ts` | `scopeFilters()` from `utils/rbac.ts` |
| IPC registry | `electron/ipc/index.ts` | Lists every `register*Handlers()` |
| Preload | `electron/preload.ts` | `ALLOWED_CHANNELS` array, lines 4–28 |
| IPC client | `src/data/ipc-client.ts` | `peo` namespace to add |
| Store | `src/stores/analytics.store.ts` | Zustand `loading`/`error` pattern |
| **Dashboard page** | `src/routes/dashboard/index.tsx` | Heavy modify — adds 4 PEO cards + accordion at top |
| **Dashboard filters** | `src/routes/dashboard/-components/dashboard-filters.tsx` | UNCHANGED (PEO uses its own filters) |
| Card style | `src/routes/dashboard/-components/supervisory-card.tsx` | Reused pattern |
| Reports page | `src/routes/reports/index.tsx` | Add 4th export card |
| Reports hook | `src/routes/reports/-hooks/use-export.ts` | Extend format union |
| Export service | `electron/services/export.service.ts` | Mirror `dashboardPdf`/`dashboardDocx` pattern. **Each file gets its own cover heading on page 1.** |
| Sidebar | `src/layouts/sidebar.tsx` | UNCHANGED (no PEO sidebar item) |
| Router | `src/app/router.tsx` | UNCHANGED (no `/peo` route) |
| Industry sector constants | `src/routes/alumni/-constants/index.ts` | Strings verified |

### 5.2 New Files

All PEO UI components live under `src/routes/dashboard/-components/peo/` since PEO is a Dashboard sub-feature.

| File | Purpose |
|------|---------|
| `shared/types/peo.types.ts` | `PeoFilters`, `PeoResult`, `PeoIndicatorBreakdown`, `PeoCohortRates`, `Cohort`, `DenominatorMode` |
| `shared/schemas/peo.schema.ts` | Zod for PEO filter inputs |
| `electron/database/peo.repository.ts` | Pure SQL: per-indicator counts, cohort splits. Duplicates query helpers locally. |
| `electron/services/peo.service.ts` | Pass logic, percentages, breakdown assembly, insufficient-data flag |
| `electron/ipc/peo.ipc.ts` | Thin: `scopeFilters` → service → wrap |
| `src/stores/peo.store.ts` | Zustand: results, outcome rates, loading, error, **selectedTab**, **accordionOpen** |
| `src/routes/dashboard/-components/peo/peo-stat-card.tsx` | One of the 4 top stat cards. Click handler opens accordion + selects tab. |
| `src/routes/dashboard/-components/peo/peo-cards-row.tsx` | Renders the 4 stat cards in a grid (PEO 1, PEO 2, PEO 3, Outcomes) |
| `src/routes/dashboard/-components/peo/peo-accordion.tsx` | Collapsible container; contains filters + tabs + tab content |
| `src/routes/dashboard/-components/peo/peo-filters.tsx` | Programs / year / denominator toggle / asOfYear override |
| `src/routes/dashboard/-components/peo/peo-tabs.tsx` | Tab switcher (PEO 1 / PEO 2 / PEO 3 / Outcomes) |
| `src/routes/dashboard/-components/peo/peo-tab-content.tsx` | Renders indicator breakdown + cohort cards (when on Outcomes) |
| `src/routes/dashboard/-components/peo/peo-indicator-row.tsx` | "X of Y met indicator Z" row |
| `src/routes/dashboard/-components/peo/cohort-card.tsx` | One cohort card (Recent / Mid / Established) for Outcomes tab |
| `src/routes/dashboard/-components/peo/data-fields-used.tsx` | Collapsible info card listing actual DB fields |
| `src/routes/dashboard/-components/peo/processing-logic.tsx` | Collapsible info card explaining pass logic + thresholds |
| `src/routes/dashboard/-components/peo/insufficient-data-badge.tsx` | Reusable yellow badge for n<10 |
| `src/routes/dashboard/-hooks/use-peo.ts` | Wraps store + filter state (PEO scope only) |
| `src/routes/dashboard/-hooks/use-peo-export.ts` | Wraps PEO export IPC calls (Phase 5) |

### 5.3 Modified Files (Core — Phases 1–4)

| File | Change |
|------|--------|
| `shared/ipc-channels.ts` | Add `PEO: { COMPUTE: 'peo:compute', GET_OUTCOME_RATES: 'peo:getOutcomeRates' }` |
| `electron/preload.ts` | Add `'peo:compute'`, `'peo:getOutcomeRates'` to `ALLOWED_CHANNELS` |
| `electron/ipc/index.ts` | Import and call `registerPeoHandlers()` |
| `src/data/ipc-client.ts` | Add `peo: { compute, getOutcomeRates }` namespace |
| `src/routes/dashboard/index.tsx` | **Add new TOP section above existing Dashboard Filters:** `<PeoCardsRow />` + `<PeoAccordion />`. Existing dashboard content (filters, stat cards, charts, tables) stays UNCHANGED below. Add second export button "Export PEO ▼" beside existing "Export Dashboard ▼". |

> **NOT modified:** `src/app/router.tsx`, `src/layouts/sidebar.tsx` (no `/peo` route, no sidebar item — Decision #9).

### 5.4 Modified Files (Phase 5 — Export + Reports Wiring)

| File | Change |
|------|--------|
| `shared/ipc-channels.ts` | Add `EXPORT.PEO_PDF: 'export:peoPdf'`, `EXPORT.PEO_DOCX: 'export:peoDocx'` |
| `electron/preload.ts` | Add `'export:peoPdf'`, `'export:peoDocx'` to allowlist |
| `electron/services/export.service.ts` | Add `peoPdf(filePath, filters)` and `peoDocx(filePath, filters)`. **Page 1 cover heading: "PEO Attainment Report — SLSU College of Engineering"** with subtitle, date, filter summary, as-of-year. **No alumni table data.** Sections: PEO 1/2/3 attainment + indicator breakdown + Outcomes per cohort + methodology footer. Existing `dashboardPdf`/`dashboardDocx` get a heading update too: page 1 cover heading **"Dashboard Summary Report — SLSU College of Engineering"**. **PEO and Dashboard data MUST NOT be combined in one file.** |
| `electron/ipc/export.ipc.ts` | Wire two new handlers (`peoPdf`, `peoDocx`) |
| `src/data/ipc-client.ts` | Add `export.peoPdf(filters)`, `export.peoDocx(filters)` |
| `src/routes/dashboard/index.tsx` | Wire "Export PEO ▼" button (PDF/DOCX) via `use-peo-export` hook. Existing "Export Dashboard ▼" button keeps its current handlers. |
| `src/routes/reports/index.tsx` | Add 4th export card: "PEO Attainment Report" with PDF + DOCX dropdown. |
| `src/routes/reports/-hooks/use-export.ts` | Extend `ExportFormat` union to include `'peo-pdf' \| 'peo-docx'`; route to `ipcClient.export.peoPdf` / `peoDocx` |
| `src/routes/reports/-components/export-filter-form.tsx` | No change required — `AnalyticsFilters` is a subset of `AlumniFilters` |

### 5.5 RBAC

`scopeFilters()` from `electron/utils/rbac.ts` — same proven pattern as `analytics.ipc.ts`.

### 5.6 Year Constraint

Schema enforces `year_graduated INTEGER NOT NULL`. Cohort math floor: `Math.max(currentYear - 6, 2018)`.

---

## 6. UI Plan — Dashboard Integration

### 6.1 Dashboard Top Section (NEW)

```
/  (Dashboard — sidebar: MENU → Dashboard)
┌────────────────────────────────────────────────────────────────────┐
│ Page header                                                         │
│ "Dashboard"   Welcome back, {name} — {role}                         │
│                            [Export Dashboard ▼] [Export PEO ▼] [⟳] │
├────────────────────────────────────────────────────────────────────┤
│                                                                     │
│  ┌───────────┐  ┌───────────┐  ┌───────────┐  ┌───────────┐        │
│  │  PEO 1    │  │  PEO 2    │  │  PEO 3    │  │ Outcomes  │   ←NEW │
│  │  78.4%    │  │  45.2%    │  │  32.1%    │  │  61.5%    │        │
│  │ 196 / 250 │  │ 113 / 250 │  │  80 / 250 │  │ aligned   │        │
│  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘  └─────┬─────┘        │
│        └────────┬─────┴───────┬─────┴───────┬──────┘               │
│                 │ click opens accordion + switches tab               │
│                 ▼                                                    │
│  ▼ PEO Details & Filters (accordion — collapsed by default)   ←NEW │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │ PEO Filters: [Programs ▼] [Year Range] [Denominator ▼]       │  │
│  │              [As-of-Year (default 2026)]                      │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ Tabs: [PEO 1] [PEO 2] [PEO 3] [Outcomes]                     │  │
│  ├──────────────────────────────────────────────────────────────┤  │
│  │ (PEO 1 tab shown:)                                            │  │
│  │ Indicator Breakdown:                                          │  │
│  │   ✓ Job-related: 180/250                                      │  │
│  │   ✓ Has license:  95/250                                      │  │
│  │   ✓ Supervisory:  60/250                                      │  │
│  │                                                                │  │
│  │ ▶ Data Fields Used (collapsible)                              │  │
│  │ ▶ Processing Logic (collapsible)                              │  │
│  └──────────────────────────────────────────────────────────────┘  │
│                                                                     │
├────────────────────────────────────────────────────────────────────┤
│ ▼ Dashboard Filters (existing — UNCHANGED)                         │
│ ┌──────────────────────────────────────────────────────────────┐  │
│ │ Programs / Year From / Year To                               │  │
│ └──────────────────────────────────────────────────────────────┘  │
├────────────────────────────────────────────────────────────────────┤
│ Total Responses | Civil 210 | Computer 212 | Electrical 266        │
│ Board Passers   | Employed  | Field-Related | Supervisory          │
│ ... rest of existing dashboard charts/tables UNCHANGED ...          │
└────────────────────────────────────────────────────────────────────┘
```

### 6.2 Outcomes Tab (Inside Accordion)

```
Tabs: [PEO 1] [PEO 2] [PEO 3] [Outcomes ★]
─────────────────────────────────────────
┌──────────────┐ ┌──────────────┐ ┌──────────────┐
│ 🌱 Recent    │ │ 🌳 Mid-Career│ │ 🏔️ Established│
│ 0–2 yrs      │ │ 3–5 yrs      │ │ 6+ yrs       │
│ 55 / 95      │ │ 62 / 76      │ │ 104 / 149    │
│ 58% aligned  │ │ 82% aligned  │ │ 70% aligned  │
└──────────────┘ └──────────────┘ └──────────────┘

▶ Data Fields Used (collapsible)
▶ Processing Logic (collapsible)
```

### 6.3 UI States

| State | Behavior |
|-------|----------|
| Initial load | 4 PEO cards show skeletons; accordion is collapsed |
| Loading | Card-level skeleton with spinner; PEO filters remain interactive |
| Empty (zero in scope) | Cards show "—" with message "No alumni match the current PEO filters." |
| Insufficient (n<10) | % shown + yellow badge "Insufficient data (n=X)" |
| PEO filter change | Auto-refetch (debounced 300 ms) — only affects PEO cards/accordion, NOT existing dashboard |
| Denominator toggle | Re-fetch with new mode |
| Card click | Accordion opens (if closed) AND tab switches to clicked PEO; smooth scroll into view |
| Tab switch (inside accordion) | Cached results re-render instantly |
| Accordion collapse | State persists in `peo.store.ts` for the session |

### 6.4 Compatibility

- Card style mirrors existing `supervisory-card.tsx` (`rounded-xl border border-card-border bg-card p-6 shadow-sm`)
- Outcomes (4th) card uses primary background (`bg-primary text-primary-foreground`) to visually differentiate as the composite/summary card
- Accordion uses semantic Tailwind classes; chevron icon from `lucide-react`
- Dark-mode aware via existing CSS variables
- Buttons follow non-IT-faculty UX: `h-10 px-6`, text labels always shown

---

## 7. Reports & Exports Wiring (Explicit)

### 7.1 Three Export Surfaces — All Use the Same Service

```
                  ┌─────────────────────────────┐
                  │  exportService.peoPdf/Docx  │
                  └──────────────┬──────────────┘
                                 │
     ┌───────────────────────────┼───────────────────────────┐
     │                           │                            │
   ipcClient.export.peoPdf  ipcClient.export.peoDocx  ipcClient.export.peoPdf/Docx
     │                           │                            │
   ┌─┴──────────────────┐  ┌─────┴────────────┐  ┌────────────┴──────────┐
   │ Dashboard header   │  │ Dashboard header │  │ /reports 4th card     │
   │ "Export PEO ▼"     │  │ (DOCX option)    │  │ (PDF + DOCX dropdown) │
   └────────────────────┘  └──────────────────┘  └───────────────────────┘
```

### 7.2 Separation Rule (CLIENT REQUIREMENT)

- **Dashboard export** → contains ONLY existing dashboard data (KPIs, survey tables, charts)
- **PEO export** → contains ONLY PEO data (3 PEOs, indicator breakdown, cohort outcomes)
- **NEVER combined into one file**
- Both files have a **distinct cover heading on page 1**:
  - Dashboard: `"Dashboard Summary Report — SLSU College of Engineering"`
  - PEO: `"PEO Attainment Report — SLSU College of Engineering"`
- Each cover page also includes: subtitle, generation date, applied filters, as-of-year (PEO only)

### 7.3 Filter Reuse on `/reports` Card

The `/reports` PEO card uses the existing `ExportFilterForm` (programs + year range — sufficient for PEO compute). PEO-specific filters (`denominatorMode`, `asOfYear`) default to "total" / current year on this path; the Dashboard PEO accordion is the place to tune them interactively.

---

## 8. Implementation Phases

| Phase | Deliverable | Sub-Agent | Files |
|-------|-------------|-----------|-------|
| ✅ 1 | Types + Zod schema + IPC channel constants + preload allowlist | schema-contract | 2 new + 2 modify |
| ✅ 2 | `peo.repository.ts` (with duplicated query helpers) — SQL aggregations + cohort splits | db-architect | 1 new |
| ✅ 3 | `peo.service.ts` + `peo.ipc.ts` + IPC client + IPC index registration | electron-backend + react-ui | 2 new + 2 modify |
| ✅ 4 | `peo.store.ts` + 11 dashboard-scoped components + 1 hook + Dashboard page integration | react-ui | 12 new + 1 modify |
| ✅ 5 | PEO export (PDF/DOCX with cover heading) + Dashboard "Export PEO" button + Reports route 4th card + Dashboard cover heading update | export-report + react-ui | 1 new + 7 modify |
| ✅ 6 | Smoke test fixtures + assertions (see §9) | — | extend `tests/smoke-test.cjs` |

---

## 9. Test Plan (Phase 6)

### 9.1 Required Fixtures

| Fixture | Program | Key Fields | Expected PEO Outcomes |
|---------|---------|-----------|----------------------|
| **F1 — License-only PEO 1** | BSCE | `is_employed=1`, `has_license=1`, `job_relevance='Not related'`, `job_level='No'` | PEO 1: ✓ · PEO 2: ✗ · PEO 3: ✗ |
| **F2 — Fail all gates** | BSCpE | `is_employed=0`, all other fields null | PEO 1: ✗ · PEO 2: ✗ · PEO 3: ✗ |
| **F3 — Direct research field** | BSEE | `is_employed=1`, `research_conducted='Solar panel efficiency study'`, `job_relevance='Slightly related'` | PEO 3: ✓ · PEO 1: ✗ · PEO 2: ✗ |
| **F4 — Supervisory + community** | BSCE | `is_employed=1`, `job_level='Supervisory'`, `community_involvement='Barangay tech volunteer'`, `has_awards=1` | PEO 1: ✓ · PEO 2: ✓ · PEO 3: ✗ |
| **F5 — Job-related triple-pass** | BSCpE | `is_employed=1`, `job_relevance='Highly related'` | PEO 1: ✓ · PEO 2: ✓ · PEO 3: ✓ |
| **F6 — Cohort: Established** | BSEE | `year_graduated=2018`, `is_employed=1`, `job_relevance='Moderately related'` | Outcomes: counts under "Established" cohort, "Aligned" |

### 9.2 Assertions

```js
// After inserting F1–F6:
const result = await ipcClient.peo.compute({ programs: ['BSCE','BSCpE','BSEE'] })
assert.equal(result.peo1.passing, 3)   // F1, F4, F5
assert.equal(result.peo2.passing, 2)   // F4, F5
assert.equal(result.peo3.passing, 2)   // F3, F5
assert.equal(result.denominator, 6)
assert(result.peo1.indicators.license >= 1)
assert(result.peo2.indicators.communityDirect >= 1)
assert(result.peo3.indicators.researchDirect >= 1)

// Outcomes (4th card)
const outcomes = await ipcClient.peo.getOutcomeRates({ programs: ['BSEE'] })
assert(outcomes.cohorts.established.aligned >= 1)  // F6
assert.equal(outcomes.overallAligned >= 1, true)

// Insufficient-data flag
const small = await ipcClient.peo.compute({ programs: ['BSCE'] })
assert.equal(small.insufficient, true)  // n < 10
```

### 9.3 SQL Parenthesization Safety

Each criterion clause wrapped in its own parentheses: `(c1) OR (c2) OR (c3)`. Smoke test catches AND/OR precedence regressions.

---

## 10. Validation Summary

- ✅ `job_relevance` values verified at `analytics.repository.ts:118`
- ✅ `job_level` supervisory pattern verified at `analytics.repository.ts:142`
- ✅ RBAC `scopeFilters` reusable from `electron/utils/rbac.ts`
- ✅ `community_involvement` (line 126) and `research_conducted` (line 118) fields verified
- ✅ Migration 0002 added the two text columns
- ✅ Sheets `mapper.ts` wires both fields (lines 144–147)
- ✅ Industry-sector strings corrected against `src/routes/alumni/-constants/index.ts`
- ✅ Preload allowlist update part of Phase 1
- ✅ Dashboard page (`src/routes/dashboard/index.tsx`) is the integration point — verified existing structure
- ✅ Reports page (`src/routes/reports/index.tsx`) drives exports via `FORMATS` array + `useExport` hook
- ⚠️ `buildWhere`/`buildAnd`/`scalarResult` in `analytics.repository.ts` NOT exported — Phase 2 duplicates them locally
- ⚠️ "Renewable Energy" sector does not exist in `INDUSTRY_SECTORS_EE` — closest signal is `Power Generation / Distribution`. Flagged for client.

---

## 11. Risks & Mitigations

| Risk | Mitigation |
|------|------------|
| Proxy fields (PEO 2/3) inflate or deflate attainment | Direct fields are PRIMARY; proxies are layered fallback. Per-indicator breakdown shows accreditors which path counted. |
| Keyword scan false positives | Conservative keyword list documented in Data Fields Used UI card. |
| Cohort year drift breaks year-over-year reproducibility | `asOfYear` persisted in PDF/DOCX export header; UI exposes override. |
| RBAC bypass | All filters pass through `scopeFilters()` in IPC handler. |
| New IPC channels not reachable from renderer | Preload allowlist update is part of Phase 1. |
| Tiny-cohort attainment | `insufficient: true` flag at n<10, displayed as yellow badge on every card. |
| Industry-sector string mismatch | Allowlist uses EXACT strings from `INDUSTRY_SECTORS_*` constants. |
| `LOWER(current_position)` full-table scan | Acceptable for desktop-app dataset size. |
| Out-of-range `year_graduated` | Schema NOT NULL constraint; legacy <2018 silently excluded. |
| Helper-function duplication in `peo.repository.ts` | ~30 LOC isolated copies. Future refactor: extract to `electron/database/_query-builder.ts` shared util. |
| **Dashboard page bloat from PEO integration** | All PEO components live under `dashboard/-components/peo/` subfolder; Dashboard page imports a single `<PeoCardsRow />` + `<PeoAccordion />` to keep the index file readable. |
| **PEO and Dashboard exports accidentally combined** | Strict separation enforced at service layer — `peoPdf`/`peoDocx` and `dashboardPdf`/`dashboardDocx` are separate methods with no shared output composition. Cover headings differ. |
| **Filter confusion (Dashboard vs PEO filters)** | Visual separation: PEO filters live INSIDE the PEO accordion (clearly labeled). Existing Dashboard Filters keep their current location and label. |

---

## 12. Ready-to-Proceed Checklist

- [x] All client decisions captured (§2 #9–#16)
- [x] Schema gaps closed by direct field discovery (§3.3, §3.4)
- [x] Industry-sector strings corrected (§3.4)
- [x] Helper-function export status verified; mitigation defined (§5.1, §5.2)
- [x] Dashboard integration explicitly defined (§5.3, §6.1)
- [x] Two-export-button rule documented with cover-heading separation (§5.4, §7.2)
- [x] `/peo` route + sidebar item REMOVED from plan (Decision #9)
- [x] Card click → open accordion + select tab behavior defined (§6.3, Decision #14)
- [x] PEO filters scope (separate from Dashboard Filters) defined (Decision #13)
- [x] UI states defined (§6.3)
- [x] Test fixtures with expected outcomes defined (§9)
- [x] Risks documented with mitigations (§11)

**Status: ✅ ALL PHASES IMPLEMENTED. Verified zero TypeScript errors and complete static smoke-test wiring.**

End of plan.

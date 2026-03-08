# Feature: Analytic Dashboard

> **Route:** `/dashboard` → `src/routes/dashboard/`
> **Offline:** ✅ Yes
> **Complexity:** High
> **Role Access:** Dean sees all programs; Chairpersons see own program only

---

## Overview

The dashboard is the central hub of the application. It displays aggregate statistics from the alumni database — **filtered by the authenticated user's role** — and serves as the entry point to all other modules. All analytics are computed from local sql.js data with `WHERE program IN (?)` clauses based on role scope.

---

## Route Structure

```
src/routes/dashboard/
├── index.tsx                       # Dashboard hub page with all analytics
├── -components/
│   ├── total-responses-card.tsx    # Total number of alumni responses (role-filtered)
│   ├── program-respondent-boxes.tsx # Individual count boxes for CE, CpE, EE
│   ├── board-passers-card.tsx      # % Board Passers with count
│   ├── employed-card.tsx           # % Employed Alumni with count
│   ├── field-related-card.tsx      # % In field-related jobs
│   ├── supervisory-card.tsx        # % In supervisory/managerial roles
│   ├── survey-response-table.tsx   # Generic table: frequency + weighted mean
│   ├── curriculum-relevance-table.tsx  # Relevance of Curriculum responses
│   ├── competencies-table.tsx      # Competencies learned responses (9 rows)
│   ├── advance-studies-table.tsx   # Pursued advance studies responses
│   ├── employment-status-table.tsx # Employment status distribution
│   ├── work-assignment-table.tsx   # Place of work assignment (regions)
│   ├── industry-sector-table.tsx   # Industry sector distribution
│   ├── first-job-table.tsx         # When & how first job obtained
│   ├── challenges-table.tsx        # Challenges faced responses
│   ├── program-dist-chart.tsx      # Bar/pie chart: alumni by program
│   ├── year-trend-chart.tsx        # Line chart: graduates over time
│   ├── employment-chart.tsx        # Employment status breakdown chart
│   └── recent-activity.tsx         # Recent additions / syncs / emails
├── -hooks/
│   ├── use-dashboard-stats.ts      # Aggregates counts + percentages (role-filtered)
│   └── use-survey-analytics.ts     # Computes frequency & weighted mean for survey tables
└── -types/
    └── analytics.types.ts          # SurveyResponseRow, WeightedMeanResult, etc.
```

---

## Role-Based Filtering

The **first step** in the dashboard data flow is applying role-based filtering:

| Role | Visible Data |
|------|-------------|
| **Dean** | All programs (CE, CpE, EE) — full aggregate stats |
| **CE Chair** | CE data only — cards show CE counts, tables show CE responses |
| **CpE Chair** | CpE data only |
| **EE Chair** | EE data only |

Filtering is applied at the SQL level via `WHERE program IN (?)` with the values from `auth.store.accessiblePrograms`.

---

## Stat Cards (Top-Level KPIs)

| Card | Description | Source Column | Query |
|------|-------------|---------------|-------|
| Total Responses | Total alumni records in scope | — | `COUNT(*) WHERE program IN (?)` |
| CE / CpE / EE Respondents | Count per program | `program` | `COUNT(*) WHERE program = ?` |
| % Board Passers | Licensed alumni percentage | `has_license` | `COUNT(has_license=1) / COUNT(*)` |
| % Employed | Currently employed % | `is_employed` | `COUNT(is_employed=1) / COUNT(*)` |
| % Field-Related | Jobs related to degree | `job_relevance` | `COUNT(job_relevance IN (...)) / COUNT(is_employed=1)` |
| % Supervisory | Supervisory/managerial roles | `job_level` | CE/EE: `job_level='Yes'`, CpE: `job_level IN (...)` |

---

## Survey Response Tables

Each table shows frequency distribution across response options, with weighted mean for Likert-scale data. **All queries include role-based program filtering.**

### Weighted Mean Formula

```
Weighted Mean = Σ(scale_value × frequency) / Σ(frequency)
```

### Tables

| Table Component | Source Column(s) | Type | Computed Values |
|-----------------|-----------------|------|-----------------|
| `curriculum-relevance-table.tsx` | `curriculum_relevance` | 1–5 Likert | Frequency, %, Weighted Mean |
| `competencies-table.tsx` | `comp_*` (9 columns) | 1–5 Likert matrix | Per-competency: freq per scale, Weighted Mean |
| `advance-studies-table.tsx` | `advanced_study_reason` | Multi-select | Frequency, % |
| `employment-status-table.tsx` | `employment_status` | Single-select | Frequency, % |
| `work-assignment-table.tsx` | `work_region` | Single-select (18 regions) | Frequency, % |
| `industry-sector-table.tsx` | `industry_sector` | Single-select (program-specific) | Frequency, % |
| `first-job-table.tsx` | `time_to_first_job`, `first_job_method` | Single-select | Frequency, % |
| `challenges-table.tsx` | `job_challenges` | Multi-select | Frequency, % |

### Competencies Table Detail (9 rows × 5 columns)

| Competency | 1 (Very Poor) | 2 (Poor) | 3 (Fair) | 4 (Good) | 5 (Excellent) | Weighted Mean |
|-----------|---|---|---|---|---|---|
| Engineering knowledge | f | f | f | f | f | WM |
| Problem-solving ability | f | f | f | f | f | WM |
| Engineering design | f | f | f | f | f | WM |
| Communication skills | f | f | f | f | f | WM |
| Teamwork & collaboration | f | f | f | f | f | WM |
| Ethics & responsibility | f | f | f | f | f | WM |
| Leadership & initiative | f | f | f | f | f | WM |
| Lifelong learning | f | f | f | f | f | WM |
| Modern tools & tech | f | f | f | f | f | WM |

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `analytics.ipc.ts` | `analytics:getDashboard`, `analytics:getSurveyTables` |
| Service | `analytics.service.ts` | Aggregate stat computations, weighted mean calculations |
| Repository | `analytics.repository.ts` | SQL aggregation queries (`COUNT`, `AVG`, `GROUP BY`) with role filter |
| Store | `analytics.store.ts` | Cached dashboard stats, survey table data |
| Store | `auth.store.ts` | `accessiblePrograms` for role-based filtering |

**Charts:** The chart components use `recharts` or `chart.js` + `react-chartjs-2` — see [overview.md](../technical/overview.md) Packages table.

---

## Data Flow

1. `index.tsx` mounts → calls `use-dashboard-stats` hook
2. Hook reads `auth.store.accessiblePrograms` for role scope
3. Hook invokes `ipcClient.analytics.getDashboard(accessiblePrograms)` via IPC
4. `analytics.ipc.ts` → `analyticsService.getDashboard(programs)`
5. Service calls `analyticsRepository` methods with `WHERE program IN (?)` for each stat card and survey table
6. Results flow back → cached in `analytics.store` → components re-render

---

## Flowchart Reference

**Analytic Dashboard** — Section 3 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

# Feature: Reports & Exports

> **Route:** `/reports` → `src/routes/reports/`
> **Offline:** ✅ Works Offline
> **Complexity:** Medium
> **Role Access:** Dean exports all programs; Chairpersons export own program only

---

## Overview

The Reports & Exports feature allows users to generate **role-filtered** alumni reports in 5 output modes — PDF, Docx, Excel, Filtered Print, and Print Preview. All generation runs in the Electron main process; the UI collects filter criteria and displays progress. Data is automatically scoped to the user's accessible programs.

---

## Route Structure

```
src/routes/reports/
├── index.tsx                       # Export type selector + filter form
├── -components/
│   ├── export-card.tsx             # Card UI per export type (PDF / Docx / Excel / Filtered Print / Preview)
│   ├── export-filter-form.tsx      # Filter: Program, Year, Specialization, Area/Location
│   ├── export-progress.tsx         # Generating... / Complete feedback indicator
│   └── print-preview.tsx           # Print-optimized alumni summary view
├── -hooks/
│   ├── use-export.ts              # Trigger export via IPC (PDF, Docx, Excel)
│   └── use-export-filters.ts      # Filter state for filtered export/print
└── -schemas/
    └── export-filter.schema.ts    # Zod schema: filter criteria validation
```

---

## Pages

### Export Dashboard (`index.tsx`)

- **Role-based filter applied first** — auto-scopes data to user's programs
- Grid of `export-card.tsx` cards — one per format (5 types)
- `export-filter-form.tsx` above the cards: Program, Year, Specialization, Area/Location
- Selecting a card triggers generation with the current filter criteria
- `export-progress.tsx` shows a spinner → success/failure message with retry

---

## 5 Export Types

### 1. PDF (`jspdf` + `jspdf-autotable`)

- Generated in Electron main process via `export.service.ts`
- Includes: header with institution name + report title, filtered alumni table with columns, stat summary section
- `dialog.showSaveDialog` prompts user for save location
- Tables auto-paginate across pages

### 2. DOCX (`docx` npm package)

- Structured document with styled headings, paragraphs, and tables
- Includes: cover info (institution, date, filters applied), alumni listing table, summary stats
- `dialog.showSaveDialog` for save location

### 3. XLSX (`exceljs`)

- Workbook with multiple sheets:
  - **Alumni Data** — Full filtered records, one row per alumnus
  - **Summary Stats** — Aggregated counts, percentages
  - **Filters Applied** — Record of which filters were used
- Column auto-width, header styling, freeze panes on first row

### 4. Filtered Print

- Select filter criteria: Program, Year, Specialization, Area/Location
- Apply filter to narrow data further within role scope
- Generate and download filtered file

### 5. Print Preview / Print

- Renders a print-optimized view of the filtered data
- Uses `@media print` styles from `styles/print.css`
- Triggered via `window.print()` or `BrowserWindow.webContents.print()`
- No file saved — direct to printer

---

## Filter Dimensions

| Dimension | Type | Source |
|-----------|------|--------|
| Program | Select | `CE`, `CpE`, `EE` (limited by role scope) |
| Year Graduated | Select / Range | Distinct years from `alumni` table |
| Specialization | Select | Program-specific specialization options |
| Area / Location | Select | Distinct `work_region` values |

Filters map to SQL `WHERE` clauses applied by `alumni.repository.ts` **on top of** the role-based program filter.

---

## Validation

- **Filter schema:** Export filters validated with Zod to ensure valid program/year/specialization combinations
- **Empty state guard:** If no records match the filters + role scope, a friendly empty state is shown instead of generating blank files
- **File path validation:** `dialog.showSaveDialog` handles valid file path selection

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `export.ipc.ts` | `export:pdf`, `export:docx`, `export:excel`, `export:filtered` |
| Service | `export.service.ts` | Generate PDF / Docx / Excel with role-filtered data |
| Repository | `alumni.repository.ts` | `findFiltered(filters, programs)` → SQL `WHERE` clauses |
| Repository | `analytics.repository.ts` | Summary stats for report headers |
| Store | `auth.store.ts` | `accessiblePrograms` for role-based filtering |

---

## Data Flow

### Export Flow

1. User selects filter criteria in `export-filter-form.tsx`
2. User clicks an export card (e.g., PDF)
3. `use-export` hook reads `auth.store.accessiblePrograms` and calls `ipcClient.export.pdf(filters, programs)`
4. `export.ipc.ts` → `exportService.generatePdf(filters, programs)`
5. Service calls `alumniRepository.findFiltered(filters, programs)` → gets role-filtered records
6. Service calls `analyticsRepository.getSummaryStats(filters, programs)` → gets aggregated stats
7. Service builds the document (jspdf / docx / exceljs)
8. Service opens `dialog.showSaveDialog` → user picks save path → writes file
9. IPC returns `{ success: true, path }` → UI shows completion message

---

## Flowchart Reference

**Reports & Export** — Section 6 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

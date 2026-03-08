# Alumni DB — Project Overview

> **Project:** Alumni DB Management System
> **Platform:** Desktop application (Windows `.exe`)
> **Date:** March 8, 2026
> **Architecture:** Electron + React (offline-first with Google Sheets sync)

---

## What Is Alumni DB?

A desktop application for managing alumni tracer study data across three engineering programs — Civil Engineering (CE), Computer Engineering (CpE), and Electrical Engineering (EE). The system collects, stores, syncs, and exports survey data gathered via Google Forms, while supporting offline-first workflows with Google Sheets synchronization. Access is controlled through role-based authentication for the Dean and Program Chairpersons.

### Core Capabilities

1. **Login & Role-Based Access** — Authenticate against accounts stored in a Google Sheets "Accounts" tab (with encrypted offline fallback). 4 roles: Dean (all programs), CE Chair, CpE Chair, EE Chair. 3-attempt lockout policy.
2. **Settings** — Configuration for SMTP email, Google Sheets connection, sync/database info (Dean-only), Google Form link, auto-sync interval, and user preferences (dark mode for all users)
3. **Analytic Dashboard** — Live role-filtered statistics: total responses, per-program counts, board passers %, employed %, field-related %, supervisory %, plus survey response tables with frequency distributions and weighted mean calculations
4. **Alumni Directory** — Full CRUD for alumni records (all questionnaire fields), search, 6-dimension filtering (Program, Year, Specialization, Area/Location, Employment Status, Board Passers), GForm-based add, view profile link
5. **Alumni Profiling** — Individual alumni profile views with 3 display modes: full response history, latest updates (highlighted), and chronological timeline
6. **Sending Emails** — Bulk email via SMTP with template variables, role-filtered recipients, GForm link inclusion option, received email tracking, and email history (completed/pending/failed)
7. **Data Sync** — Bidirectional sync with Google Sheets (pull/push/full/auto-sync), auto-sync timer, pending changes list, unpushed edits notification, conflict detection and resolution
8. **Reports & Exports** — Export as PDF, Docx, Excel; filtered print by Program/Year/Specialization/Area-Location; print preview — all role-filtered
9. **About** — 3-section view: system info (purpose, goals, version), core feature explanations (9 categories), and user-friendly manual (step-by-step guide for non-technical users)

---

## Confirmed Tech Stack

| Layer | Technology | Role |
|-------|-----------|------|
| UI Framework | React 18+ | Component-based UI, state management |
| Build Tool | Vite | Fast HMR, ES module bundling |
| Desktop Shell | Electron | Native desktop wrapper, file system access |
| Local Database | `sql.js` (SQLite compiled to WASM) | Single `.db` file — full SQL queries, no native build dependencies |
| State Management | Zustand | Lightweight global state |
| Routing | React Router v6 | Hub-and-spoke navigation (login gate → dashboard hub) |
| Styling | Tailwind CSS + shadcn/ui | UI design + accessible component primitives + dark mode |
| Forms | `react-hook-form` + `zod` | Form handling + schema validation |
| Package Manager | pnpm | Fast, disk-efficient package manager |
| Language | TypeScript | Type safety across both processes |

---

## System Requirements

| # | Feature | Offline? | Internet? | Complexity |
|---|---------|----------|-----------|------------|
| 0 | **Login & Access** — Auth against Sheets "Accounts" tab, encrypted offline fallback, 3-attempt lockout, 4 roles (Dean/CE Chair/CpE Chair/EE Chair) | ✅ (fallback) | ✅ (primary) | High |
| 1 | **Settings** — SMTP config, Sheets connection, sync/DB info (Dean-only), GForm link, auto-sync interval, preferences (dark mode) | ✅ | ❌ | Low |
| 2 | **Analytic Dashboard** — Role-filtered stats: total responses, program boxes (CE/CpE/EE), % board passers, % employed, % field-related, % supervisory, survey tables w/ frequency & weighted mean | ✅ | ❌ | High |
| 3 | **Alumni Directory** — Add (GForm)/Edit/Delete alumni (all gform fields), search, 6-dimension filter, view profile, role-filtered | ✅ | ❌ | Medium |
| 4 | **Alumni Profiling** — 3 display views (history, latest updates, timeline), role-filtered records | ✅ | ❌ | Medium |
| 5 | **Sending Emails** — Role-filtered recipients (Program/Year), compose email (subject + body), GForm link option, received emails, email history | ❌ | ✅ | High |
| 6 | **Data Sync** — Pull/Push/Full/Auto-sync with Google Sheets, pending changes, conflicts, internet status, unpushed edit alerts | ❌ | ✅ | High |
| 7 | **Reports & Exports** — Role-filtered export as PDF, Docx, .xlsx; filtered print (Program/Year/Specialization/Area); print preview | ✅ | ❌ | Medium |
| 8 | **About** — System info, core features list (9 categories), user-friendly manual (step-by-step for non-technical users) | ✅ | ❌ | Low |

### Technical Requirements

- **Role-based access** — Login gate with 4 roles controlling data scope across all modules
- **Offline-first architecture** — Works fully without internet (except email, sync, and primary login)
- **Offline auth fallback** — Encrypted local account cache for login when Sheets is unreachable
- **Local data persistence** — All alumni records stored locally via sql.js
- **Google Sheets API integration** — Bidirectional sync + Accounts tab for authentication
- **SMTP client** — Direct email sending via `nodemailer`
- **File generation** — PDF (`jspdf`), Docx (`docx`), and Excel (`exceljs`) export
- **Template engine** — Variable substitution (`{{firstName}}`, `{{program}}`, etc.) in email bodies
- **Data validation** — Form-level validation with `react-hook-form` + `zod` throughout all inputs
- **Survey analytics** — Frequency distributions and weighted means for Likert-scale and categorical responses
- **Alumni history tracking** — Versioned snapshots on every alumni record update with 3 display views
- **Auto-sync scheduling** — Configurable interval-based automatic sync (4th sync mode)
- **Unpushed changes notification** — Alert when local edits haven't been pushed
- **Hub-and-spoke navigation** — Login → Dashboard as central hub, all modules return to it
- **Dark mode** — Tailwind CSS `dark:` class support toggled via user preferences
- **Account management** — Dean can add/edit/deactivate accounts via system or spreadsheet

---

## Feature → Implementation Mapping

| Feature | Implementation Approach |
|---------|----------------------|
| Login & Access | Auth against Google Sheets "Accounts" tab via `googleapis`. Encrypted offline cache via `crypto.ts`. Bcrypt password hashing. Lockout counter + timer in `auth.store`. Role stored in session. |
| Settings | Store config in `settings` table via sql.js. Dean-only sections gated by role check. SMTP + Sheets connection config with test buttons. Dark mode toggled via Tailwind `class` strategy. |
| Analytic Dashboard | Role-filtered stat cards with `WHERE program IN (?)`. Survey tables with frequency + weighted mean via SQL aggregation. Charts via `recharts` or `chart.js`. |
| Alumni Directory | React forms with `react-hook-form` + `zod`. All gform fields (see [data-dictionary.md](data-dictionary.md)). 6-dimension filter toolbar. GForm link for Add. Role-filtered list. |
| Alumni Profiling | 3 display views: full history, latest (highlighted diffs), timeline. Versioned snapshots in `alumni_history` table. Role-filtered record access. |
| Sending Emails | `nodemailer` in Electron main via IPC. Role-filtered recipients. Template variable substitution. GForm link inclusion decision. History with completed/pending/failed status. |
| Data Sync | Google Sheets API v4 via `googleapis`. 4 modes: Pull, Push, Full Sync, Auto-Sync Timer. Timestamp/hash-based conflict detection. Notification banner for unpushed edits. |
| Export PDF | `jspdf` + `jspdf-autotable`. Role-filtered stats + directory listing. |
| Export Docx | `docx` npm package. Styled headings, tables, stats. Save via `dialog.showSaveDialog`. |
| Export Excel | `exceljs`. Workbook with multiple sheets (data, filters, summary). |
| Filtered Export & Print | SQL `WHERE` clauses by Program/Year/Specialization/Area + role filter. Print preview + `window.print()`. |
| About Page | 3-section static page: system info, feature list (9 items), user-friendly manual with step-by-step guides and FAQs for non-technical users. |

---

## Packages — installed via `pnpm`

| Category | Package | Purpose |
|----------|---------|---------||
| **Desktop** | `electron` | Desktop shell |
| **Build** | `vite`, `@vitejs/plugin-react` | Fast bundling + HMR |
| **Electron+Vite** | `electron-vite` or `vite-plugin-electron` | Integrates Vite with Electron |
| **Forms** | `react-hook-form` | Performant form handling |
| **Validation** | `zod` | Schema validation (alumni fields, settings, login, accounts) |
| **Routing** | `react-router-dom` | Hub-and-spoke navigation |
| **Charts** | `recharts` or `chart.js` + `react-chartjs-2` | Dashboard stats visualization |
| **Email** | `nodemailer` | SMTP email sending |
| **Google API** | `googleapis` | Google Sheets API v4 (sync + accounts) |
| **PDF** | `jspdf` + `jspdf-autotable` | PDF generation with tables |
| **Docx** | `docx` | .docx generation (paragraphs, tables, styles) |
| **Excel** | `exceljs` | .xlsx generation with multiple tabs |
| **Local DB** | `sql.js` | SQLite compiled to WASM — single `.db` file, full SQL, no native build |
| **State** | `zustand` | Lightweight global state |
| **UI** | `shadcn/ui` + `@radix-ui` | Accessible component primitives |
| **Auth** | `bcryptjs` or `argon2` | Password hashing for account auth |

### Core Library Versions

| Library | Version | Layer |
|---------|---------|-------|
| React | ^18.x.x | Renderer |
| React DOM | ^18.x.x | Renderer |
| TypeScript | ^5.x.x | Both |
| Tailwind CSS | ^3.x.x | Renderer |
| shadcn/ui | Latest | Renderer |
| Zod | ^3.x.x | Both |
| React Router | ^6.x.x | Renderer |
| React Hook Form | Latest | Renderer |
| Zustand | ^4.x.x | Renderer |
| Electron | Latest LTS | Main |
| sql.js | Latest | Main |
| Vite | Latest | Build |

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [architecture.md](architecture.md) | Project structure, naming conventions, layers, architecture principles, data flow |
| [database.md](database.md) | sql.js details, crash protection, atomic save, schema |
| [data-dictionary.md](data-dictionary.md) | Questionnaire fields → DB columns → form mapping |
| [alumni-db-flowcharts.md](alumni-db-flowcharts.md) | System flowcharts v2.0 (10 modules) |
| [alumni-db-flowcharts-v2-5.html](alumni-db-flowcharts-v2-5.html) | Interactive HTML flowcharts |
| [alumni-db-system-flowchart-1.md](alumni-db-system-flowchart-1.md) | End-to-end operational flowchart (v1) |
| [proposed_sitemap_by_client.md](proposed_sitemap_by_client.md) | Original client feature requirements |
| [features/login.md](features/login.md) | Login & role-based access |
| [features/dashboard.md](features/dashboard.md) | Dashboard analytics feature |
| [features/alumni.md](features/alumni.md) | Alumni directory & CRUD |
| [features/profiling.md](features/profiling.md) | Alumni profiling & history |
| [features/email.md](features/email.md) | Email sending & history |
| [features/sync.md](features/sync.md) | Data synchronization |
| [features/reports.md](features/reports.md) | Reports & export |
| [features/settings.md](features/settings.md) | Settings & configuration |
| [features/about.md](features/about.md) | About page |

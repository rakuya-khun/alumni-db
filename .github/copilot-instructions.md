# Alumni DB — GitHub Copilot Instructions

> This file provides project context for GitHub Copilot and AI coding agents.
> It is automatically read when working in this repository.

---

## Project Summary

**Alumni DB Management System** — An offline-first Electron desktop application (Windows `.exe`) for managing, analyzing, and exporting alumni survey data from three engineering programs (CE, CpE, EE) at **Southern Luzon State University (SLSU), College of Engineering**. The system supports **PTC-ACBET accreditation by 2027** through Outcome-Based Education (OBE) evaluation.

Data is collected via Google Forms, stored locally in sql.js, and synced with Google Sheets. Access is controlled through role-based authentication with 4 roles (Dean, CE Chair, CpE Chair, EE Chair), with accounts stored in a Google Sheets "Accounts" tab and an encrypted offline login fallback.

**Year constraint:** Only alumni who graduated **2018 or later** (5-year post-graduation evaluation window). Enforced in Zod schemas and service layer.

**4 OBE KPIs:** % Board Passers, % Employed, % Field-Related Employment, % Supervisory/Managerial.

---

## Tech Stack

| Layer | Technology | Version |
|-------|-----------|--------|
| Desktop Shell | Electron | 33.2.0 |
| Bundler | electron-vite | 5.0.0 |
| Frontend | React + TypeScript | 18.3.1 + 5.7.2 |
| Routing | react-router-dom (login gate → hub-and-spoke) | 6.28.0 |
| State | Zustand | 4.5.5 |
| Styling | Tailwind CSS (`darkMode: 'class'`) + class-variance-authority + clsx + tailwind-merge | 3.4.17 |
| Forms | react-hook-form + zod | 7.54 + 3.24 |
| Database | sql.js (SQLite WASM) — single `.db` file | 1.11.0 |
| Charts | recharts | 2.15.0 |
| Email | nodemailer (SMTP) | 6.9.16 |
| Google API | googleapis (Sheets API v4) | 144.0.0 |
| Auth | bcryptjs (hashing) + AES-256-GCM (offline cache) | 2.4.3 |
| Exports | jspdf + jspdf-autotable (PDF), docx (DOCX), exceljs (XLSX) | 2.5.2 + 3.8.4, 9.1.1, 4.4.0 |
| Icons | lucide-react | 0.577.0 |
| Package Manager | pnpm | — |

> **Note:** `class-variance-authority`, `clsx`, and `tailwind-merge` are already installed. Radix UI primitives (`@radix-ui/react-dialog`, `@radix-ui/react-tabs`, etc.) are optional — can use custom Tailwind components instead.

---

## Architecture Pattern

**Feature-Sliced Design** + **Clean Architecture** separation.

- `src/` — Renderer process (React UI, state, routing)
- `electron/` — Main process (Node.js backend: database, IPC, auth, integrations)
- `shared/` — Contracts between both processes (types, schemas, IPC channel names)
- Communication: **IPC only** — renderer never imports from `electron/` directly

### Key Patterns

| Pattern | Where |
|---------|-------|
| Repository Pattern | `electron/database/*.repository.ts` — all SQL goes here |
| Service Layer | `electron/services/*.service.ts` — business logic, never touches DB directly |
| Adapter Pattern | `electron/integrations/` — Google Sheets, Accounts, SMTP isolated behind adapters |
| Atomic Write-Rename | `electron/database/db-manager.ts` — crash-safe saves: `.tmp` → `.bak` → `.db` |
| Role-Based Scoping | `auth.store.accessiblePrograms` → `WHERE program IN (?)` on all data queries |

---

## Layout System (Donezo Template Adaptation)

The UI layout is adapted from the **Donezo** project management dashboard template.

### Global Shell (Every Authenticated Page)

```
┌──────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌────────────────────────────────────┐  │
│ │ SIDEBAR   │ │ TOP BAR: [Search] [🔔] [👤 User]  │  │
│ │           │ ├────────────────────────────────────┤  │
│ │ Logo      │ │ MAIN CONTENT                      │  │
│ │ ──────    │ │ Page Title    [Action Buttons]     │  │
│ │ MENU      │ │                                    │  │
│ │ Dashboard │ │ ┌────────┐ ┌────────┐ ┌────────┐  │  │
│ │ ──────    │ │ │ Card 1 │ │ Card 2 │ │ Card 3 │  │  │
│ │ ALUMNI    │ │ └────────┘ └────────┘ └────────┘  │  │
│ │ Directory │ │                                    │  │
│ │ Profiling │ │ ┌──────────────┐ ┌──────────┐     │  │
│ │ ──────    │ │ │ Chart/Table  │ │ Sidebar  │     │  │
│ │ TOOLS     │ │ └──────────────┘ └──────────┘     │  │
│ │ Sync      │ │                                    │  │
│ │ Email     │ └────────────────────────────────────┘  │
│ │ Reports   │                                        │
│ │ ──────    │                                        │
│ │ SYSTEM    │                                        │
│ │ Settings  │                                        │
│ │ Help      │                                        │
│ │ [Logout]  │                                        │
│ └──────────┘                                         │
└──────────────────────────────────────────────────────┘
```

### Sidebar (`src/layouts/sidebar.tsx`)

- **Width:** `w-64` expanded, `w-16` collapsed (stored in `ui.store.ts`)
- **Logo area:** Image slot (fallback: text "Alumni DB"). Logo file in `resources/`.
- **Nav groups:** MENU (Dashboard) → ALUMNI (Directory, Profiling) → TOOLS (Sync, Email, Reports) → SYSTEM (Settings, Help)
- **Active state:** Accent background + bold text on current route
- **Badge support:** Pending sync count on "Data Sync" item
- **Collapse:** Icon-only mode with tooltips on hover
- **Logout:** Button at bottom of sidebar

### Top Bar (`src/layouts/top-bar.tsx`)

- **Search:** Global alumni search input
- **Notifications:** Bell icon with pending sync/alert count
- **User info:** Avatar placeholder + full name + role badge (e.g., "Dean", "CE Chair")

### Card Patterns

| Pattern | Tailwind Classes |
|---------|------------------|
| Standard card | `rounded-xl border bg-card dark:bg-card p-6 shadow-sm` |
| Highlighted card | `rounded-xl bg-primary text-primary-foreground p-6 shadow-sm` |
| Stat card row | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` |
| Mixed grid | `grid grid-cols-1 lg:grid-cols-3 gap-4` |
| Page header | `flex items-center justify-between mb-6` |

> Desktop-only app (Electron). Minimum width 1024px. No mobile breakpoints needed.

---

## Theming System

### Architecture

```
Toggle click → ui.store.toggleDarkMode() → <html class="dark"> toggles
                                          → Tailwind dark: variants apply
                                          → settings table persists preference
```

### Design Tokens (CSS Custom Properties in `src/styles/globals.css`)

All colors are defined as CSS custom properties in `@layer base` for easy palette swapping:

- `:root` = light mode, `.dark` = dark mode
- Token groups: `--color-bg-*`, `--color-sidebar-*`, `--color-accent*`, `--color-text-*`, `--color-card-*`, `--color-chart-*`, `--color-success/warning/error/info`
- **Accent color** is **Maroon #9B2335** (SLSU College of Engineering brand). CSS values: `--color-accent: 155 35 53`, `--color-accent-light: 192 75 92`

### Tailwind Extension

`tailwind.config.ts` extends `theme.colors` with semantic names that reference CSS variables:

- `primary` / `primary-light` / `primary-foreground` → accent colors
- `sidebar-bg` / `sidebar-text` / `sidebar-hover` → sidebar colors
- `surface-primary` / `surface-secondary` / `surface-tertiary` → backgrounds
- `card` / `card-border` → card colors

### When Generating Components

- Use semantic color classes (`bg-primary`, `text-sidebar-text`, `bg-surface-secondary`) instead of raw Tailwind colors (`bg-red-800`)
- Always include `dark:` variants OR use the CSS variable-based semantic classes (which auto-switch)
- The theme auto-adapts when CSS variables change — no component edits needed for rebranding

### UX for Non-IT Faculty Users (HIGH PRIORITY)

Users are non-technical faculty (Dean, Chairpersons). Every component must:

- Use **large click targets** (min `h-10 px-6` buttons, `h-10 w-10` icon buttons)
- Always show **text labels** on buttons (not icon-only)
- Use **plain language** — no jargon, no technical terms
- Show **confirmation dialogs** on destructive actions ("Are you sure?" with clear consequences)
- Give **visual feedback** on every action — loading spinners, success toasts, error messages with recovery steps
- Maintain **generous spacing** — `gap-4`+ between sections, `p-6` card padding
- Use **status indicators** with color + icon + text (never color-alone)
- Keep layouts **visually calm** — progressive disclosure, no cluttered screens

---

## Naming Conventions

| Convention | Usage | Examples |
|-----------|-------|---------|
| `kebab-case` | All folders and files | `alumni-form.tsx`, `email-history/` |
| `_kebab-case` | Feature domain modules (`src/features/`) | `_components/`, `_hooks/`, `_types/` |
| `-kebab-case` | Route domain modules (`src/routes/`) | `-components/`, `-hooks/`, `-types/` |
| `PascalCase` | Types, interfaces, React components, classes | `Alumni`, `SmtpSettings`, `AlumniForm` |
| `snake_case` | Database tables and columns | `alumni`, `email_history`, `sync_status` |
| `camelCase` | Functions, variables, hooks, Zod schemas | `useAlumni`, `alumniSchema`, `formatDate` |

---

## File Structure Rules

### Route modules (`src/routes/<name>/`)
- Each route folder has an `index.tsx` as the page entry
- Route-specific modules use `-` prefix: `-components/`, `-hooks/`, `-schemas/`, `-types/`, `-utils/`
- Route modules should NOT import from other routes

### Feature modules (`src/features/<name>/`) — optional
- Only create when logic is shared across multiple routes
- Feature-specific modules use `_` prefix: `_components/`, `_hooks/`, `_types/`
- Feature modules should NOT import from routes

### Shared modules (`src/`)
- Global shared code lives directly under `src/`: `components/`, `hooks/`, `stores/`, `types/`, `utils/`, `lib/`
- UI primitives: `src/components/ui/` (shadcn/ui)
- App-specific shared components: `src/components/shared/`

### Backend (`electron/`)
- `electron/database/` — Repositories (SQL), db-manager, schema, migrations
- `electron/services/` — Business logic (auth, alumni, sync, export, etc.)
- `electron/ipc/` — IPC handlers (thin: validate → call service → return)
- `electron/integrations/` — External API adapters (Sheets, Accounts, SMTP)
- `electron/utils/` — Electron utilities (logger, crypto, network)
- `electron/config/` — Constants, paths, environment

### Shared contracts (`shared/`)
- `shared/ipc-channels.ts` — All IPC channel name constants
- `shared/types/` — Types used by both processes
- `shared/schemas/` — Zod schemas used by both processes (alumni, settings, login, account)

---

## Import Rules

1. Routes can import: own `-` modules, shared `src/` modules, `shared/` types
2. Features can import: own `_` modules, shared `src/` modules, `shared/` types
3. Routes must NOT import from other routes
4. Features must NOT import from routes
5. Services import from repositories and integrations — never from IPC or UI
6. Repositories import only `db-manager.ts` and types
7. IPC handlers import only services — they are thin wrappers
8. Both processes import from `shared/` — never from each other

---

## Database

- **Engine:** sql.js (SQLite WASM) — no native bindings needed
- **File:** Single `alumni.db` on disk
- **Tables:** `alumni`, `alumni_history`, `email_history`, `settings`, `meta`
- **Accounts:** Stored in Google Sheets "Accounts" tab (NOT in local DB)
- **Offline Auth Cache:** Encrypted file at `{userData}/auth-cache.enc`
- **Crash protection:** Atomic write-rename (`.tmp` → `.bak` → `.db`)
- **Migrations:** `electron/database/migrations/` — tracked by `meta` table version
- **Column naming:** `snake_case` (e.g., `full_name`, `year_graduated`, `sync_status`)

---

## IPC Channels

All IPC communication uses `ipcRenderer.invoke` / `ipcMain.handle` (async request-response). Channel names are defined in `shared/ipc-channels.ts`. Pattern:

```
domain:action
```

Examples: `auth:login`, `auth:logout`, `auth:getSession`, `auth:getAccounts`, `auth:createAccount`, `auth:updateAccount`, `alumni:getAll`, `alumni:create`, `sync:pull`, `settings:save`, `export:pdf`, `system:getVersion`

---

## Key Domain Concepts

- **Programs:** CE (Civil Engineering), CpE (Computer Engineering), EE (Electrical Engineering)
- **Roles:** Dean (all programs, full admin), CE Chair (CE only), CpE Chair (CpE only), EE Chair (EE only)
- **Accounts:** Stored in Google Sheets "Accounts" tab with username, hashed password, role, full_name, is_active, created_at, last_login
- **Offline Auth:** On first online login, account is encrypted and cached locally for offline fallback
- **Lockout Policy:** 3 failed login attempts → 5-minute lockout
- **Questionnaire fields:** ~58 columns per alumni record mapped from Google Form responses
- **Competency ratings:** 9 Likert-scale items (1–5), used for weighted mean calculations
- **Sync status:** Each alumni record has `sync_status` (`pending` | `synced` | `conflict`) tracked locally
- **History snapshots:** On every alumni UPDATE, a snapshot is inserted into `alumni_history`
- **Settings gate:** After login, the app redirects to `/settings` until SMTP + Sheets are configured
- **Dark mode:** Tailwind `darkMode: 'class'` strategy, toggled via user preferences

---

## Routes (Login Gate → Hub-and-Spoke)

```
/login                          → LoginPage (standalone, no sidebar)
<AuthGuard>
  <SettingsGuard>               → Redirects to /settings if SMTP+Sheets not configured
    <AppLayout>                 → Sidebar + TopBar + Main content
      /                         → DashboardPage
      /alumni                   → AlumniDirectoryPage
      /alumni/add               → AlumniAddPage
      /alumni/edit/:id          → AlumniEditPage
      /profiling                → ProfilingListPage
      /profiling/:id            → ProfileDetailPage
      /sync                     → SyncPage
      /email                    → EmailHubPage
      /email/compose            → EmailComposePage
      /email/history            → EmailHistoryPage
      /email/received           → EmailReceivedPage
      /reports                  → ReportsPage
      /settings                 → SettingsPage
      /help                     → HelpPage
      /about                    → AboutPage
    </AppLayout>
  </SettingsGuard>
</AuthGuard>
```

| Path | Feature | Role Access |
|------|---------|-------------|
| `/login` | Login & Authentication | All (entry point, standalone layout) |
| `/` | Dashboard (hub) — stat cards, KPI charts, survey tables | Role-filtered |
| `/alumni` | Alumni Directory — data table, search, filter, sort | Role-filtered |
| `/alumni/add` | Add Alumni — full 7-section form | Role-filtered |
| `/alumni/edit/:id` | Edit Alumni — pre-filled form, creates history snapshot | Role-filtered |
| `/profiling` | Alumni Profiling — search/browse alumni profiles | Role-filtered |
| `/profiling/:id` | Profile Detail — 3 tabs: History, Latest Updates, Timeline | Role-filtered |
| `/sync` | Data Synchronization — Pull/Push/Full/Auto-Sync, conflict resolution | All |
| `/email` | Email Hub — links to compose, history, received | Role-filtered recipients |
| `/email/compose` | Compose Email — filter recipients, template vars, preview | Role-filtered |
| `/email/history` | Email History — sent emails log | All |
| `/email/received` | Received Emails — manual response log | All |
| `/reports` | Reports & Exports — PDF, DOCX, XLSX with filters | Role-filtered |
| `/settings` | Settings — SMTP, Sheets, accounts, preferences | Dean: full, Chair: preferences |
| `/help` | Help — 3 tabs: User Manual, FAQ, Troubleshooting | All |
| `/about` | About — system info, features, condensed manual | All |

---

## Current Implementation Status

> **~95% of files are empty scaffolds.** Only config files have content. All implementation is ahead.

### Files With Content (Working)

| File | Status |
|------|--------|
| `electron.vite.config.ts` | ✅ 3-target config, `@/` alias, React plugin |
| `electron-builder.yml` | ✅ NSIS installer, sql-wasm.wasm bundled |
| `electron/preload.ts` | ✅ contextBridge with invoke/on |
| `tsconfig.json` + `tsconfig.electron.json` + `tsconfig.renderer.json` | ✅ Correct references |
| `tailwind.config.ts` | ✅ `darkMode: 'class'`, content paths set |
| `postcss.config.js` | ✅ Tailwind + Autoprefixer |
| `index.html` | ✅ SPA entry with `<div id="root">` |
| `src/main.tsx` | ✅ StrictMode + createRoot + globals.css import |
| `src/styles/globals.css` | ⚠️ Has 3 Tailwind directives — needs CSS custom properties added |

### Files Needing Enhancement

| File | Current | Needed |
|------|---------|--------|
| `electron/main.ts` | Bare `createWindow()` | `setupErrorHandlers()` → `initDb()` → `registerIpcHandlers()` → `createWindow()` |
| `src/App.tsx` | Placeholder div | `<ThemeProvider><BrowserRouter><Routes>...</Routes></BrowserRouter></ThemeProvider>` |
| `tailwind.config.ts` | Base config | Extend `theme.colors` with semantic CSS variable references |

### Empty Scaffold Directories (~216 files, all 0 bytes)

`electron/config/`, `electron/database/`, `electron/integrations/`, `electron/ipc/`, `electron/services/`, `electron/types/`, `electron/utils/`, `shared/types/`, `shared/schemas/`, `src/stores/`, `src/app/`, `src/routes/` (128 files across 9 subdirs), `src/layouts/`, `src/lib/`, `src/data/`, `src/hooks/`, `src/types/`, `src/contexts/`, `src/components/`

---

## Asset Readiness (Pending from Client)

| Asset | Where It Goes | Current Fallback |
|-------|--------------|------------------|
| **App Logo** (PNG/SVG) | `resources/logo.png` + `resources/logo-dark.png` | Text "Alumni DB" in sidebar |
| **App Icon** (.ico) | `resources/icon.ico` → electron-builder.yml | Default Electron icon |
| **Color Palette** | CSS custom properties in `globals.css` | **Maroon #9B2335** — finalized |
| **Institution Logo** (optional) | Report headers (PDF/DOCX) | Text "SLSU College of Engineering" |

**When assets arrive:** Change only `sidebar.tsx` (logo image) + `resources/` (icon files). Colors are finalized — no CSS changes needed.

---

## Documentation

For detailed information, see the `docs/` folder:

### Implementation Plan (START HERE)

- [docs/FINAL-IMPLEMENTATION-PLAN.md](../docs/FINAL-IMPLEMENTATION-PLAN.md) — **229 items, 12 phases.** Complete implementation blueprint with every file, component, hook, and schema listed. Includes layout system, theming, design tokens, route tree, and phase-by-phase build order.
- [docs/IMPROVEMENT-PLAN.md](../docs/IMPROVEMENT-PLAN.md) — Original gap analysis (63 items, 10 phases). Superseded by FINAL plan but useful for understanding the original audit.

### Technical Docs

- [docs/technical/overview.md](../docs/technical/overview.md) — Tech stack, requirements, feature mapping
- [docs/technical/architecture.md](../docs/technical/architecture.md) — Project structure, naming, layers, data flow
- [docs/technical/database.md](../docs/technical/database.md) — sql.js, schema, crash protection, key queries
- [docs/technical/data-dictionary.md](../docs/technical/data-dictionary.md) — Questionnaire → DB column mapping (~58 columns)
- [docs/technical/alumni-db-flowcharts.md](../docs/technical/alumni-db-flowcharts.md) — System flowcharts (v2.0, 10 modules)

### Feature Docs

- [docs/features/](../docs/features/) — Per-feature specifications: login, dashboard, alumni, profiling, email, sync, reports, settings, about, **help** (User Manual, FAQ, Troubleshooting)

### Client Documents

- [docs/client/pdf-extracted.txt](../docs/client/pdf-extracted.txt) — Extracted thesis text (Revised Ch 1-3, 46 pages)
- `docs/client/` also contains the 3 questionnaire DOCX files (CE, CpE, EE)

---

## Code Generation Guidelines

When generating code for this project:

1. **Always use TypeScript** — `.ts` for logic, `.tsx` for React components
2. **Use `kebab-case` filenames** — never `camelCase` or `PascalCase` for files
3. **Prefix route modules with `-`** and feature modules with `_`
4. **Use Zustand for state** — no Redux, no Context for global state
5. **Use react-hook-form + zod for forms** — no uncontrolled forms, no manual validation
6. **Use semantic color classes** — `bg-primary`, `text-sidebar-text`, `bg-surface-secondary` (from CSS variables), NOT raw `bg-green-800`
7. **SQL in repositories only** — services call repositories, never run SQL directly
8. **IPC handlers are thin** — validate input, call service, return result
9. **Encrypt sensitive data** — SMTP passwords and auth cache encrypted via `electron/utils/crypto.ts`
10. **Atomic saves** — always use `safeSave()` from `db-manager.ts`, never raw `writeFileSync`
11. **Role-based filtering** — always apply `WHERE program IN (?)` from `auth.store.accessiblePrograms`
12. **Dark mode support** — use Tailwind `dark:` variants on all new components, or use CSS variable-based semantic classes that auto-switch
13. **Validate all inputs** — Zod schemas for every form (login, alumni, settings, accounts, export filters)
14. **Year constraint** — `year_graduated >= 2018` enforced in Zod schemas and service layer
15. **Card-based layout** — all content sections use `rounded-xl border shadow-sm p-6` card pattern from the Donezo template
16. **Follow the implementation plan** — see `docs/FINAL-IMPLEMENTATION-PLAN.md` for the exact file list, phase order, and component breakdown (229 items, 12 phases)

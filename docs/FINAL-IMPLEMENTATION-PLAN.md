# Alumni DB — Final Implementation Plan

> **Project:** Alumni Database System for Outcome-Based Evaluation and Institutional Networking
> **Institution:** Southern Luzon State University (SLSU), College of Engineering
> **Accreditation Target:** PTC-ACBET by 2027
> **Programs:** BSCE (Civil), BSCpE (Computer), BSEE (Electrical)
> **Date:** March 9, 2026

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Electron Setup Verification](#2-electron-setup-verification)
3. [UI/UX Layout System](#3-uiux-layout-system)
4. [Theming System](#4-theming-system)
5. [Complete File Inventory](#5-complete-file-inventory)
6. [Implementation Phases](#6-implementation-phases)
   - [Phase 1: Foundation — Error Handling, Config & Logger](#phase-1)
   - [Phase 2: Electron Main Process](#phase-2)
   - [Phase 3: Database Layer](#phase-3)
   - [Phase 4: IPC Contract & Registration](#phase-4)
   - [Phase 5: Service Layer & Integrations](#phase-5)
   - [Phase 6: Shared Types, Schemas & Frontend Stores](#phase-6)
   - [Phase 7: Theming, Layout Shell & Router](#phase-7)
   - [Phase 8: Page Implementations — Overview Group](#phase-8)
   - [Phase 9: Page Implementations — Alumni Group](#phase-9)
   - [Phase 10: Page Implementations — Tools Group](#phase-10)
   - [Phase 11: Page Implementations — System Group](#phase-11)
   - [Phase 12: Smoke Tests & Build](#phase-12)
7. [Implementation Priority](#7-implementation-priority)
8. [Design Tokens & Asset Readiness](#8-design-tokens--asset-readiness)

---

## 1. Project Overview

### What We're Building

An offline-first desktop application (Electron + React) that manages alumni tracer data for 3 engineering programs. The system:

- Stores ~58-field alumni records locally in sql.js (SQLite WASM)
- Syncs bidirectionally with Google Sheets (pull/push/full/auto-sync)
- Computes OBE KPIs: % board passers, % employed, % field-related, % supervisory
- Sends bulk emails via SMTP with template variables
- Exports reports in PDF, DOCX, XLSX
- Enforces role-based access (Dean = all programs, Chairperson = own program)

### Tech Stack (Verified from package.json)

| Layer | Technology | Version |
|-------|-----------|---------|
| Shell | Electron | 33.2.0 |
| Bundler | electron-vite | 5.0.0 |
| Renderer | React | 18.3.1 |
| Language | TypeScript | 5.7.2 |
| Styling | Tailwind CSS | 3.4.17 |
| State | Zustand | 4.5.5 |
| Forms | react-hook-form + zod | 7.54 + 3.24 |
| Router | react-router-dom | 6.28.0 |
| Database | sql.js | 1.11.0 |
| Charts | recharts | 2.15.0 |
| PDF | jspdf + jspdf-autotable | 2.5.2 + 3.8.4 |
| DOCX | docx | 9.1.1 |
| Excel | exceljs | 4.4.0 |
| Email | nodemailer | 6.9.16 |
| Cloud | googleapis | 144.0.0 |
| Auth | bcryptjs | 2.4.3 |

---

## 2. Electron Setup Verification

### ✅ Verified & Correct (No Changes Needed)

| File | Status | Notes |
|------|--------|-------|
| `electron.vite.config.ts` | ✅ | 3-target config (main, preload, renderer). `@/` alias resolves to `src/`. React plugin loaded. |
| `electron-builder.yml` | ✅ | `appId: com.alumni-db.app`, NSIS installer, `sql-wasm.wasm` in extraResources |
| `electron/preload.ts` | ✅ | `contextBridge.exposeInMainWorld('electronAPI', { invoke, on })` — correct IPC bridge |
| `tsconfig.json` | ✅ | References both renderer and electron configs |
| `tsconfig.electron.json` | ✅ | ES2022, CommonJS module, strict, includes `electron/` + `shared/` |
| `tsconfig.renderer.json` | ✅ | ES2022, ESNext module, bundler resolution, `@/*` paths, includes `src/` |
| `tailwind.config.ts` | ✅ | `darkMode: 'class'` — already configured for theme toggle |
| `postcss.config.js` | ✅ | Tailwind + Autoprefixer |
| `index.html` | ✅ | Standard SPA entry, `<div id="root">`, module script to `src/main.tsx` |
| `src/main.tsx` | ✅ | StrictMode, createRoot, imports `globals.css` |
| `src/styles/globals.css` | ✅ | 3 Tailwind directives (`@tailwind base/components/utilities`) |
| `package.json` | ✅ | All dependencies present, scripts: `dev`, `build`, `build:exe` |

### ⚠️ Needs Implementation (Has Content but Incomplete)

| File | Current State | What's Needed |
|------|--------------|---------------|
| `electron/main.ts` | Bare `createWindow()` only | Add: `setupErrorHandlers()` → `await initDb()` → `registerIpcHandlers()` before `createWindow()` |
| `src/App.tsx` | Placeholder centered text | Replace with `<ThemeProvider><AppRouter /></ThemeProvider>` |

### ❌ Empty Scaffolds (170+ Files)

All files in `electron/config/`, `electron/database/`, `electron/integrations/`, `electron/ipc/`, `electron/services/`, `electron/types/`, `electron/utils/`, `shared/`, `src/stores/`, `src/app/`, `src/routes/`, `src/layouts/`, `src/lib/`, `src/data/`, `src/hooks/`, `src/types/` are **0-byte empty files** ready for implementation.

### Missing from package.json

| Package | Purpose | Install Command |
|---------|---------|----------------|
| ~~`lucide-react`~~ | ~~Icon library for sidebar & UI~~ | ✅ Installed |
| `@radix-ui/react-dialog` | Accessible dialog/modal primitives | `pnpm add @radix-ui/react-dialog` |
| `@radix-ui/react-dropdown-menu` | Accessible dropdown menus | `pnpm add @radix-ui/react-dropdown-menu` |
| `@radix-ui/react-tabs` | Accessible tab components | `pnpm add @radix-ui/react-tabs` |
| `@radix-ui/react-accordion` | Accessible accordion for Help/FAQ | `pnpm add @radix-ui/react-accordion` |
| `@radix-ui/react-tooltip` | Tooltips for collapsed sidebar | `pnpm add @radix-ui/react-tooltip` |

> **Note:** These are optional but recommended. The UI can be built with pure Tailwind + custom components if preferred.

---

## 3. UI/UX Layout System

### Template Reference

Adapted from the **Donezo** project management dashboard template. Key layout patterns:

### Global Shell (Every Authenticated Page)

```
┌──────────────────────────────────────────────────────────┐
│ ┌──────────┐ ┌──────────────────────────────────────────┐│
│ │           │ │  TOP BAR                                 ││
│ │           │ │  [Search]          [🔔] [👤 User Name]  ││
│ │  SIDEBAR  │ ├──────────────────────────────────────────┤│
│ │           │ │                                          ││
│ │  Logo     │ │  MAIN CONTENT AREA                      ││
│ │           │ │                                          ││
│ │  ──────── │ │  Page Title          [Action Buttons]   ││
│ │  MENU     │ │  Subtitle / Description                 ││
│ │  Dashboard│ │                                          ││
│ │           │ │  ┌────────┐ ┌────────┐ ┌────────┐       ││
│ │  ALUMNI   │ │  │ Card 1 │ │ Card 2 │ │ Card 3 │       ││
│ │  Directory│ │  └────────┘ └────────┘ └────────┘       ││
│ │  Profiling│ │                                          ││
│ │           │ │  ┌─────────────────┐ ┌─────────────┐    ││
│ │  TOOLS    │ │  │  Larger Card    │ │ Side Card   │    ││
│ │  Sync     │ │  │  (chart/table)  │ │             │    ││
│ │  Email    │ │  └─────────────────┘ └─────────────┘    ││
│ │  Reports  │ │                                          ││
│ │           │ │                                          ││
│ │  ──────── │ │                                          ││
│ │  SYSTEM   │ │                                          ││
│ │  Settings │ │                                          ││
│ │  Help     │ │                                          ││
│ │  Logout   │ │                                          ││
│ └──────────┘ └──────────────────────────────────────────┘│
└──────────────────────────────────────────────────────────┘
```

### Sidebar (Fixed Left — `src/layouts/sidebar.tsx`)

| Element | Detail |
|---------|--------|
| **Logo area** | App logo + "Alumni DB" text (or collapsed: icon only). Logo image path ready in `resources/`. |
| **Group: MENU** | Dashboard |
| **Group: ALUMNI** | Alumni Directory, Alumni Profiling |
| **Group: TOOLS** | Data Sync, Sending Emails, Reports & Exports |
| **Group: SYSTEM** | Settings, Help |
| **Logout** | Logout button at sidebar bottom |
| **Collapse** | Sidebar collapses to icon-only mode. Tooltips on hover when collapsed. |
| **Active indicator** | Active page highlighted with accent background + bold text (like template's Dashboard item) |
| **Badge** | Optional notification badge (e.g., pending sync count on "Data Sync") |

**Sidebar width:** `w-64` expanded, `w-16` collapsed. Stored in `ui.store.ts`.

### Top Bar (Fixed Top — `src/layouts/top-bar.tsx`)

| Element | Detail |
|---------|--------|
| **Search** | Global search input with `⌘F` shortcut hint (searches alumni directory) |
| **Notifications** | Bell icon — sync status, unread alerts (pending sync count) |
| **User info** | User avatar placeholder + full name + role badge (e.g., "Dean", "CE Chair") |

### Main Content Area

| Pattern | Tailwind Classes | Usage |
|---------|-----------------|-------|
| Page header | `flex items-center justify-between mb-6` | Title left, action buttons right |
| Stat cards row | `grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4` | Dashboard KPIs |
| Card | `rounded-xl border bg-white dark:bg-gray-800 p-6 shadow-sm` | All cards |
| Highlighted card | Same + `bg-primary text-white` | First stat card (total responses) |
| Mixed grid | `grid grid-cols-1 lg:grid-cols-3 gap-4` | Dashboard below stat cards |
| Full-width card | `col-span-full` or `lg:col-span-2` | Tables, charts |
| Data table | Full-width card with `<table>` inside | Alumni directory, email history |

### Responsive Breakpoints

| Breakpoint | Layout |
|------------|--------|
| `< md` (640px) | N/A — desktop app, min width 1024px |
| `md` (768px) | 2-column grids |
| `lg` (1024px) | Full 3–4 column grids |
| `xl` (1280px) | Comfortable spacing, default window size |

> **Note:** Since this is Electron (desktop only), we target `≥ 1024px` minimum. No mobile breakpoints needed.

### UX Guidelines for Non-IT Faculty Users

The primary users (Dean, CE/CpE/EE Chairpersons) are **non-technical faculty members** unfamiliar with desktop apps, syncing, or databases. Every UI decision must prioritize **clarity over cleverness**. This is a grading criterion — aim for a **high UI/UX score**.

| Principle | Implementation | Example |
|-----------|---------------|---------|
| **Large click targets** | Minimum 44×44px touch/click targets. Buttons `h-10 px-6`, icons `h-10 w-10` | No tiny icons or cramped toolbars |
| **Clear labels** | Every button has a text label (not icon-only). Tooltips on icon-only actions | "Save Record" not just 💾 |
| **No jargon** | Plain language everywhere. "Spreadsheet" not "Google Sheets API". "Upload changes" not "Push" | Sidebar label "Upload to Spreadsheet" in sync area |
| **Confirmation dialogs** | All destructive actions (delete, overwrite) show a confirmation with clear consequences | "This will permanently delete John Doe's record. This cannot be undone." |
| **Reassuring messages** | Success toasts and inline messages after every action | "Record saved successfully ✓", "Your data is safe — it's backed up automatically" |
| **Simple sentences** | 1–2 sentences per instruction or description. No compound or nested instructions | "Click Save. Your changes are stored." |
| **Consistent patterns** | Same layout/flow for every similar page. Forms always top-down, buttons always bottom-right | All "Add" buttons are top-right, all "Save"/"Cancel" are bottom-right |
| **Visual feedback** | Loading spinners, progress bars, disabled-during-save states | Sync page shows real-time progress bar during sync |
| **Error recovery** | Every error message includes a **what to do next** suggestion | "Connection failed. Check your internet and try again." |
| **Breadcrumb context** | Page titles + subtle breadcrumbs so users always know where they are | Sidebar active state + page title "Alumni Directory > Add New" |
| **Generous spacing** | `gap-4` minimum between sections, `p-6` card padding, `mb-6` between groups | No cramped layouts or tiny margins |
| **High contrast** | WCAG AA minimum (4.5:1 text contrast). Maroon on white passes. Test dark mode too | Use `text-text-primary` on `bg-surface-primary` — not light gray on white |
| **Status indicators** | Color + icon + text for all statuses (never color-alone) | 🟢 Synced, 🟡 Pending, 🔴 Conflict — with text labels always visible |
| **Progressive disclosure** | Show essential info first; hide advanced options behind "Show More" or accordion | Settings page: basic prefs first, SMTP/Sheets config expandable |
| **Undo safety** | Auto-save + edit history. Users never lose work unexpectedly | Profile history tab shows all past versions |

**Testing checklist before each phase completion:**

- [ ] Can a non-technical person understand every label without help?
- [ ] Are all buttons large enough to click easily?
- [ ] Does every action give visible feedback (loading → success/error)?
- [ ] Are error messages helpful (not just "Error 500")?
- [ ] Is the page visually calm (not cluttered with too many elements)?
- [ ] Does the maroon accent color look professional and consistent?

---

## 4. Theming System

### Architecture

```
User clicks toggle → ui.store.ts updates → <html class="dark"> toggles → Tailwind dark: variants apply
                                          → settings table saves preference
```

### Implementation Files

| File | Responsibility |
|------|---------------|
| `src/stores/ui.store.ts` | `isDarkMode` state, `toggleDarkMode()`, `sidebarCollapsed` |
| `src/contexts/theme-provider.tsx` | Reads `ui.store.isDarkMode`, applies `dark` class to `<html>`, loads preference from settings on mount |
| `tailwind.config.ts` | Already has `darkMode: 'class'` ✅ |
| `src/styles/globals.css` | CSS custom properties for design tokens |

### Design Tokens (CSS Custom Properties)

These go in `src/styles/globals.css` and are **ready for color palette swap** when the logo arrives:

```css
@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    /* --- Background --- */
    --color-bg-primary: 255 255 255;        /* Main content background */
    --color-bg-secondary: 249 250 251;      /* Page/app background */
    --color-bg-tertiary: 243 244 246;       /* Subtle card backgrounds */

    /* --- Sidebar --- */
    --color-sidebar-bg: 255 255 255;
    --color-sidebar-text: 107 114 128;
    --color-sidebar-text-active: 17 24 39;
    --color-sidebar-accent: var(--color-accent);
    --color-sidebar-hover: 243 244 246;

    /* --- Accent (Engineering Maroon — SLSU College of Engineering) --- */
    --color-accent: 155 35 53;              /* Maroon #9B2335 — primary brand */
    --color-accent-light: 192 75 92;        /* Lighter maroon #C04B5C — hover/highlights */
    --color-accent-foreground: 255 255 255;

    /* --- Text --- */
    --color-text-primary: 17 24 39;
    --color-text-secondary: 107 114 128;
    --color-text-muted: 156 163 175;

    /* --- Cards --- */
    --color-card-bg: 255 255 255;
    --color-card-border: 229 231 235;

    /* --- Status --- */
    --color-success: 34 197 94;
    --color-warning: 234 179 8;
    --color-error: 239 68 68;
    --color-info: 59 130 246;

    /* --- Charts (6-color maroon-based palette) --- */
    --color-chart-1: 155 35 53;             /* Maroon — primary */
    --color-chart-2: 192 75 92;             /* Rose — secondary */
    --color-chart-3: 220 130 140;           /* Soft rose — tertiary */
    --color-chart-4: 245 190 195;           /* Blush — quaternary */
    --color-chart-5: 234 179 8;             /* Amber — contrast accent */
    --color-chart-6: 59 130 246;            /* Blue — contrast accent */
  }

  .dark {
    --color-bg-primary: 31 41 55;
    --color-bg-secondary: 17 24 39;
    --color-bg-tertiary: 55 65 81;

    --color-sidebar-bg: 17 24 39;
    --color-sidebar-text: 156 163 175;
    --color-sidebar-text-active: 255 255 255;
    --color-sidebar-hover: 55 65 81;

    --color-text-primary: 243 244 246;
    --color-text-secondary: 156 163 175;
    --color-text-muted: 107 114 128;

    --color-card-bg: 31 41 55;
    --color-card-border: 55 65 81;

    --color-chart-1: 192 75 92;             /* Lighter maroon for dark bg */
    --color-chart-2: 220 130 140;           /* Soft rose */
    --color-chart-3: 245 190 195;           /* Blush */
    --color-chart-4: 255 220 222;           /* Light pink */
    --color-chart-5: 250 204 21;            /* Amber */
    --color-chart-6: 96 165 250;            /* Blue */
  }
}
```

### Tailwind Config Extension

```ts
// tailwind.config.ts — theme.extend section to add
theme: {
  extend: {
    colors: {
      primary: {
        DEFAULT: 'rgb(var(--color-accent) / <alpha-value>)',
        light: 'rgb(var(--color-accent-light) / <alpha-value>)',
        foreground: 'rgb(var(--color-accent-foreground) / <alpha-value>)',
      },
      sidebar: {
        bg: 'rgb(var(--color-sidebar-bg) / <alpha-value>)',
        text: 'rgb(var(--color-sidebar-text) / <alpha-value>)',
        'text-active': 'rgb(var(--color-sidebar-text-active) / <alpha-value>)',
        hover: 'rgb(var(--color-sidebar-hover) / <alpha-value>)',
      },
      surface: {
        primary: 'rgb(var(--color-bg-primary) / <alpha-value>)',
        secondary: 'rgb(var(--color-bg-secondary) / <alpha-value>)',
        tertiary: 'rgb(var(--color-bg-tertiary) / <alpha-value>)',
      },
      card: {
        DEFAULT: 'rgb(var(--color-card-bg) / <alpha-value>)',
        border: 'rgb(var(--color-card-border) / <alpha-value>)',
      },
    },
  },
},
```

### Brand Colors — FINALIZED

**Maroon (#9B2335)** is the primary brand color — representing SLSU College of Engineering.

| Token | Light Mode (`:root`) | Dark Mode (`.dark`) | Hex |
|-------|---------------------|--------------------|---------|
| `--color-accent` | `155 35 53` | `155 35 53` (same) | `#9B2335` |
| `--color-accent-light` | `192 75 92` | `192 75 92` (same) | `#C04B5C` |
| Chart 1 | `155 35 53` (maroon) | `192 75 92` (lighter) | |
| Chart 2 | `192 75 92` (rose) | `220 130 140` | |
| Chart 3 | `220 130 140` (soft rose) | `245 190 195` | |
| Chart 4 | `245 190 195` (blush) | `255 220 222` | |
| Chart 5 | `234 179 8` (amber) | `250 204 21` | |
| Chart 6 | `59 130 246` (blue) | `96 165 250` | |

**Remaining asset swaps:**
1. Add logo image to `resources/logo.png` (and `resources/logo-dark.png` if needed) when provided by client
2. Update `<img src>` in `sidebar.tsx`
3. Optionally adjust `--color-sidebar-*` if brand has a dark sidebar variant

Everything else auto-adapts through the CSS custom properties.

---

## 5. Complete File Inventory

### Scaffold Status

| Category | Total Files | Has Content | Empty | % Complete |
|----------|-------------|-------------|-------|------------|
| Electron config (main.ts, preload.ts) | 2 | 2 | 0 | 100% (needs enhancement) |
| Build config (vite, builder, ts, etc.) | 8 | 8 | 0 | 100% ✅ |
| `electron/config/` | 3 | 0 | 3 | 0% |
| `electron/database/` | 9 | 0 | 9 | 0% |
| `electron/integrations/` | 6 | 0 | 6 | 0% |
| `electron/ipc/` | 10 | 0 | 10 | 0% |
| `electron/services/` | 10 | 0 | 10 | 0% |
| `electron/types/` | 3 | 0 | 3 | 0% |
| `electron/utils/` | 5 | 0 | 5 | 0% |
| `shared/` | 11 | 0 | 11 | 0% |
| `src/app/` | 4 | 0 | 4 | 0% |
| `src/data/` | 1 | 0 | 1 | 0% |
| `src/layouts/` | 3 | 0 | 3 | 0% |
| `src/stores/` | 7 | 0 | 7 | 0% |
| `src/hooks/` | 5 | 0 | 5 | 0% |
| `src/lib/` | 3 | 0 | 3 | 0% |
| `src/types/` | 7 | 0 | 7 | 0% |
| `src/styles/` | 2 | 1 | 1 | 50% |
| `src/routes/` (128 files across 9 dirs) | 128 | 0 | 128 | 0% |
| `src/components/` | 0 | 0 | 0 | (gitkeep only) |
| `src/App.tsx` | 1 | 1 (placeholder) | 0 | Needs rewrite |
| **Total** | **~228** | **12** | **~216** | **~5%** |

---

## 6. Implementation Phases

---

### Phase 1: Foundation — Error Handling, Config & Logger {#phase-1}

**Goal:** Safety net before any other code runs.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 1 | `electron/config/constants.ts` | NEW | `DB_FILENAME = 'alumni.db'`, default settings keys, app name, min year (2018) |
| 2 | `electron/config/paths.ts` | NEW | `getDbPath()`, `getLogPath()`, `getBackupPath()`, `getCachePath()` — all based on `app.getPath('userData')` |
| 3 | `electron/config/env.ts` | NEW | `isDev()`, `isProd()` from `app.isPackaged` |
| 4 | `electron/utils/logger.ts` | NEW | `logger.info/warn/error()` — append to `{userData}/app.log` with ISO timestamps |
| 5 | `electron/utils/error-handler.ts` | NEW | `setupErrorHandlers()` — `process.on('uncaughtException')` + `process.on('unhandledRejection')` → log + optionally show dialog |

**Test:** Import and call `setupErrorHandlers()`, throw intentionally, verify `app.log` receives the entry.

---

### Phase 2: Electron Main Process {#phase-2}

**Goal:** Correct initialization lifecycle in `electron/main.ts`.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 6 | `electron/main.ts` | FIX | Rewrite `app.whenReady()` to: `setupErrorHandlers()` → `await initDb()` → `registerIpcHandlers()` → `createWindow()`. Add graceful shutdown on `before-quit` to flush DB. |

**Target `main.ts` structure:**

```typescript
setupErrorHandlers()

app.whenReady().then(async () => {
  await initDb()          // Phase 3
  registerIpcHandlers()   // Phase 4
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('before-quit', () => {
  flushDb()  // Ensure atomic save on shutdown
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit()
})
```

---

### Phase 3: Database Layer {#phase-3}

**Goal:** sql.js initialization, schema creation, atomic saves, repositories.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 7 | `electron/database/db-manager.ts` | NEW | `initDb()` — load sql.js WASM, read existing `alumni.db` or create new. `getDb()` accessor. `saveDb()` with atomic write-rename (`.tmp` → `.bak` → `.db`). `flushDb()`. Startup recovery: detect leftover `.tmp`/`.bak` and auto-recover. |
| 8 | `electron/database/schema.ts` | NEW | `createTables(db)` — 5 CREATE TABLE IF NOT EXISTS statements: `alumni` (~58 cols), `alumni_history`, `email_history`, `settings`, `meta`. Default settings inserts. |
| 9 | `electron/database/migrations/index.ts` | NEW | Version-based migration runner using `meta` table. Check current version, apply pending migrations sequentially. |
| 10 | `electron/database/alumni.repository.ts` | NEW | `getAll(programs, filters)`, `getById(id)`, `create(data)`, `update(id, data)`, `delete(id)`, `search(query, programs)`. All queries include `WHERE program IN (?)` for role filtering. |
| 11 | `electron/database/alumni-history.repository.ts` | NEW | `createSnapshot(alumniId, snapshot, changedFields)`, `getByAlumniId(id)`, `getLatest(id)` |
| 12 | `electron/database/analytics.repository.ts` | NEW | `getTotalCounts(programs)`, `getBoardPasserRate(programs)`, `getEmploymentRate(programs)`, `getFieldRelatedRate(programs)`, `getSupervisoryRate(programs)`, `getFrequencyDistribution(column, programs)`, `getCompetencyMeans(programs)` |
| 13 | `electron/database/email-history.repository.ts` | NEW | `create(emailRecord)`, `getAll()`, `updateStatus(id, status)` |
| 14 | `electron/database/settings.repository.ts` | NEW | `get(key)`, `set(key, value)`, `getAll()`, `getMultiple(keys[])` |
| 15 | `electron/database/sync-queue.repository.ts` | NEW | `getPendingCount()`, `getPendingRecords()`, `markSynced(id, timestamp)`, `markConflict(id)` |

**Year validation:** `year_graduated >= 2018` enforced in `alumni.repository.create()` and Zod schema.

**Atomic save pattern:**
```
writeFileSync(path + '.tmp', data) → fsync
renameSync(path, path + '.bak')
renameSync(path + '.tmp', path)
unlinkSync(path + '.bak')
```

---

### Phase 4: IPC Contract & Registration {#phase-4}

**Goal:** Define all channel constants and register handlers.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 16 | `shared/ipc-channels.ts` | NEW | `IPC_CHANNELS` object with ~45 named constants organized by domain (AUTH, ALUMNI, ANALYTICS, PROFILING, EXPORT, EMAIL, SYNC, SETTINGS, SYSTEM) |
| 17 | `electron/ipc/index.ts` | NEW | `registerIpcHandlers()` — imports all 9 domain handlers and calls their registration functions |
| 18 | `electron/ipc/auth.ipc.ts` | NEW | `auth:login`, `auth:logout`, `auth:getSession`, `auth:getAccounts`, `auth:createAccount`, `auth:updateAccount` |
| 19 | `electron/ipc/alumni.ipc.ts` | NEW | `alumni:getAll`, `alumni:getById`, `alumni:create`, `alumni:update`, `alumni:delete`, `alumni:search` |
| 20 | `electron/ipc/analytics.ipc.ts` | NEW | `analytics:getDashboard`, `analytics:getSurveyData`, `analytics:getWeightedMeans` |
| 21 | `electron/ipc/profiling.ipc.ts` | NEW | `profiling:getProfile`, `profiling:getHistory`, `profiling:getSnapshot` |
| 22 | `electron/ipc/export.ipc.ts` | NEW | `export:pdf`, `export:docx`, `export:excel` — with `dialog.showSaveDialog` |
| 23 | `electron/ipc/email.ipc.ts` | NEW | `email:send`, `email:getHistory`, `email:getReceived`, `email:testConnection` |
| 24 | `electron/ipc/sync.ipc.ts` | NEW | `sync:pull`, `sync:push`, `sync:full`, `sync:getStatus`, `sync:resolveConflict`, `sync:autoSyncStart`, `sync:autoSyncStop` |
| 25 | `electron/ipc/settings.ipc.ts` | NEW | `settings:get`, `settings:save`, `settings:testSmtp`, `settings:testSheets` |
| 26 | `electron/ipc/system.ipc.ts` | NEW | `system:getVersion`, `system:getInfo` |

**Every handler follows this pattern:**
```typescript
ipcMain.handle(CHANNEL, async (_event, payload) => {
  try {
    const result = await service.method(payload)
    return { success: true, data: result }
  } catch (error) {
    logger.error(CHANNEL, error)
    return { success: false, error: (error as Error).message }
  }
})
```

---

### Phase 5: Service Layer & Integrations {#phase-5}

**Goal:** Business logic + external API adapters.

#### Services

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 27 | `electron/services/alumni.service.ts` | NEW | CRUD with role filtering, deduplication, timestamp management, delegates to repository |
| 28 | `electron/services/alumni-history.service.ts` | NEW | Create snapshot on update (full JSON + changed fields list), diff computation between versions |
| 29 | `electron/services/analytics.service.ts` | NEW | Dashboard aggregation: counts, percentages, weighted mean formula `Σ(scale × freq) / Σ(freq)`, frequency distributions. All role-filtered. |
| 30 | `electron/services/auth.service.ts` | NEW | Online auth (fetch from Sheets Accounts tab → bcrypt verify → cache locally). Offline auth (read encrypted cache → verify). 3-attempt lockout (5 min). |
| 31 | `electron/services/email.service.ts` | NEW | Filter recipients (role-scoped), render templates (`{{fullName}}`, etc.), nodemailer send, log to `email_history`, optional GForm link append |
| 32 | `electron/services/export.service.ts` | NEW | PDF (jspdf + autotable), DOCX (docx), XLSX (exceljs) generation with role-filtered data + filter criteria + summary stats |
| 33 | `electron/services/settings.service.ts` | NEW | Get/set config, SMTP test connection, Sheets test connection, encrypt SMTP password at rest |
| 34 | `electron/services/sync.service.ts` | NEW | Pull (Sheets → local), Push (local → Sheets), Full Sync (pull → resolve → push). Composite key matching: `full_name + program + year_graduated`. |
| 35 | `electron/services/auto-sync.service.ts` | NEW | `setInterval`-based scheduler. Configurable interval. Pauses on conflict or offline. Resumes when resolved. |
| 36 | `electron/services/conflict.service.ts` | NEW | Detect: same record modified both locally and on Sheets. Generate field-level diff. Resolve: keep local / keep remote / merge. |

#### Integrations (External API Adapters)

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 37 | `electron/integrations/google-sheets/client.ts` | NEW | Google Sheets API v4 auth via service account JSON key from settings |
| 38 | `electron/integrations/google-sheets/sheets.adapter.ts` | NEW | `readAllRows(sheetName)`, `updateRow(sheetName, rowIndex, data)`, `appendRow(sheetName, data)` |
| 39 | `electron/integrations/google-sheets/mapper.ts` | NEW | Bidirectional mapping: Sheet column headers ↔ `alumni` table column names. Handle `Timestamp` → `created_at`. |
| 40 | `electron/integrations/google-sheets/accounts.adapter.ts` | NEW | `fetchAccounts()`, `updateLastLogin(username, timestamp)`. Reads/writes the "Accounts" tab. |
| 41 | `electron/integrations/smtp/transport.ts` | NEW | Nodemailer transport factory. Creates transport from settings (host, port, user, encrypted password, TLS). `testConnection()` method. |
| 42 | `electron/integrations/smtp/templates.ts` | NEW | HTML email template with `{{variable}}` substitution engine. Variables: `fullName`, `program`, `yearGraduated`, `gmailAddress`, `firstName`, `lastName`. |

#### Utilities

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 43 | `electron/utils/crypto.ts` | NEW | AES-256-GCM encrypt/decrypt for offline auth cache (`auth-cache.enc`) and SMTP password storage |
| 44 | `electron/utils/network.ts` | NEW | `isOnline()` check. Emits event on connectivity change for auto-sync and UI indicator. |

---

### Phase 6: Shared Types, Schemas & Frontend Stores {#phase-6}

**Goal:** Type safety across IPC boundary + frontend state management.

#### Shared Types (used by both electron/ and src/)

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 45 | `shared/types/alumni.types.ts` | NEW | `Alumni`, `AlumniCreate`, `AlumniUpdate`, `AlumniFilters` interfaces — all ~58 fields typed |
| 46 | `shared/types/auth.types.ts` | NEW | `LoginCredentials`, `AuthResult`, `UserSession`, `UserRole`, `CachedAccount` |
| 47 | `shared/types/analytics.types.ts` | NEW | `DashboardStats`, `SurveyTableData`, `FrequencyRow`, `WeightedMeanResult` |
| 48 | `shared/types/profiling.types.ts` | NEW | `AlumniProfile`, `AlumniSnapshot`, `HistoryEntry`, `FieldDiff` |
| 49 | `shared/types/settings.types.ts` | NEW | `SettingsConfig`, `SmtpConfig`, `SheetsConfig`, `AccountEntry` |
| 50 | `shared/types/sync.types.ts` | NEW | `SyncStatus`, `SyncMode`, `ConflictRecord`, `PendingChange`, `AutoSyncConfig` |

#### Shared Schemas (Zod — used for IPC payload validation)

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 51 | `shared/schemas/alumni.schema.ts` | NEW | Full. Required: `full_name`, `program`, `year_graduated` (≥ 2018). Likert: 1–5. Email format. Conditional fields. Program-specific enum validation. |
| 52 | `shared/schemas/login.schema.ts` | NEW | `username`: min 3, max 50, alphanumeric. `password`: min 6, max 128. |
| 53 | `shared/schemas/account.schema.ts` | NEW | `username`, `password` (min 8), `role` enum, `fullName`, `isActive` |
| 54 | `shared/schemas/settings.schema.ts` | NEW | SMTP fields (host required, port number, etc.), Sheets fields (ID required, key required), GForm URL |

#### Electron Types

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 55 | `electron/types/database.types.ts` | NEW | `DbManager`, `Repository<T>`, `QueryResult`, `MigrationEntry` |
| 56 | `electron/types/ipc.types.ts` | NEW | `IpcResponse<T>`, `IpcHandler`, generic handler wrapper types |
| 57 | `electron/types/auth.types.ts` | NEW | `AccountsRow`, `AuthCache`, `LockoutState` |

#### Frontend Stores (Zustand)

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 58 | `src/data/ipc-client.ts` | NEW | Typed `ipcInvoke<T>(channel, ...args)` wrapper. Organized by domain: `ipcClient.alumni.getAll()`, `ipcClient.auth.login()`, etc. |
| 59 | `src/stores/auth.store.ts` | NEW | `user`, `isAuthenticated`, `accessiblePrograms`, `lockoutState`, `login()`, `logout()` |
| 60 | `src/stores/alumni.store.ts` | NEW | `list`, `filters`, `selectedId`, `loading`, `fetchAll()`, `create()`, `update()`, `delete()` |
| 61 | `src/stores/analytics.store.ts` | NEW | `dashboardStats`, `surveyTables`, `loading`, `fetchDashboard()` |
| 62 | `src/stores/profiling.store.ts` | NEW | `selectedProfile`, `history`, `displayMode`, `fetchProfile()`, `fetchHistory()` |
| 63 | `src/stores/settings.store.ts` | NEW | `config`, `isConfigured`, `accounts`, `loadSettings()`, `saveSettings()` |
| 64 | `src/stores/sync.store.ts` | NEW | `status`, `pendingCount`, `conflicts`, `lastSyncTime`, `autoSyncEnabled`, `pull()`, `push()`, `fullSync()` |
| 65 | `src/stores/ui.store.ts` | NEW | `isDarkMode`, `sidebarCollapsed`, `toasts[]`, `toggleDarkMode()`, `toggleSidebar()`, `addToast()` |

#### Frontend Types

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 66 | `src/types/alumni.types.ts` | NEW | Re-export shared + add UI-specific: `AlumniTableRow`, `FilterState` |
| 67 | `src/types/auth.types.ts` | NEW | Re-export shared + UI state types |
| 68 | `src/types/email.types.ts` | NEW | `EmailCompose`, `EmailHistoryRow`, `TemplateVariable` |
| 69 | `src/types/export.types.ts` | NEW | `ExportType`, `ExportFilters`, `ExportProgress` |
| 70 | `src/types/settings.types.ts` | NEW | Re-export shared + `SettingsSection` UI enum |
| 71 | `src/types/sync.types.ts` | NEW | Re-export shared + `SyncUIState` |
| 72 | `src/types/ipc.types.ts` | NEW | `ElectronAPI` window type declaration |

#### Frontend Utilities & Hooks

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 73 | `src/lib/cn.ts` | FIX | Utility likely exists but empty — implement `cn()` using `clsx` + `tailwind-merge` |
| 74 | `src/lib/formatters.ts` | NEW | `formatDate()`, `formatCurrency()`, `formatPercentage()`, `truncate()` |
| 75 | `src/lib/template-engine.ts` | NEW | Client-side template preview: replace `{{var}}` with sample data |
| 76 | `src/hooks/use-auth.ts` | NEW | Wrapper around `auth.store` for components |
| 77 | `src/hooks/use-ipc.ts` | NEW | Generic `useIpc<T>(channel)` hook with loading/error state |
| 78 | `src/hooks/use-network.ts` | NEW | Listen to main process network events, expose `isOnline` |
| 79 | `src/hooks/use-debounce.ts` | NEW | Debounce hook for search input |
| 80 | `src/hooks/use-toast.ts` | NEW | `useToast()` — reads/writes `ui.store.toasts` |
| 81 | `src/styles/print.css` | NEW | `@media print` styles for report print preview |

---

### Phase 7: Theming, Layout Shell & Router {#phase-7}

**Goal:** Visual shell matching the template layout, dark/light mode, route structure.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 82 | `src/styles/globals.css` | FIX | Add CSS custom properties (design tokens) for light + dark themes. Keep existing Tailwind directives. |
| 83 | `tailwind.config.ts` | FIX | Extend `theme.colors` with `primary`, `sidebar`, `surface`, `card` using CSS custom property references |
| 84 | `src/contexts/theme-provider.tsx` | NEW | Read `ui.store.isDarkMode`, apply `dark` class to `<html>`, load preference from DB on mount |
| 85 | `src/layouts/root-layout.tsx` | NEW | `<ThemeProvider>` wrapper → `<Outlet />` |
| 86 | `src/layouts/sidebar.tsx` | NEW | Fixed left sidebar: logo area (image slot ready — fallback to text "Alumni DB"), 4 nav groups (MENU, ALUMNI, TOOLS, SYSTEM), collapse toggle, active state highlight, badge support, logout button at bottom. `w-64` expanded / `w-16` collapsed. |
| 87 | `src/layouts/top-bar.tsx` | NEW | Fixed top: global search input, notification bell (pending sync count), user avatar placeholder + name + role badge |
| 88 | `src/App.tsx` | FIX | Replace placeholder with `<ThemeProvider><BrowserRouter><Routes>...</Routes></BrowserRouter></ThemeProvider>` |
| 89 | `src/app/router.tsx` | NEW | Full route tree (see below) |
| 90 | `src/app/providers.tsx` | NEW | Compose ThemeProvider + any other context providers |
| 91 | `src/app/guards/auth-guard.tsx` | NEW | Check `auth.store.isAuthenticated` → redirect to `/login` if false |
| 92 | `src/app/guards/settings-guard.tsx` | NEW | Check `settings.store.isConfigured` → redirect to `/settings` if false |

**Complete Route Tree:**

```
/login                          → LoginPage (standalone, no layout)
<AuthGuard>
  <SettingsGuard>
    <AppLayout (sidebar + topbar + main)>
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

---

### Phase 8: Page Implementations — Overview Group {#phase-8}

**Goal:** Login + Dashboard.

#### Login `/login` (standalone — no sidebar)

| # | File | Type | Elements |
|---|------|------|----------|
| 93 | `src/routes/login/index.tsx` | NEW | Page shell: centered card, logo top, form, error display, offline badge |
| 94 | `src/routes/login/-components/login-form.tsx` | NEW | Username + password inputs, submit button, form validation feedback |
| 95 | `src/routes/login/-components/lockout-timer.tsx` | NEW | 5-minute countdown display, shown after 3 failed attempts |
| 96 | `src/routes/login/-components/offline-badge.tsx` | NEW | "Offline Mode" pill indicator when using cached auth |
| 97 | `src/routes/login/-components/login-error.tsx` | NEW | Error message component: invalid creds, locked out, cannot connect |
| 98 | `src/routes/login/-hooks/use-login.ts` | NEW | Auth logic via IPC, attempt tracking |
| 99 | `src/routes/login/-hooks/use-lockout.ts` | NEW | Track attempt count, enforce 5-min lockout, persist in store |
| 100 | `src/routes/login/-hooks/use-auth-mode.ts` | NEW | Detect online vs offline auth mode |
| 101 | `src/routes/login/-schemas/login.schema.ts` | NEW | Zod: username min 3, password min 6 |
| 102 | `src/routes/login/-types/auth.types.ts` | NEW | `LoginFormData`, `AuthMode` |

#### Dashboard `/` (Overview group)

| # | File | Type | Elements |
|---|------|------|----------|
| 103 | `src/routes/dashboard/index.tsx` | NEW | **Page layout (from template):** Page title "Dashboard" + subtitle, stat cards row, mixed grid of tables + charts + activity feed. Role-based: Dean sees all, Chair sees own program. |
| 104 | `src/routes/dashboard/-components/total-responses-card.tsx` | NEW | **Highlighted card** (accent background, white text, large number) — total alumni count |
| 105 | `src/routes/dashboard/-components/program-respondent-boxes.tsx` | NEW | 3 cards: CE count, CpE count, EE count (white cards with trend indicator) |
| 106 | `src/routes/dashboard/-components/board-passers-card.tsx` | NEW | % with count fraction |
| 107 | `src/routes/dashboard/-components/employed-card.tsx` | NEW | % with count fraction |
| 108 | `src/routes/dashboard/-components/field-related-card.tsx` | NEW | % with count fraction |
| 109 | `src/routes/dashboard/-components/supervisory-card.tsx` | NEW | % with count fraction. CE/EE: Yes count. CpE: Supervisory+Managerial tiers. |
| 110 | `src/routes/dashboard/-components/survey-response-table.tsx` | NEW | Generic reusable table: column header, frequency per option, %, optional weighted mean |
| 111 | `src/routes/dashboard/-components/curriculum-relevance-table.tsx` | NEW | 1–5 Likert rows + weighted mean |
| 112 | `src/routes/dashboard/-components/competencies-table.tsx` | NEW | 9 rows × 5 cols matrix + per-row weighted mean |
| 113 | `src/routes/dashboard/-components/advance-studies-table.tsx` | NEW | Multi-select frequency |
| 114 | `src/routes/dashboard/-components/employment-status-table.tsx` | NEW | Single-select frequency |
| 115 | `src/routes/dashboard/-components/work-assignment-table.tsx` | NEW | 18 regions frequency |
| 116 | `src/routes/dashboard/-components/industry-sector-table.tsx` | NEW | Program-specific options |
| 117 | `src/routes/dashboard/-components/first-job-table.tsx` | NEW | Time to first job + method frequency |
| 118 | `src/routes/dashboard/-components/challenges-table.tsx` | NEW | Multi-select frequency |
| 119 | `src/routes/dashboard/-components/program-dist-chart.tsx` | NEW | recharts bar/pie — alumni by program |
| 120 | `src/routes/dashboard/-components/year-trend-chart.tsx` | NEW | recharts line — graduates over time |
| 121 | `src/routes/dashboard/-components/employment-chart.tsx` | NEW | recharts bar/pie — employment status |
| 122 | `src/routes/dashboard/-components/recent-activity.tsx` | NEW | Card with list: recent additions, syncs, emails (like template's "Project" list) |
| 123 | `src/routes/dashboard/-hooks/use-dashboard-stats.ts` | NEW | Fetch role-filtered aggregates via IPC |
| 124 | `src/routes/dashboard/-hooks/use-survey-analytics.ts` | NEW | Compute frequency + weighted mean for all survey tables |
| 125 | `src/routes/dashboard/-types/analytics.types.ts` | NEW | `StatCard`, `SurveyTableProps`, `ChartDataPoint` |

**Dashboard Layout (adapted from template):**

```
Row 1:  [Total Responses•] [CE Count] [CpE Count] [EE Count]     ← 4 stat cards
Row 2:  [% Board Passers] [% Employed] [% Field-Related] [% Supervisory]  ← 4 more cards
Row 3:  [Year Trend Chart (2-col)]  [Recent Activity (1-col)]     ← mixed grid
Row 4–N: [Survey Tables — full width, scrollable]                  ← stacked tables
Bottom: [Program Dist Chart] [Employment Chart]                    ← 2-col charts
```
• = Highlighted card (accent color)

---

### Phase 9: Page Implementations — Alumni Group {#phase-9}

**Goal:** Alumni Directory (with Add/Edit sub-pages) + Alumni Profiling.

#### Alumni Directory `/alumni`

| # | File | Type | Elements |
|---|------|------|----------|
| 126 | `src/routes/alumni/index.tsx` | NEW | Page title "Alumni Directory" + action buttons (Add Alumni, Import). 6-dimension filter toolbar. Data table with sort, search, pagination. Row actions. |
| 127 | `src/routes/alumni/-components/alumni-table.tsx` | NEW | Data table: columns for name, program, year, employment, sync status. Sort headers. |
| 128 | `src/routes/alumni/-components/alumni-table-toolbar.tsx` | NEW | 6 filter dropdowns + search input + clear filters button |
| 129 | `src/routes/alumni/-components/alumni-form.tsx` | NEW | Shared form (Add + Edit reuse). 7 sections with conditional fields. Program-specific dynamic options. |
| 130 | `src/routes/alumni/-components/alumni-form-fields.tsx` | NEW | Individual field components for all 42–43 questions. Likert scale input. Multi-select checkboxes. |
| 131 | `src/routes/alumni/-components/delete-confirm-dialog.tsx` | NEW | Modal: "Are you sure? This cannot be undone." with Cancel/Delete buttons. |
| 132 | `src/routes/alumni/-components/sync-badge.tsx` | NEW | Small pill: Pending (yellow), Synced (green), Conflict (red) |
| 133 | `src/routes/alumni/-components/view-profile-button.tsx` | NEW | Link button navigating to `/profiling/:id` |
| 134 | `src/routes/alumni/-hooks/use-alumni.ts` | NEW | CRUD operations via IPC, role-filtered |
| 135 | `src/routes/alumni/-hooks/use-alumni-filters.ts` | NEW | 6-dimension filter state + search debounce |
| 136 | `src/routes/alumni/-hooks/use-alumni-form.ts` | NEW | react-hook-form + zod integration, conditional field logic |
| 137 | `src/routes/alumni/-schemas/alumni.schema.ts` | NEW | Full Zod schema: required fields, Likert 1–5, email format, year ≥ 2018, program-specific enums, conditional validation |
| 138 | `src/routes/alumni/-constants/index.ts` | NEW | Programs, employment statuses, specializations per program, regions, industry sectors per program, salary ranges, etc. |

#### Add Alumni `/alumni/add`

| # | File | Type | Elements |
|---|------|------|----------|
| 139 | `src/routes/alumni/add.tsx` | NEW | Page title "Add Alumni". Renders `alumni-form.tsx` in create mode. On submit → save locally → pending sync → redirect to directory. |

#### Edit Alumni `/alumni/edit/:id`

| # | File | Type | Elements |
|---|------|------|----------|
| 140 | `src/routes/alumni/edit.tsx` | NEW | Page title "Edit Alumni". Load record by ID. Renders `alumni-form.tsx` in edit mode. On submit → create history snapshot → update → redirect. |

#### Alumni Profiling `/profiling`

| # | File | Type | Elements |
|---|------|------|----------|
| 141 | `src/routes/profiling/index.tsx` | NEW | Page title "Alumni Profiling". Searchable/filterable list of alumni. Click to view profile detail. |
| 142 | `src/routes/profiling/profile.tsx` | NEW | Profile detail page for `/profiling/:id`. Profile card + 3-tab display view. |
| 143 | `src/routes/profiling/-components/alumni-profile-card.tsx` | NEW | Summary card: name, program, contact, employment status, photo placeholder |
| 144 | `src/routes/profiling/-components/display-view-tabs.tsx` | NEW | Tab selector: History \| Latest \| Timeline |
| 145 | `src/routes/profiling/-components/full-history-view.tsx` | NEW | All snapshots chronologically, every field visible |
| 146 | `src/routes/profiling/-components/latest-updates-view.tsx` | NEW | Most recent changes, highlighted diffs (green/red) |
| 147 | `src/routes/profiling/-components/alumni-history-timeline.tsx` | NEW | Visual timeline: date nodes + changed fields + expandable snapshots |
| 148 | `src/routes/profiling/-components/history-diff-viewer.tsx` | NEW | Side-by-side old vs new for each changed field |
| 149 | `src/routes/profiling/-components/profile-search.tsx` | NEW | Search/autocomplete to find an alumnus |
| 150 | `src/routes/profiling/-hooks/use-alumni-profile.ts` | NEW | Fetch single alumni + history via IPC |
| 151 | `src/routes/profiling/-hooks/use-alumni-history.ts` | NEW | Fetch versioned update history, compute diffs |
| 152 | `src/routes/profiling/-types/profiling.types.ts` | NEW | `ProfileView`, `DisplayMode`, `TimelineEntry` |

---

### Phase 10: Page Implementations — Tools Group {#phase-10}

**Goal:** Data Sync, Sending Emails, Reports & Exports.

#### Data Sync `/sync`

| # | File | Type | Elements |
|---|------|------|----------|
| 153 | `src/routes/sync/index.tsx` | NEW | Page title "Data Sync". Network status. Sync status bar. 4 action buttons. Pending list. Conflict list. |
| 154 | `src/routes/sync/-components/sync-actions.tsx` | NEW | 4 buttons: Pull, Push, Full Sync, Auto-Sync config toggle |
| 155 | `src/routes/sync/-components/sync-status.tsx` | NEW | Last sync time, pending count badge, conflict count badge |
| 156 | `src/routes/sync/-components/sync-progress.tsx` | NEW | Progress bar during sync operations |
| 157 | `src/routes/sync/-components/pending-changes-list.tsx` | NEW | Table of all pending (unpushed) local changes |
| 158 | `src/routes/sync/-components/conflict-list.tsx` | NEW | List of detected conflicts with "Resolve" link per item |
| 159 | `src/routes/sync/-components/conflict-resolver.tsx` | NEW | Side-by-side: Local vs Remote. Highlighted diffs. Buttons: Keep Local, Keep Remote, Merge. |
| 160 | `src/routes/sync/-components/network-status.tsx` | NEW | Prominent online/offline pill (green/red) |
| 161 | `src/routes/sync/-components/unpushed-notification.tsx` | NEW | Banner: "You have N unpushed edits" |
| 162 | `src/routes/sync/-components/auto-sync-config.tsx` | NEW | Toggle + interval input (number + seconds/minutes select) |
| 163 | `src/routes/sync/-hooks/use-sync.ts` | NEW | Pull/push/full operations via IPC |
| 164 | `src/routes/sync/-hooks/use-sync-status.ts` | NEW | Real-time sync state (idle/pulling/pushing/error) |
| 165 | `src/routes/sync/-hooks/use-conflicts.ts` | NEW | Conflict list + resolution handlers |
| 166 | `src/routes/sync/-hooks/use-auto-sync.ts` | NEW | Auto-sync interval management |
| 167 | `src/routes/sync/-hooks/use-unpushed-alert.ts` | NEW | Check for unpushed edits, trigger notification |
| 168 | `src/routes/sync/-types/sync.types.ts` | NEW | `SyncUIState`, `ConflictDisplayItem` |

#### Sending Emails `/email`

| # | File | Type | Elements |
|---|------|------|----------|
| 169 | `src/routes/email/index.tsx` | NEW | Email hub: 3 action cards (Compose, History, Received) |
| 170 | `src/routes/email/compose.tsx` | NEW | 3-step flow: filter recipients → compose → preview & send |
| 171 | `src/routes/email/history.tsx` | NEW | Table: subject, recipients, date, status (completed/pending/failed) |
| 172 | `src/routes/email/received.tsx` | NEW | Manual log table: from, subject, date, status |
| 173 | `src/routes/email/-components/recipient-filter.tsx` | NEW | Filter by program + year (role-scoped). Count display. |
| 174 | `src/routes/email/-components/recipient-count.tsx` | NEW | "N recipients with valid Gmail address" |
| 175 | `src/routes/email/-components/email-composer.tsx` | NEW | Subject + body textarea |
| 176 | `src/routes/email/-components/gform-link-toggle.tsx` | NEW | Switch: "Include Google Form link in email?" |
| 177 | `src/routes/email/-components/template-var-helper.tsx` | NEW | Clickable buttons: `{{fullName}}`, `{{program}}`, etc. — inserts at cursor |
| 178 | `src/routes/email/-components/email-preview.tsx` | NEW | Live preview with sample data substituted |
| 179 | `src/routes/email/-components/send-progress.tsx` | NEW | Progress bar: N/total sent |
| 180 | `src/routes/email/-components/email-history-table.tsx` | NEW | Reusable table for history + received pages |
| 181 | `src/routes/email/-components/received-emails-table.tsx` | NEW | Table for received/response emails |
| 182 | `src/routes/email/-hooks/use-email-send.ts` | NEW | Send logic, progress tracking, error handling |
| 183 | `src/routes/email/-hooks/use-email-history.ts` | NEW | Fetch email history (completed + pending) |
| 184 | `src/routes/email/-hooks/use-received-emails.ts` | NEW | Fetch received emails |
| 185 | `src/routes/email/-hooks/use-recipients.ts` | NEW | Filter alumni → countable recipients (role-filtered) |
| 186 | `src/routes/email/-schemas/email.schema.ts` | NEW | Subject required (max 200), body required, recipients ≥ 1 |

#### Reports & Exports `/reports`

| # | File | Type | Elements |
|---|------|------|----------|
| 187 | `src/routes/reports/index.tsx` | NEW | Page title "Reports". 5 export type cards. Filter form. Progress indicator. |
| 188 | `src/routes/reports/-components/export-card.tsx` | NEW | Card per export type: icon + title + description + generate button |
| 189 | `src/routes/reports/-components/export-filter-form.tsx` | NEW | Filter: Program, Year, Specialization, Area/Location |
| 190 | `src/routes/reports/-components/export-progress.tsx` | NEW | "Generating..." / "Complete" feedback |
| 191 | `src/routes/reports/-components/print-preview.tsx` | NEW | Print-optimized view using `@media print` from `print.css` |
| 192 | `src/routes/reports/-hooks/use-export.ts` | NEW | Trigger export via IPC, handle save dialog, progress tracking |
| 193 | `src/routes/reports/-hooks/use-export-filters.ts` | NEW | Filter state for export |
| 194 | `src/routes/reports/-schemas/export-filter.schema.ts` | NEW | Zod: filter criteria validation |

---

### Phase 11: Page Implementations — System Group {#phase-11}

**Goal:** Settings, Help, About.

#### Settings `/settings`

| # | File | Type | Elements |
|---|------|------|----------|
| 195 | `src/routes/settings/index.tsx` | NEW | Page title "Settings". Role-gated sections (Dean: all, Chair: preferences only). |
| 196 | `src/routes/settings/-components/smtp-form.tsx` | NEW | Host, port, username, password (masked), TLS toggle |
| 197 | `src/routes/settings/-components/smtp-test-button.tsx` | NEW | "Test Connection" → IPC → success/failure feedback |
| 198 | `src/routes/settings/-components/google-sheets-config.tsx` | NEW | Sheet ID, service account key (JSON upload or paste), sheet name |
| 199 | `src/routes/settings/-components/sheets-test-button.tsx` | NEW | "Test Connection" for Sheets API |
| 200 | `src/routes/settings/-components/auto-sync-config.tsx` | NEW | Auto-sync toggle + interval (mirrors sync page config) |
| 201 | `src/routes/settings/-components/gform-link-config.tsx` | NEW | Google Form URL input |
| 202 | `src/routes/settings/-components/sync-db-info.tsx` | NEW | Read-only: DB file path, size, last backup timestamp |
| 203 | `src/routes/settings/-components/accounts-management.tsx` | NEW | Dean-only. Accounts table: username, role, status. Add/Edit/Deactivate buttons. |
| 204 | `src/routes/settings/-components/account-form-dialog.tsx` | NEW | Modal: create/edit account form (username, password, role, full name, active toggle) |
| 205 | `src/routes/settings/-components/preferences-form.tsx` | NEW | Dark mode toggle + any display preferences |
| 206 | `src/routes/settings/-components/dark-mode-toggle.tsx` | NEW | Toggle switch → `ui.store.toggleDarkMode()` → persists to settings table |
| 207 | `src/routes/settings/-hooks/use-settings.ts` | NEW | Settings load/save via IPC |
| 208 | `src/routes/settings/-hooks/use-accounts.ts` | NEW | Accounts CRUD via IPC (Dean-only) |
| 209 | `src/routes/settings/-hooks/use-dark-mode.ts` | NEW | Dark mode toggle logic |
| 210 | `src/routes/settings/-schemas/settings.schema.ts` | NEW | Zod: SMTP required, Sheets required, GForm URL format |
| 211 | `src/routes/settings/-schemas/account.schema.ts` | NEW | Zod: account creation/update validation |
| 212 | `src/routes/settings/-types/settings.types.ts` | NEW | `SettingsSection`, `AccountFormData` |

#### Help `/help`

| # | File | Type | Elements |
|---|------|------|----------|
| 213 | `src/routes/help/index.tsx` | NEW | Page title "Help". 3-tab view: User Manual \| FAQ \| Troubleshooting |
| 214 | `src/routes/help/-components/user-manual-tab.tsx` | NEW | Accordion sections: Getting Started (1–4), Managing Alumni (5–8), Working with Data (9–11), Sending Emails (12–14), Reports (15–16), Settings Dean Only (17–20). Bold numbered steps, simple language, screenshot placeholder slots. |
| 215 | `src/routes/help/-components/faq-tab.tsx` | NEW | 14 expandable Q&A items. Searchable. |
| 216 | `src/routes/help/-components/troubleshooting-tab.tsx` | NEW | 8 categories with problem/solution tables: Startup, Login, Sync, Data, Email, Export, Display, Safety. |

#### About `/about`

| # | File | Type | Elements |
|---|------|------|----------|
| 217 | `src/routes/about/index.tsx` | NEW | Page title "About". 3 stacked sections. |
| 218 | `src/routes/about/-components/system-info-section.tsx` | NEW | Purpose, goals (PTC-ACBET 2027), target users, app version (via IPC), developer attribution |
| 219 | `src/routes/about/-components/core-features-section.tsx` | NEW | 9 feature summary cards with icons: Login, Dashboard, Directory, Profiling, Reports, Sync, Email, Settings, About |
| 220 | `src/routes/about/-components/user-manual-section.tsx` | NEW | Condensed step-by-step guide for non-technical users |
| 221 | `src/routes/about/-components/feature-summary-card.tsx` | NEW | Reusable card: icon + title + short description |
| 222 | `src/routes/about/-components/manual-step.tsx` | NEW | Reusable step: number + title + description + screenshot slot |
| 223 | `src/routes/about/-components/faq-accordion.tsx` | NEW | Reusable accordion: question/answer pairs |
| 224 | `src/routes/about/-hooks/use-app-version.ts` | NEW | Fetch app version from `system:getVersion` IPC |

---

### Phase 12: Smoke Tests & Build {#phase-12}

**Goal:** Verify implementation and produce installer.

| # | File | Type | What To Implement |
|---|------|------|-------------------|
| 225 | `tests/smoke-test.cjs` | ENHANCE | Verify: all key files non-empty, `main.ts` contains `initDb` + `registerIpcHandlers`, `ipc-channels.ts` exports `IPC_CHANNELS`, `router.tsx` exports `AppRouter`, store files non-empty, help route exists |
| 226 | `electron-builder.yml` | VERIFY | Confirm: NSIS config correct, icon path set, output dir, extraResources for sql-wasm.wasm |
| 227 | `package.json` | VERIFY | Confirm `build:exe` produces working installer |
| 228 | `resources/icon.ico` | PENDING | App icon — will be created from logo when provided |
| 229 | `README.md` | ENHANCE | Update: features list, installation steps, screenshots placeholder, tech stack |

**Build verification:**
```bash
pnpm install
node tests/smoke-test.cjs    # All checks pass
pnpm dev                      # App launches, DB init, routes work
pnpm build                    # Clean compilation
pnpm build:exe                # Produces .exe installer
```

---

## 7. Implementation Priority

### Tier 1: Foundation (Phases 1–4)

Everything else depends on these. Must complete sequentially.

| Order | Phase | Items | Description |
|-------|-------|-------|-------------|
| 1 | Phase 1 | #1–5 | Error handling, config, logger |
| 2 | Phase 2 | #6 | Electron main.ts lifecycle |
| 3 | Phase 3 | #7–15 | Database layer (sql.js, schema, repos) |
| 4 | Phase 4 | #16–26 | IPC channels + handler registration |

### Tier 2: Business Logic (Phases 5–6)

Services and stores can be built in parallel per domain.

| Order | Phase | Items | Description |
|-------|-------|-------|-------------|
| 5 | Phase 5 | #27–44 | Service layer + integrations + utilities |
| 6 | Phase 6 | #45–81 | Types, schemas, stores, hooks |

### Tier 3: UI Shell (Phase 7)

Must complete before any page implementation.

| Order | Phase | Items | Description |
|-------|-------|-------|-------------|
| 7 | Phase 7 | #82–92 | Theming, layout, sidebar, top bar, router, guards |

### Tier 4: Page Implementations (Phases 8–11)

Can be built in any order once the shell exists. Recommended sequence:

| Order | Phase | Items | Description | Why This Order |
|-------|-------|-------|-------------|----------------|
| 8 | Phase 8a | #93–102 | Login page | Needed to test auth flow |
| 9 | Phase 8b | #103–125 | Dashboard page | Most complex, validates analytics pipeline |
| 10 | Phase 9a | #126–140 | Alumni Directory + Add/Edit | Core CRUD validates entire stack |
| 11 | Phase 9b | #141–152 | Alumni Profiling | Depends on history snapshots from directory |
| 12 | Phase 10a | #153–168 | Data Sync | Validates Google Sheets integration |
| 13 | Phase 10b | #169–186 | Sending Emails | Validates SMTP integration |
| 14 | Phase 10c | #187–194 | Reports & Exports | PDF/DOCX/XLSX generation |
| 15 | Phase 11a | #195–212 | Settings | Account management + config |
| 16 | Phase 11b | #213–224 | Help + About | Static informational pages |

### Tier 5: Finalize (Phase 12)

| Order | Phase | Items | Description |
|-------|-------|-------|-------------|
| 17 | Phase 12 | #225–229 | Smoke tests, build verification, installer |

---

## 8. Design Tokens & Asset Readiness

### Assets Pending (to be provided by client)

| Asset | Where It Goes | Current Fallback |
|-------|--------------|-----------------|
| **App Logo** (PNG/SVG) | `resources/logo.png`, `resources/logo-dark.png` | Text "Alumni DB" in sidebar |
| **App Icon** (.ico) | `resources/icon.ico` → referenced in `electron-builder.yml` | Default Electron icon |
| **Color Palette** | CSS custom properties in `globals.css` | **Maroon #9B2335** — finalized |
| **Institution Logo** (optional) | Report headers (PDF/DOCX exports) | Text "SLSU College of Engineering" |

### Swap Instructions (When Assets Arrive)

**Logo:**
1. Place files in `resources/logo.png` (light mode) and `resources/logo-dark.png` (dark mode)
2. Update `src/layouts/sidebar.tsx` — replace text fallback with `<img src>` using the logo path
3. Update `src/routes/login/index.tsx` — add logo above login form

**Icon:**
1. Place `icon.ico` in `resources/`
2. `electron-builder.yml` already looks at `resources/` for build resources — no config change needed

**Color Palette:**
1. Open `src/styles/globals.css`
2. Replace `--color-accent` values in `:root` (light) and `.dark` blocks
3. Replace `--color-chart-*` values for chart colors
4. Every component using `bg-primary`, `text-primary`, `bg-sidebar-*` etc. auto-updates

**No code changes needed beyond these 3 files** — the entire UI reads from CSS custom properties through Tailwind's extended theme.

---

## Summary

| Metric | Count |
|--------|-------|
| Total implementation items | **229** |
| Phases | **12** |
| Empty scaffold files to implement | **~216** |
| Config files verified (no changes needed) | **10** |
| Config files needing enhancement | **3** (main.ts, App.tsx, globals.css) |
| New packages to install | **6** (optional Radix UI + lucide-react) |
| Pending assets | **4** (logo, icon, color palette, institution logo) |

*This is the final, complete implementation plan for the Alumni Database System. All electron setup has been verified. Theming is ready for color palette swap. Layout adapts the Donezo template pattern. Implementation can begin at Phase 1.*

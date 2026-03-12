# Alumni DB — Improvement Plan

> **Based on:** Review of the working `product-mix-optimization-system` (built & shipped as .exe)
> **Goal:** Bring `alumni-db` to production-ready parity using proven patterns from the working project
> **Date:** March 9, 2026

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Current State Assessment](#2-current-state-assessment)
3. [Gap Analysis: alumni-db vs product-mix-optimization-system](#3-gap-analysis)
4. [Proposed Changes](#4-proposed-changes)
   - [Phase 1: Electron Main Process Setup](#phase-1-electron-main-process-setup)
   - [Phase 2: Database Initialization & Schema](#phase-2-database-initialization--schema)
   - [Phase 3: IPC Channel Contract & Registration](#phase-3-ipc-channel-contract--registration)
   - [Phase 4: Error Handling & Logging](#phase-4-error-handling--logging)
   - [Phase 5: Service Layer Implementation](#phase-5-service-layer-implementation)
   - [Phase 6: Frontend Store Wiring](#phase-6-frontend-store-wiring)
   - [Phase 7: Router, Route Guards & Page Implementations](#phase-7-router-route-guards--page-implementations)
   - [Phase 8: Help Page (User Manual, FAQ, Troubleshooting)](#phase-8-help-page)
   - [Phase 9: Smoke Test Updates](#phase-9-smoke-test-updates)
   - [Phase 10: Build & Release Preparation](#phase-10-build--release-preparation)
5. [Detailed Change List](#5-detailed-change-list)
6. [Implementation Priority](#6-implementation-priority)

---

## 1. Executive Summary

The `product-mix-optimization-system` is a fully working Electron desktop app that has been built and shipped as a Windows .exe installer. It follows a clean architecture: **main process initialization → database init → IPC registration → window creation**, with error handling, logging, and a comprehensive in-app Help page.

The `alumni-db` project shares the same tech stack and folder structure (it was the template), but most implementation files remain **empty scaffolds**. This document catalogs every gap and proposes concrete changes to bring `alumni-db` to production readiness.

> **Accreditation Context:** The system supports SLSU College of Engineering's pursuit of **PTC-ACBET accreditation by 2027**. The four OBE metrics (% board passers, % employed, % in field-related jobs, % supervisory/managerial roles) are dashboard KPIs derived directly from the alumni questionnaire data.

---

## 2. Current State Assessment

### What alumni-db HAS (working/complete)

| Component | Status | Notes |
|-----------|--------|-------|
| Project scaffolding | ✅ | Folder structure, configs, package.json |
| electron.vite.config.ts | ✅ | Identical to working project |
| tsconfig files (3) | ✅ | Correct project references |
| tailwind.config.ts | ✅ | darkMode: 'class' configured |
| postcss.config.js | ✅ | Tailwind + Autoprefixer |
| electron-builder.yml | ✅ | NSIS installer, sql-wasm.wasm bundled |
| electron/preload.ts | ✅ | Context bridge with invoke/on |
| src/main.tsx | ✅ | React entry point |
| src/lib/cn.ts | ✅ | Tailwind className utility |
| Comprehensive docs/ | ✅ | 14 documentation files covering all features |
| Shared types & schemas | ✅ | Type definitions for all 7 domains |
| smoke-test.cjs | ✅ | Basic validation checks |

### What alumni-db is MISSING (empty scaffolds or absent)

| Component | Status | Impact |
|-----------|--------|--------|
| electron/main.ts — DB init & IPC registration | ❌ Empty | App boots but does nothing |
| electron/database/db-manager.ts | ❌ Empty | No database connection |
| electron/database/schema.ts | ❌ Empty | No tables created |
| electron/database/*.repository.ts | ❌ Empty | No data access |
| electron/services/*.service.ts | ❌ Empty | No business logic |
| electron/ipc/*.ipc.ts | ❌ Empty | No IPC handlers registered |
| shared/ipc-channels.ts | ❌ Empty | No channel constants |
| electron/config/constants.ts | ❌ Empty | No app constants |
| electron/config/paths.ts | ❌ Empty | No path helpers |
| electron/utils/error-handler.ts | ❌ Empty | No error handling |
| electron/utils/logger.ts | ❌ Empty | No logging |
| src/app/router.tsx | ❌ Empty | No routes defined |
| src/data/ipc-client.ts | ❌ Empty | No frontend IPC wrapper |
| src/App.tsx | ❌ Placeholder only | Just a title div |
| src/stores/*.store.ts | ❌ Empty | No state management |
| Help/FAQ/Troubleshooting page | ❌ Not built | No in-app user guidance |
| src/routes/*/index.tsx | ❌ Empty | No page implementations |

---

## 3. Gap Analysis

### 3.1 Electron Main Process (Critical)

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| DB initialization before window | ✅ `await initSystemDb()` + `loadWorkbook()` | ❌ Missing | Must add `await initDb()` in `app.whenReady()` |
| IPC handler registration | ✅ `registerIpcHandlers()` before `createWindow()` | ❌ Missing | Must register all IPC handlers |
| Error handlers setup | ✅ `setupErrorHandlers()` at top of main.ts | ❌ Missing | Must add global error handling |
| Graceful shutdown | ✅ Implicit via sql.js sync writes | ❌ Missing | Must ensure DB is flushed on quit |

### 3.2 Database Layer

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| DB manager | ✅ sql.js init + atomic write-rename | ❌ Empty file | Must implement full DB lifecycle |
| Schema creation | ✅ `CREATE TABLE IF NOT EXISTS` at init | ❌ Empty file | Must create 5 tables (alumni, alumni_history, email_history, settings, meta) |
| Crash protection | ✅ `.tmp` → `.bak` → `.db` pattern | ❌ Not implemented | Must implement atomic saves |
| Recovery on startup | ✅ Detects leftover `.tmp`/`.bak` | ❌ Not implemented | Must add recovery logic |
| Repositories | ✅ Typed query functions | ❌ Empty files (6 repos) | Must implement all CRUD operations |

### 3.3 IPC Layer

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| Channel constants | ✅ 23 named channels in shared file | ❌ Empty file | Must define ~40+ channels for 9 modules |
| Handler registration | ✅ Central registerIpcHandlers() | ❌ Empty files (9 handlers) | Must implement all handlers |
| Frontend IPC client | ✅ Typed store methods calling ipcInvoke | ❌ Empty file | Must create typed ipc-client.ts |

### 3.4 Error Handling & Logging

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| Global error handler | ✅ Catches uncaught exceptions + unhandled rejections | ❌ Empty | Must implement |
| File logger | ✅ Logs to `app.log` with timestamps | ❌ Empty | Must implement |
| IPC error wrapping | ✅ try/catch in every handler | ❌ N/A (no handlers yet) | Must follow pattern |

### 3.5 Frontend

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| App.tsx | ✅ `<Providers><AppRouter /></Providers>` | ❌ Placeholder div | Must wire up providers + router |
| Router | ✅ HashRouter with 7 routes + layout | ❌ Empty | Must implement with 9 routes |
| Route guards | ✅ N/A (no auth) | ❌ Scaffolded but empty | Must implement auth-gate + settings-gate |
| Zustand stores | ✅ 3 stores with IPC integration | ❌ 7 empty stores | Must implement all stores |
| Help page | ✅ Full 3-tab page (Manual, FAQ, Troubleshooting) | ❌ Not built (only documented) | Must build the route |

### 3.6 In-App Help System

| Aspect | product-mix (working) | alumni-db (current) | Gap |
|--------|----------------------|--------------------|----|
| Dedicated `/help` route | ✅ 600+ line component | ❌ None | Must create |
| User Manual tab | ✅ Accordion sections per feature | ❌ Only in docs/ | Must build in-app version |
| FAQ tab | ✅ 8 Q&A items | ❌ Defined in about.md but not built | Must build with alumni-specific FAQs |
| Troubleshooting tab | ✅ 6 categories with tables | ❌ None | Must build with domain-specific issues |
| About page | ✅ System info + quick start | ❌ Documented but not built | Must build |

### 3.7 Client Paper vs Documentation — Resolved Conflicts

Review of the client's thesis PDF (Revised Chapters 1–3) and 3 program-specific questionnaires (CE, CpE, EE) against existing documentation. **Rule: docs take priority over the paper** (client confirmed paper is not yet updated).

| # | PDF Says | Docs Say | Resolution |
|---|----------|----------|------------|
| 1 | Data categories include "Research/Project Outputs", "Micro-Credentials", "Community & Industry Engagement" | ~58-column data dictionary matches all questionnaire fields; these 3 categories have no corresponding questions | **Docs win** — aspirational categories not formalized into questionnaire fields |
| 2 | Restricted to Dean, Chairpersons, and "System Administrators" | 4 roles: `dean`, `ce_chair`, `cpe_chair`, `ee_chair`. Dean handles all admin functions | **Docs win** — no separate admin role; Dean account covers admin duties |
| 3 | 3 sync options: pull, push, full sync | 4 sync modes: Pull, Push, Full Sync, Auto-Sync Timer | **Docs win** — Auto-Sync kept for near real-time updates |

**New findings incorporated into this plan:**

- Integration files (Google Sheets + SMTP) added to Phase 5
- Year validation tightened to 2018+ (per PDF scope: graduates from 2018 onward)
- Route page implementations added to Phase 7 with sidebar grouping
- Help page confirmed in route structure

---

## 4. Proposed Changes

### Phase 1: Electron Main Process Setup

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron/main.ts` | **FIX** | Add DB initialization, IPC registration, and error handler setup before window creation |
| `electron/utils/error-handler.ts` | **NEW** | Global `uncaughtException` + `unhandledRejection` handlers with file logging |
| `electron/utils/logger.ts` | **NEW** | Timestamped logger writing to `{userData}/app.log` |
| `electron/config/constants.ts` | **NEW** | App-wide constants (DB filename, default settings keys) |
| `electron/config/paths.ts` | **NEW** | Path resolution helpers for userData, DB file, log file |
| `electron/config/env.ts` | **NEW** | Environment detection (dev vs production) |

**What the updated `electron/main.ts` should look like (pattern from working project):**

```typescript
import { app, BrowserWindow } from 'electron'
import { join } from 'path'
import { setupErrorHandlers } from './utils/error-handler'
import { initDb } from './database/db-manager'
import { registerIpcHandlers } from './ipc/index'

setupErrorHandlers()

function createWindow(): void {
  const mainWindow = new BrowserWindow({
    width: 1280,
    height: 800,
    show: false,
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  if (process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

app.whenReady().then(async () => {
  await initDb()
  registerIpcHandlers()
  createWindow()

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})
```

---

### Phase 2: Database Initialization & Schema

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron/database/db-manager.ts` | **NEW** | sql.js initialization, atomic save (`.tmp` → `.bak` → `.db`), recovery on startup, `getDb()` accessor |
| `electron/database/schema.ts` | **NEW** | CREATE TABLE statements for all 5 tables, default settings inserts, migration tracking |
| `electron/database/migrations/index.ts` | **NEW** | Version-based migration runner |
| `electron/database/alumni.repository.ts` | **NEW** | Alumni CRUD with role-filtered queries |
| `electron/database/alumni-history.repository.ts` | **NEW** | Snapshot creation, history retrieval |
| `electron/database/analytics.repository.ts` | **NEW** | Aggregation queries for dashboard stats |
| `electron/database/email-history.repository.ts` | **NEW** | Email log CRUD |
| `electron/database/settings.repository.ts` | **NEW** | Key-value get/set for settings table |
| `electron/database/sync-queue.repository.ts` | **NEW** | Sync status tracking queries |

**Schema overview (5 tables from docs/technical/database.md):**

```sql
CREATE TABLE IF NOT EXISTS alumni (...);        -- ~58 columns
CREATE TABLE IF NOT EXISTS alumni_history (...); -- versioned snapshots
CREATE TABLE IF NOT EXISTS email_history (...);  -- email send log
CREATE TABLE IF NOT EXISTS settings (...);       -- key-value config
CREATE TABLE IF NOT EXISTS meta (...);           -- migration tracking
```

> **Year Validation Constraint (from client PDF):** The system covers graduates from **2018 onward** (5-year post-graduation evaluation window). The `year_graduated` column should be validated as `>= 2018` at both the schema default and Zod form validation level.

**Crash protection pattern (from working project):**
1. Write DB to `alumni.db.tmp`
2. Rename `alumni.db` → `alumni.db.bak`
3. Rename `alumni.db.tmp` → `alumni.db`
4. Delete `alumni.db.bak`

---

### Phase 3: IPC Channel Contract & Registration

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `shared/ipc-channels.ts` | **NEW** | Define all ~45 IPC channel constants organized by domain |
| `electron/ipc/index.ts` | **FIX** | Central `registerIpcHandlers()` that imports and registers all domain handlers |
| `electron/ipc/auth.ipc.ts` | **NEW** | `auth:login`, `auth:logout`, `auth:getSession`, `auth:createAccount`, `auth:updateAccount`, `auth:listAccounts` |
| `electron/ipc/alumni.ipc.ts` | **NEW** | `alumni:getAll`, `alumni:getById`, `alumni:create`, `alumni:update`, `alumni:delete`, `alumni:search` |
| `electron/ipc/analytics.ipc.ts` | **NEW** | `analytics:getDashboard`, `analytics:getSurveyData`, `analytics:getWeightedMeans` |
| `electron/ipc/profiling.ipc.ts` | **NEW** | `profiling:getProfile`, `profiling:getHistory`, `profiling:getSnapshot` |
| `electron/ipc/export.ipc.ts` | **NEW** | `export:pdf`, `export:docx`, `export:excel` — with save dialog |
| `electron/ipc/email.ipc.ts` | **NEW** | `email:send`, `email:getHistory`, `email:testConnection` |
| `electron/ipc/sync.ipc.ts` | **NEW** | `sync:pull`, `sync:push`, `sync:full`, `sync:getStatus`, `sync:resolveConflict` |
| `electron/ipc/settings.ipc.ts` | **NEW** | `settings:get`, `settings:save`, `settings:testSmtp`, `settings:testSheets` |
| `electron/ipc/system.ipc.ts` | **NEW** | `system:getVersion`, `system:getInfo` |

**IPC Channel naming convention (from working project):**

```typescript
export const IPC_CHANNELS = {
  // Auth
  AUTH_LOGIN: 'auth:login',
  AUTH_LOGOUT: 'auth:logout',
  // ...

  // Alumni
  ALUMNI_GET_ALL: 'alumni:getAll',
  ALUMNI_CREATE: 'alumni:create',
  // ...

  // System
  SYSTEM_GET_VERSION: 'system:getVersion',
} as const
```

**IPC handler pattern (from working project):**

```typescript
ipcMain.handle(IPC_CHANNELS.ALUMNI_GET_ALL, async (_event, filters) => {
  try {
    return { success: true, data: await alumniService.getAll(filters) }
  } catch (error) {
    logger.error('alumni:getAll failed', error)
    return { success: false, error: (error as Error).message }
  }
})
```

---

### Phase 4: Error Handling & Logging

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron/utils/error-handler.ts` | **NEW** | `setupErrorHandlers()` — catches `uncaughtException` and `unhandledRejection`, logs to file |
| `electron/utils/logger.ts` | **NEW** | `log()`, `error()`, `warn()` — writes to `{userData}/app.log` with ISO timestamps |
| `electron/utils/network.ts` | **NEW** | Online/offline detection for sync features |
| `electron/utils/crypto.ts` | **NEW** | AES-256-GCM encrypt/decrypt for offline auth cache and SMTP passwords |

**Logger pattern (from working project):**

```typescript
import { appendFileSync } from 'fs'
import { join } from 'path'
import { app } from 'electron'

const logPath = join(app.getPath('userData'), 'app.log')

export function log(level: string, message: string, data?: unknown): void {
  const timestamp = new Date().toISOString()
  const line = `[${timestamp}] [${level}] ${message}${data ? ' ' + JSON.stringify(data) : ''}\n`
  appendFileSync(logPath, line)
  if (level === 'ERROR') console.error(line)
}

export const logger = {
  info: (msg: string, data?: unknown) => log('INFO', msg, data),
  warn: (msg: string, data?: unknown) => log('WARN', msg, data),
  error: (msg: string, data?: unknown) => log('ERROR', msg, data)
}
```

---

### Phase 5: Service Layer Implementation

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron/services/alumni.service.ts` | **NEW** | CRUD with role filtering, history snapshot on update |
| `electron/services/alumni-history.service.ts` | **NEW** | Diff generation, snapshot comparison, restore |
| `electron/services/analytics.service.ts` | **NEW** | Dashboard aggregation (counts, percentages, weighted means, frequency distributions) |
| `electron/services/auth.service.ts` | **NEW** | Online login (Google Sheets accounts tab), offline login (encrypted cache), lockout logic |
| `electron/services/email.service.ts` | **NEW** | SMTP send with template variable substitution, email history logging |
| `electron/services/export.service.ts` | **NEW** | PDF (jspdf), DOCX (docx), Excel (exceljs) generation with role-filtered data |
| `electron/services/settings.service.ts` | **NEW** | Config get/set, SMTP test, Sheets test |
| `electron/services/sync.service.ts` | **NEW** | Pull/Push/Full sync engine with conflict detection |
| `electron/services/auto-sync.service.ts` | **NEW** | Timer-based auto-sync scheduler |
| `electron/services/conflict.service.ts` | **NEW** | Conflict resolution (hash or timestamp comparison, field-level diff) |
**Integration files (external API adapters):**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron/integrations/google-sheets/client.ts` | **NEW** | Google Sheets API v4 authentication (service account credentials) |
| `electron/integrations/google-sheets/sheets.adapter.ts` | **NEW** | Read rows, update rows, append rows to alumni spreadsheet |
| `electron/integrations/google-sheets/mapper.ts` | **NEW** | Map Sheet column headers ↔ Alumni DB column names (bidirectional) |
| `electron/integrations/google-sheets/accounts.adapter.ts` | **NEW** | Read/write the "Accounts" tab for user authentication |
| `electron/integrations/smtp/transport.ts` | **NEW** | Nodemailer transport factory (TLS, credentials from settings) |
| `electron/integrations/smtp/templates.ts` | **NEW** | HTML email templates with `{{variable}}` substitution engine |
**Service pattern (from working project):**

```typescript
// All services:
// 1. Receive role context for data filtering
// 2. Call repositories for DB access
// 3. Call integrations for external APIs
// 4. Return typed results
// 5. Are called by IPC handlers only
```

---

### Phase 6: Frontend Store Wiring

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `src/data/ipc-client.ts` | **NEW** | Typed wrapper around `window.electronAPI.invoke()` organized by domain |
| `src/stores/auth.store.ts` | **NEW** | Login/logout, session, role state |
| `src/stores/alumni.store.ts` | **NEW** | Alumni list, filters, pagination, CRUD actions |
| `src/stores/analytics.store.ts` | **NEW** | Dashboard stats, survey data, chart data |
| `src/stores/profiling.store.ts` | **NEW** | Selected profile, history, snapshots |
| `src/stores/settings.store.ts` | **NEW** | SMTP, Sheets, preferences, isConfigured flag |
| `src/stores/sync.store.ts` | **NEW** | Sync status, pending count, conflict list |
| `src/stores/ui.store.ts` | **NEW** | Sidebar, dark mode, toast queue |

**Store pattern (from working project):**

```typescript
import { create } from 'zustand'
import { IPC_CHANNELS } from '@shared/ipc-channels'

const ipcInvoke = <T>(channel: string, ...args: unknown[]): Promise<T> =>
  window.electronAPI.invoke(channel, ...args) as Promise<T>

export const useAlumniStore = create((set) => ({
  list: [],
  loading: false,
  fetchAll: async (filters) => {
    set({ loading: true })
    const result = await ipcInvoke(IPC_CHANNELS.ALUMNI_GET_ALL, filters)
    set({ list: result.data, loading: false })
  },
  // ...
}))
```

---

### Phase 7: Router, Route Guards & Page Implementations

#### 7a — Routing Infrastructure

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `src/App.tsx` | **FIX** | Replace placeholder with `<Providers><AppRouter /></Providers>` |
| `src/app/router.tsx` | **NEW** | HashRouter with all routes (see structure below) |
| `src/app/providers.tsx` | **NEW** | React context providers (Theme, Router wrapping) |
| `src/app/guards/auth-gate.tsx` | **NEW** | Redirect to `/login` if no session |
| `src/app/guards/settings-gate.tsx` | **NEW** | Redirect to `/settings` if not configured (first-time setup) |
| `src/layouts/app-layout.tsx` | **NEW** | Sidebar + main content area layout with grouped navigation |

#### 7b — Sidebar Navigation Groups

The sidebar organizes **9 main pages** into 4 logical groups:

| Group | Pages | Description |
|-------|-------|-------------|
| **Overview** | Dashboard | Home — aggregate stats & KPIs |
| **Alumni** | Alumni Directory, Alumni Profiling | Core data management & individual profiles |
| **Tools** | Data Sync, Sending Emails, Reports & Exports | Data operations & output generation |
| **System** | Settings, Help, About | Configuration, guidance, app info |

> **Login** is a standalone page (no sidebar) — shown only when unauthenticated.

#### 7c — Complete Route Map

**10 Main Pages** (1 standalone + 9 sidebar items):

| # | Group | Route | Page | Complexity | Key Components |
|---|-------|-------|------|------------|----------------|
| 1 | — | `/login` | Login | High | Login form, lockout timer, offline badge |
| 2 | Overview | `/` | Dashboard | High | 6 stat cards, 10 survey tables, 3 charts |
| 3 | Alumni | `/alumni` | Alumni Directory | Medium | Data table, 6-dimension filter, search, CRUD |
| 4 | Alumni | `/profiling` | Alumni Profiling | Medium | Profile list, search, 3 display view tabs |
| 5 | Tools | `/sync` | Data Sync | High | 4 sync actions, conflict list, network status |
| 6 | Tools | `/email` | Sending Emails | High | Action selector (compose / history / received) |
| 7 | Tools | `/reports` | Reports & Exports | Medium | Export type cards, filter form, progress |
| 8 | System | `/settings` | Settings | Low–Med | Role-gated sections (SMTP, Sheets, accounts, prefs) |
| 9 | System | `/help` | Help | Low | 3 tabs (Manual, FAQ, Troubleshooting) |
| 10 | System | `/about` | About | Low | System info, 9 feature cards, version |

**6 Sub-Pages** (nested under main pages, no separate sidebar entry):

| # | Parent | Route | Sub-Page | Purpose |
|---|--------|-------|----------|----------|
| 1 | Alumni Directory | `/alumni/add` | Add Alumni | Full gform field entry (42–43 questions) |
| 2 | Alumni Directory | `/alumni/edit/:id` | Edit Alumni | Pre-populated form + history snapshot on save |
| 3 | Alumni Profiling | `/profiling/:id` | Profile Detail | Full profile + history timeline + diff viewer |
| 4 | Sending Emails | `/email/compose` | Compose Email | Filter recipients → compose → preview → send |
| 5 | Sending Emails | `/email/history` | Email History | Sent emails table (completed/pending/failed) |
| 6 | Sending Emails | `/email/received` | Received Emails | Manual log of email responses |

**Total: 16 route entries** (10 main + 6 sub-pages)

#### 7d — Route Page Implementation Files

Each route folder follows the convention: `index.tsx` + `-components/` + `-hooks/` + `-schemas/`.

| Route Folder | Key Files | Change Type | Elements |
|-------------|-----------|-------------|----------|
| `src/routes/login/` | index + 4 components + 3 hooks + 1 schema | **NEW** | Login form, lockout timer, offline badge |
| `src/routes/dashboard/` | index + 18 components + 2 hooks + 1 types | **NEW** | 6 stat cards, 10 survey tables, 3 charts |
| `src/routes/alumni/` | index + add + edit + 7 components + 3 hooks + 1 schema | **NEW** | Data table, alumni form (all gform fields), 6-dim filter |
| `src/routes/profiling/` | index + profile + 6 components + 2 hooks + 1 types | **NEW** | Profile card, 3 display views, timeline, diff viewer |
| `src/routes/sync/` | index + 8 components + 5 hooks + 1 types | **NEW** | 4 sync actions, conflict resolver, auto-sync config |
| `src/routes/email/` | index + compose + history + received + 8 comp + 4 hooks | **NEW** | Recipient filter, composer, template vars, GForm toggle |
| `src/routes/reports/` | index + 4 components + 2 hooks + 1 schema | **NEW** | Export cards, filter form, progress, print preview |
| `src/routes/settings/` | index + 10 components + 3 hooks + 2 schemas | **NEW** | SMTP/Sheets config, accounts CRUD, dark mode |
| `src/routes/about/` | index + 5 components + 1 hook | **NEW** | System info, 9 feature cards, version display |

**Router pattern:**

```typescript
<HashRouter>
  <Routes>
    {/* Standalone — no sidebar */}
    <Route path="/login" element={<LoginPage />} />

    {/* Authenticated routes */}
    <Route element={<AuthGate />}>
      <Route element={<SettingsGate />}>
        <Route element={<AppLayout />}>
          {/* Overview */}
          <Route path="/" element={<DashboardPage />} />

          {/* Alumni */}
          <Route path="/alumni" element={<AlumniPage />} />
          <Route path="/alumni/add" element={<AlumniAddPage />} />
          <Route path="/alumni/edit/:id" element={<AlumniEditPage />} />
          <Route path="/profiling" element={<ProfilingPage />} />
          <Route path="/profiling/:id" element={<ProfileDetailPage />} />

          {/* Tools */}
          <Route path="/sync" element={<SyncPage />} />
          <Route path="/email" element={<EmailPage />} />
          <Route path="/email/compose" element={<EmailComposePage />} />
          <Route path="/email/history" element={<EmailHistoryPage />} />
          <Route path="/email/received" element={<EmailReceivedPage />} />
          <Route path="/reports" element={<ReportsPage />} />

          {/* System */}
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/help" element={<HelpPage />} />
          <Route path="/about" element={<AboutPage />} />
        </Route>
      </Route>
    </Route>
  </Routes>
</HashRouter>
```

---

### Phase 8: Help Page (User Manual, FAQ, Troubleshooting) {#phase-8-help-page}

This is a **key deliverable** — the working project has a comprehensive in-app Help page that alumni-db needs.

**Files to create:**

| File | Description |
|------|-------------|
| `src/routes/help/index.tsx` | Main Help page with 3 tabs |
| `src/routes/help/-components/user-manual-tab.tsx` | Accordion-based manual per feature area |
| `src/routes/help/-components/faq-tab.tsx` | Searchable FAQ with expandable answers |
| `src/routes/help/-components/troubleshooting-tab.tsx` | Categorized problem/solution tables |

#### Tab 1: User Manual

Organized by task area (matching the about.md manual contents):

| Section | Topics |
|---------|--------|
| **Getting Started** | Opening the app, logging in, first-time setup, understanding the dashboard |
| **Managing Alumni** | Browsing, searching, filtering, adding, editing, viewing profiles |
| **Working with Data** | Syncing data, understanding sync status, resolving conflicts |
| **Sending Emails** | Selecting recipients, composing emails, template variables, checking history |
| **Reports** | Exporting PDF/Word/Excel, printing, print preview |
| **Settings (Dean Only)** | Managing accounts, configuring email server, connecting Google Sheets, preferences |

Each section uses an **accordion pattern** with:
- Bold numbered steps
- Simple, non-technical language
- Placeholder slots for screenshots
- Consistent structure: "What to do" → "Where to click" → "What happens next"

#### Tab 2: FAQ

| # | Question | Answer |
|---|----------|--------|
| 1 | What do I do if I can't log in? | Check your username and password. If locked out (3 failed attempts), wait for the lockout timer. Contact the Dean if you forgot your password. |
| 2 | What if the internet is down? | You can still work offline — view records, add/edit alumni, generate reports. Sync when back online. |
| 3 | How do I change my password? | Contact the Dean. Only the Dean can manage user accounts in Settings. |
| 4 | What does "Pending Sync" mean? | Changes are saved locally but not yet uploaded to Google Sheets. Sync when ready. |
| 5 | Can I undo a delete? | No, deletions are permanent. Always confirm before deleting a record. |
| 6 | Where is my data stored? | Locally in `alumni.db` on your computer. A copy syncs to Google Sheets when online. |
| 7 | What programs does this system cover? | Three engineering programs: Civil Engineering (CE), Computer Engineering (CpE), and Electrical Engineering (EE). |
| 8 | Can I see records from other programs? | It depends on your role. The Dean sees all programs. Chairpersons see only their own program. |
| 9 | How do I make the text bigger? | Go to Settings → Preferences → Font Size and choose Large or Extra Large. |
| 10 | How do I switch to dark mode? | Go to Settings → Preferences and toggle Dark Mode on. |
| 11 | What is a "conflict"? | A conflict occurs when the same record was edited both locally and on the spreadsheet. You'll be asked to choose which version to keep. |
| 12 | How do I export a report? | Go to Reports, apply your filters, and click the PDF, Word, or Excel button. Choose where to save the file. |
| 13 | Do I need the internet? | Only for syncing data and sending emails. Everything else works offline. |
| 14 | What happens if the app crashes during sync? | Your local data is protected by automatic backups. Restart the app and try syncing again. |

#### Tab 3: Troubleshooting

| Category | Problems Covered |
|----------|-----------------|
| **Startup & Installation** | App won't open, white/blank screen, SmartScreen warning, "missing DLL" error |
| **Login Problems** | Wrong password, locked out, "Cannot connect" error, offline login not working |
| **Sync Issues** | Sync fails, "conflict detected", internet connected but sync fails, auto-sync not running |
| **Data Problems** | Alumni records missing, "Database error", records showing wrong program, duplicate records |
| **Email Issues** | "SMTP connection failed", emails not received, template variables not replaced |
| **Export & Report Problems** | PDF/Word/Excel export fails, exported file empty, "Permission denied" saving |
| **Display & Appearance** | Text too small/large, dark mode not applying, sidebar not responding, charts blank |
| **Data Safety & Recovery** | How backups work, restoring from backup, moving data to another computer, starting fresh |

**Troubleshooting pattern (from working project):**

Each category uses a table format:

```
| Problem | What to Do |
|---------|-----------|
| **App won't open** | 1. Run as administrator. 2. If SmartScreen blocks, click "More info" → "Run anyway". 3. Reinstall if needed. |
```

---

### Phase 9: Smoke Test Updates

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `tests/smoke-test.cjs` | **ENHANCE** | Add checks for new implementation files, IPC channels, store files, help route |

**New checks to add:**

```
✅ electron/utils/error-handler.ts exists
✅ electron/utils/logger.ts exists
✅ electron/database/db-manager.ts is non-empty
✅ electron/database/schema.ts is non-empty
✅ shared/ipc-channels.ts exports IPC_CHANNELS
✅ electron/ipc/index.ts exports registerIpcHandlers
✅ src/app/router.tsx exports AppRouter
✅ src/routes/help/index.tsx exists
✅ src/data/ipc-client.ts is non-empty
✅ All 7 store files are non-empty
✅ electron/main.ts contains 'initDb' and 'registerIpcHandlers'
```

---

### Phase 10: Build & Release Preparation

**Files to change:**

| File | Change Type | Description |
|------|-------------|-------------|
| `electron-builder.yml` | **VERIFY** | Ensure NSIS config, icon path, output dir are correct |
| `package.json` | **VERIFY** | Ensure `build:exe` script works end-to-end |
| `resources/` | **ENHANCE** | Add app icon (icon.ico) if missing |
| `README.md` | **ENHANCE** | Update with installation instructions, features list, screenshots placeholder |

**Build verification steps:**

```bash
pnpm install
node tests/smoke-test.cjs   # All checks pass
pnpm build                   # Clean compilation
pnpm dev                     # App launches, loads DB, routes work
pnpm build:exe               # Produces installer .exe
```

---

## 5. Detailed Change List

### Summary Count

| Type | Count |
|------|-------|
| **FIX** (modify existing files) | 4 |
| **NEW** (implement empty scaffolds) | 53 |
| **ENHANCE** (improve existing) | 4 |
| **VERIFY** (check & confirm) | 2 |
| **Total** | 63 |

### Full List by File

| # | File | Type | Description |
|---|------|------|-------------|
| 1 | `electron/main.ts` | FIX | Add DB init, IPC registration, error handler setup |
| 2 | `electron/utils/error-handler.ts` | NEW | Global uncaught exception + unhandled rejection handlers |
| 3 | `electron/utils/logger.ts` | NEW | File-based logger with timestamps |
| 4 | `electron/utils/network.ts` | NEW | Online/offline detection |
| 5 | `electron/utils/crypto.ts` | NEW | AES-256-GCM encrypt/decrypt |
| 6 | `electron/config/constants.ts` | NEW | App constants (DB filename, default keys) |
| 7 | `electron/config/paths.ts` | NEW | Path resolution helpers |
| 8 | `electron/config/env.ts` | NEW | Environment detection |
| 9 | `electron/database/db-manager.ts` | NEW | sql.js init, atomic save, recovery |
| 10 | `electron/database/schema.ts` | NEW | 5 tables + default inserts |
| 11 | `electron/database/migrations/index.ts` | NEW | Version-based migration runner |
| 12 | `electron/database/alumni.repository.ts` | NEW | Alumni CRUD queries |
| 13 | `electron/database/alumni-history.repository.ts` | NEW | History snapshot queries |
| 14 | `electron/database/analytics.repository.ts` | NEW | Dashboard aggregation queries |
| 15 | `electron/database/email-history.repository.ts` | NEW | Email log queries |
| 16 | `electron/database/settings.repository.ts` | NEW | Key-value settings queries |
| 17 | `electron/database/sync-queue.repository.ts` | NEW | Sync status queries |
| 18 | `shared/ipc-channels.ts` | NEW | ~45 IPC channel constants |
| 19 | `electron/ipc/index.ts` | NEW | Central registerIpcHandlers() |
| 20 | `electron/ipc/auth.ipc.ts` | NEW | Auth IPC handlers |
| 21 | `electron/ipc/alumni.ipc.ts` | NEW | Alumni IPC handlers |
| 22 | `electron/ipc/analytics.ipc.ts` | NEW | Analytics IPC handlers |
| 23 | `electron/ipc/profiling.ipc.ts` | NEW | Profiling IPC handlers |
| 24 | `electron/ipc/export.ipc.ts` | NEW | Export IPC handlers |
| 25 | `electron/ipc/email.ipc.ts` | NEW | Email IPC handlers |
| 26 | `electron/ipc/sync.ipc.ts` | NEW | Sync IPC handlers |
| 27 | `electron/ipc/settings.ipc.ts` | NEW | Settings IPC handlers |
| 28 | `electron/ipc/system.ipc.ts` | NEW | System info IPC handlers |
| 29 | `electron/services/alumni.service.ts` | NEW | Alumni business logic |
| 30 | `electron/services/alumni-history.service.ts` | NEW | History/snapshot logic |
| 31 | `electron/services/analytics.service.ts` | NEW | Dashboard aggregation logic |
| 32 | `electron/services/auth.service.ts` | NEW | Login/auth + offline cache |
| 33 | `electron/services/email.service.ts` | NEW | SMTP send + history |
| 34 | `electron/services/export.service.ts` | NEW | PDF/DOCX/Excel generation |
| 35 | `electron/services/settings.service.ts` | NEW | Config management |
| 36 | `electron/services/sync.service.ts` | NEW | Pull/push/full sync engine |
| 37 | `electron/services/auto-sync.service.ts` | NEW | Auto-sync timer |
| 38 | `electron/services/conflict.service.ts` | NEW | Conflict detection/resolution |
| 39 | `src/App.tsx` | FIX | Wire up Providers + AppRouter |
| 40 | `src/app/router.tsx` | NEW | HashRouter with 10 routes |
| 41 | `src/app/providers.tsx` | NEW | Context providers |
| 42 | `src/app/guards/auth-gate.tsx` | NEW | Auth route guard |
| 43 | `src/app/guards/settings-gate.tsx` | NEW | Settings-configured guard |
| 44 | `src/data/ipc-client.ts` | NEW | Typed IPC client wrapper |
| 45 | `src/stores/*.store.ts` (7 files) | NEW | Zustand stores for all domains |
| 46 | `src/routes/help/index.tsx` | NEW | Help page (3 tabs) |
| 47 | `src/routes/help/-components/*.tsx` (3 files) | NEW | Manual, FAQ, Troubleshooting tabs |
| 48 | `tests/smoke-test.cjs` | ENHANCE | Add implementation-specific checks |
| 49 | `electron/integrations/google-sheets/client.ts` | NEW | Google Sheets API v4 auth (service account) |
| 50 | `electron/integrations/google-sheets/sheets.adapter.ts` | NEW | Read/update/append rows to alumni spreadsheet |
| 51 | `electron/integrations/google-sheets/mapper.ts` | NEW | Bidirectional mapping: Sheet columns ↔ DB columns |
| 52 | `electron/integrations/google-sheets/accounts.adapter.ts` | NEW | Read/write "Accounts" tab for authentication |
| 53 | `electron/integrations/smtp/transport.ts` | NEW | Nodemailer transport factory (TLS, credentials) |
| 54 | `electron/integrations/smtp/templates.ts` | NEW | HTML email templates with `{{variable}}` substitution |
| 55 | `src/routes/login/**` | NEW | Login page + form + lockout timer + offline badge |
| 56 | `src/routes/dashboard/**` | NEW | Dashboard hub + 6 stat cards + 10 survey tables + 3 charts |
| 57 | `src/routes/alumni/**` | NEW | Directory + Add/Edit forms (all gform fields) + 6-dim filter |
| 58 | `src/routes/profiling/**` | NEW | Profiling list + profile detail + 3 display views + timeline |
| 59 | `src/routes/sync/**` | NEW | Sync dashboard + 4 sync actions + conflict resolver + auto-sync |
| 60 | `src/routes/email/**` | NEW | Email hub + compose + history + received + template variables |
| 61 | `src/routes/reports/**` | NEW | Reports + filter form + PDF/DOCX/XLSX generation + print preview |
| 62 | `src/routes/settings/**` | NEW | Settings + SMTP/Sheets config + accounts management + preferences |
| 63 | `src/routes/about/**` | NEW | About page + system info + 9 feature cards + version |

---

## 6. Implementation Priority

### Tier 1: Foundation (Must complete first — everything depends on these)

| Priority | Phase | Component | Reason |
|----------|-------|-----------|--------|
| 🔴 1 | Phase 4 | Error handling + Logger | Safety net for all subsequent work |
| 🔴 2 | Phase 1 | Electron main.ts setup | App initialization lifecycle |
| 🔴 3 | Phase 2 | DB manager + Schema | Data persistence foundation |
| 🔴 4 | Phase 3 | IPC channels + Registration | Communication bridge |

### Tier 2: Core Features (Build the app's functionality)

| Priority | Phase | Component | Reason |
|----------|-------|-----------|--------|
| 🟡 5 | Phase 5 | Service layer + Integration files | Business logic + external API adapters |
| 🟡 6 | Phase 6 | Frontend stores + IPC client | State management |
| 🟡 7 | Phase 7a–c | Router + Route guards + Layout | Navigation infrastructure & sidebar groups |
| 🟡 8 | Phase 7d | Route page implementations (9 routes) | All UI pages with components & hooks |

### Tier 3: User Experience (Polish and user-facing features)

| Priority | Phase | Component | Reason |
|----------|-------|-----------|--------|
| 🟢 9 | Phase 8 | Help page (Manual, FAQ, Troubleshooting) | User guidance |
| 🟢 10 | Phase 9 | Smoke test updates | Quality assurance |
| 🟢 11 | Phase 10 | Build & release verification | Shipping |

---

## Key Patterns to Follow (from working project)

### 1. Initialization Order
```
setupErrorHandlers() → await initDb() → registerIpcHandlers() → createWindow()
```

### 2. IPC Handler Pattern
```
ipcMain.handle(channel, async (_event, payload) => {
  try {
    const result = await service.method(payload)
    return { success: true, data: result }
  } catch (error) {
    logger.error(channel, error)
    return { success: false, error: (error as Error).message }
  }
})
```

### 3. Store Pattern
```
const useStore = create((set, get) => ({
  data: [],
  loading: false,
  fetch: async () => {
    set({ loading: true })
    const result = await ipcInvoke(CHANNEL)
    set({ data: result.data, loading: false })
  }
}))
```

### 4. Atomic DB Save
```
writeFileSync(path + '.tmp', data)
renameSync(path, path + '.bak')
renameSync(path + '.tmp', path)
unlinkSync(path + '.bak')
```

### 5. Help Page Structure
```
3 tabs: User Manual (accordions) | FAQ (expandable Q&A) | Troubleshooting (categorized tables)
```

---

*This improvement plan covers **63 changes** across **10 phases** to bring alumni-db from scaffolded template to production-ready desktop application, following every proven pattern from the shipped product-mix-optimization-system.*

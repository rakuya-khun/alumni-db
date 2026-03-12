# Alumni DB — End-to-End Audit Report

> **Date:** June 2025
> **Scope:** Full project audit — IPC data contracts, component safety, analytics pipeline
> **Verdict:** All issues resolved. Build passes clean. 89/89 smoke tests pass.

---

## Table of Contents

1. [Executive Summary](#1-executive-summary)
2. [Audit Methodology](#2-audit-methodology)
3. [Bug Inventory](#3-bug-inventory)
   - [3.1 IPC Data Shape Mismatches (Critical)](#31-ipc-data-shape-mismatches-critical)
   - [3.2 Analytics Service Data Shape (High)](#32-analytics-service-data-shape-high)
   - [3.3 Frontend Null Guard Gaps (Medium)](#33-frontend-null-guard-gaps-medium)
4. [Fixes Applied](#4-fixes-applied)
5. [Root Cause Analysis](#5-root-cause-analysis)
6. [Verification Results](#6-verification-results)
7. [IPC Contract Reference](#7-ipc-contract-reference)

---

## 1. Executive Summary

A comprehensive end-to-end audit of the Alumni DB Electron application uncovered **11 bugs** across three categories:

| Category | Severity | Count | Status |
|----------|----------|-------|--------|
| IPC data shape mismatches | **Critical** | 5 | ✅ Fixed |
| Analytics service data shape | **High** | 2 | ✅ Fixed |
| Frontend null guard gaps | **Medium** | 4 | ✅ Fixed |

The root cause for most issues was a **contract mismatch** between IPC handlers (main process) and the IPC client (renderer process). The client's `invoke<T>()` generic unwraps `result.data` as type `T`, so handlers must return **plain values** in the `data` field — not wrapper objects.

---

## 2. Audit Methodology

### Approach: Bidirectional Contract Verification

1. **IPC Client Catalog** — Read `src/data/ipc-client.ts` to catalog every IPC call and its expected return type `T`.
2. **Handler Cross-Reference** — Read every IPC handler file in `electron/ipc/` and verified that the `data:` field in each response matches the type `T` expected by the client.
3. **Component Trace** — For each mismatch, traced the data flow from handler → store/hook → component to identify the user-visible failure.
4. **Frontend Sweep** — Scanned all route pages and components for unsafe array operations (`.length`, `.map()`, `.filter()`) without null guards.
5. **Analytics Pipeline** — Verified the data shape at each layer: repository → service → IPC → store → component.

### Files Audited

| Layer | Files | Count |
|-------|-------|-------|
| IPC Handlers | `electron/ipc/*.ipc.ts` | 9 |
| IPC Client | `src/data/ipc-client.ts` | 1 |
| Route Pages | `src/routes/*/index.tsx` | 10 |
| Dashboard Components | `src/routes/dashboard/-components/*.tsx` | 19 |
| Alumni Components | `src/routes/alumni/-components/*.tsx` | 7 |
| Email Components | `src/routes/email/-components/*.tsx` | 3 |
| Stores | `src/stores/*.store.ts` | 7 |
| Hooks | `src/hooks/*.ts`, `src/routes/*/-hooks/*.ts` | 8 |
| Services | `electron/services/*.service.ts` | 8 |
| Repositories | `electron/database/*.repository.ts` | 6 |

---

## 3. Bug Inventory

### 3.1 IPC Data Shape Mismatches (Critical)

These bugs caused **runtime crashes** — the client received an object where it expected a primitive, or vice versa.

#### BUG-01: `system:getVersion` → "Objects are not valid as a React child"

| Field | Detail |
|-------|--------|
| **File** | `electron/ipc/system.ipc.ts` |
| **Symptom** | React crash: `Objects are not valid as a React child (found: object with keys {version})` |
| **Root Cause** | Handler returned `{ success: true, data: { version: app.getVersion() } }` — client `invoke<string>()` unwrapped `data` as `{ version: string }` instead of `string` |
| **Impact** | Crashed the About page (`system-info-section.tsx`) and `use-app-version.ts` hook |
| **Severity** | **Critical** — app crash on navigation |

**Before:**
```typescript
return { success: true, data: { version: app.getVersion() } }  // ❌ Object
```

**After:**
```typescript
return { success: true, data: app.getVersion() }  // ✅ Plain string
```

---

#### BUG-02: `alumni:create` → Store received object instead of number

| Field | Detail |
|-------|--------|
| **File** | `electron/ipc/alumni.ipc.ts` |
| **Symptom** | `alumni.store.create()` received `{ id: number }` instead of `number` |
| **Root Cause** | Handler returned `data: { id }` — client `invoke<number>()` got object |
| **Impact** | Alumni creation appeared to succeed but returned invalid ID for subsequent operations |
| **Severity** | **Critical** — silent data corruption |

**Before:**
```typescript
return { success: true, data: { id } }  // ❌ Object
```

**After:**
```typescript
return { success: true, data: id }  // ✅ Plain number
```

---

#### BUG-03/04/05: `export:pdf/docx/excel` → Hook received object instead of string

| Field | Detail |
|-------|--------|
| **Files** | `electron/ipc/export.ipc.ts` (3 handlers) |
| **Symptom** | `useExport` hook received `{ filePath: string }` instead of `string` for all 3 export types |
| **Root Cause** | All handlers returned `data: { filePath }` — client `invoke<string>()` got object |
| **Impact** | Export success toast displayed `[object Object]` instead of file path |
| **Severity** | **Critical** — broken UX on all exports |

**Before (all 3 handlers):**
```typescript
return { success: true, data: { filePath } }  // ❌ Object
```

**After (all 3 handlers):**
```typescript
return { success: true, data: filePath }  // ✅ Plain string
```

---

### 3.2 Analytics Service Data Shape (High)

#### BUG-06: `analyticsService.getSurveyData()` → Raw arrays instead of SurveyTableData

| Field | Detail |
|-------|--------|
| **Files** | `electron/services/analytics.service.ts`, `electron/database/analytics.repository.ts` |
| **Symptom** | `competencies-table.tsx` crashed: `Cannot read properties of undefined (reading 'filter')` |
| **Root Cause** | Service returned raw `{ value, count }[]` arrays but frontend expected `SurveyTableData` objects with `{ column, label, rows }` shape |
| **Impact** | Crashed Dashboard survey tables |
| **Severity** | **High** — page crash |

**Fix:** Rewrote `analytics.service.ts` to wrap all frequency data in the `SurveyTableData` shape:

```typescript
// Service now wraps every result correctly
return { column, label: COLUMN_LABELS[column] ?? column, rows }
```

#### BUG-07: Missing repository methods for special columns

| Field | Detail |
|-------|--------|
| **File** | `electron/database/analytics.repository.ts` |
| **Symptom** | `competencies` and JSON array columns (`advanced_study_reason`, `job_challenges`) had no query methods |
| **Root Cause** | Only `getFrequencyDistribution()` existed; special columns need different query strategies |
| **Impact** | Survey data for competencies and multi-select fields returned empty |
| **Severity** | **High** — missing data |

**Fix:** Added two new repository methods:
- `getCompetencyFrequency(programs?)` — queries all 9 competency columns × 5 Likert scales
- `getJsonArrayFrequency(column, programs?)` — parses JSON array TEXT columns and aggregates frequencies

---

### 3.3 Frontend Null Guard Gaps (Medium)

These bugs caused crashes when data was `undefined` or `null` (e.g., before async loads complete or when database is empty).

#### BUG-08: `alumni-table.tsx` — `alumni.length` without guard

| Field | Detail |
|-------|--------|
| **File** | `src/routes/alumni/-components/alumni-table.tsx` |
| **Fix** | `const safeAlumni = alumni ?? []` — all operations use `safeAlumni` |

#### BUG-09: `alumni/index.tsx` — `alumni.length` without guard

| Field | Detail |
|-------|--------|
| **File** | `src/routes/alumni/index.tsx` |
| **Fix** | Changed to `(alumni ?? []).length` |

#### BUG-10: `email-history-table.tsx` — `history.length` without guard

| Field | Detail |
|-------|--------|
| **File** | `src/routes/email/-components/email-history-table.tsx` |
| **Fix** | `if (!history \|\| history.length === 0)` early return |

#### BUG-11: `received-emails-table.tsx` — `received.length` without guard

| Field | Detail |
|-------|--------|
| **File** | `src/routes/email/-components/received-emails-table.tsx` |
| **Fix** | `if (!received \|\| received.length === 0)` early return |

---

### Additional Hardening

#### `recent-activity.tsx` — Unsafe type cast

| Field | Detail |
|-------|--------|
| **File** | `src/routes/dashboard/-components/recent-activity.tsx` |
| **Original** | `[...(alumni as Array<{id: number, full_name: string, created_at: string}>)]` — hard cast with no validation |
| **Fix** | `Array.isArray(alumni)` check + `.filter()` with type guard validating `a.id`, `a.full_name`, `a.created_at` exist before use |

#### `survey-response-table.tsx` — Missing null guard

| Field | Detail |
|-------|--------|
| **File** | `src/routes/dashboard/-components/survey-response-table.tsx` |
| **Fix** | `if (!data \|\| !data.rows \|\| data.rows.length === 0)` early return |

#### `competencies-table.tsx` — Missing null guard on weightedMeans

| Field | Detail |
|-------|--------|
| **File** | `src/routes/dashboard/-components/competencies-table.tsx` |
| **Fix** | `if (!data \|\| !data.rows \|\| data.rows.length === 0)` early return + `const safeMeans = weightedMeans ?? []` |

---

## 4. Fixes Applied

### Summary of All File Changes

| # | File | Change | Category |
|---|------|--------|----------|
| 1 | `electron/ipc/system.ipc.ts` | `data: app.getVersion()` (was `data: { version: ... }`) | IPC Shape |
| 2 | `electron/ipc/alumni.ipc.ts` | `data: id` (was `data: { id }`) | IPC Shape |
| 3 | `electron/ipc/export.ipc.ts` | `data: filePath` × 3 handlers (was `data: { filePath }`) | IPC Shape |
| 4 | `electron/services/analytics.service.ts` | Wraps all results in `SurveyTableData` shape | Data Shape |
| 5 | `electron/database/analytics.repository.ts` | Added `getCompetencyFrequency()`, `getJsonArrayFrequency()`, explicit `(row: unknown[])` types | Data Shape |
| 6 | `src/routes/dashboard/-components/survey-response-table.tsx` | `!data.rows` null guard | Null Guard |
| 7 | `src/routes/dashboard/-components/competencies-table.tsx` | `!data.rows` + `safeMeans` null guards | Null Guard |
| 8 | `src/routes/dashboard/-components/recent-activity.tsx` | Safe `Array.isArray()` + filter type guard | Type Safety |
| 9 | `src/routes/dashboard/index.tsx` | `EmploymentChart` data `?? []` | Null Guard |
| 10 | `src/routes/dashboard/-types/analytics.types.ts` | Exported `RateResult` type | Type Export |
| 11 | `src/routes/alumni/-components/alumni-table.tsx` | `safeAlumni = alumni ?? []` | Null Guard |
| 12 | `src/routes/alumni/index.tsx` | `(alumni ?? []).length` | Null Guard |
| 13 | `src/routes/email/-components/email-history-table.tsx` | `!history \|\| history.length === 0` | Null Guard |
| 14 | `src/routes/email/-components/received-emails-table.tsx` | `!received \|\| received.length === 0` | Null Guard |

**Total files modified:** 14
**Lines of code changed:** ~120

---

## 5. Root Cause Analysis

### Why Did These Bugs Exist?

**1. No enforced IPC contract layer**

The IPC pattern uses a generic `invoke<T>()` wrapper that assumes `result.data` matches `T`. However, there is no compile-time enforcement that the handler's `data:` field actually matches the client's generic. Each handler was written independently, and some authors wrapped return values in objects out of habit.

**Prevention:** The `IpcResponse<T>` type in `electron/types/ipc.types.ts` should be consistently applied. Consider a build-time check or integration test that validates IPC handler return shapes.

**2. Analytics data shape evolved without frontend update**

The analytics repository was written first with raw `{ value, count }[]` returns. The frontend was written later expecting `SurveyTableData` with `{ column, label, rows }`. The service layer (which should bridge this gap) was initially a pass-through.

**Prevention:** Define shared types in `shared/types/analytics.types.ts` and use them in both the service return signatures and the frontend consumer types.

**3. No defensive coding for async data**

React components assumed props would always be populated arrays. Since data comes from async IPC calls, there's a temporal gap between mount and data arrival where props are `undefined` or `null`.

**Prevention:** All components receiving async data should either:
- Accept `T | null` and handle the null case
- Have the parent ensure non-null before rendering (preferred for complex tables)

---

## 6. Verification Results

### TypeScript Compilation

```
$ pnpm build
✔ Build completed in 4.98s
✔ 0 errors, 0 warnings
```

All 14 modified files compile clean with strict TypeScript.

### Smoke Test

```
$ node tests/smoke-test.cjs
Total: 89 checks
✅ Passed: 89
❌ Failed: 0
Verdict: 🟢 ALL CLEAR
```

89/89 checks pass — project structure, dependencies, config validation, build output, and implementation checks all verified.

### Error Diagnostics

TypeScript language server reports **0 errors** across all modified files.

---

## 7. IPC Contract Reference

This is the definitive reference for what each IPC handler **must return** in its `data:` field.

### Pattern

All IPC handlers return:
```typescript
// Success
{ success: true, data: <VALUE> }

// Failure
{ success: false, error: string }
```

The client's `invoke<T>()` unwraps `result.data as T`. The value in `data:` **must** be a plain value matching `T`.

### Channel → Return Type Map

| Channel | Client Type `T` | Handler `data:` Must Be |
|---------|-----------------|------------------------|
| `system:getVersion` | `string` | `app.getVersion()` (plain string) |
| `system:getInfo` | `Record<string, string>` | Object with version, electron, chrome, etc. |
| `auth:login` | `{ user, token }` | Object (already correct) |
| `auth:logout` | `void` | Omitted (already correct) |
| `auth:getSession` | `{...} \| null` | Session object or null (already correct) |
| `auth:getAccounts` | `Account[]` | Array (already correct) |
| `auth:createAccount` | `void` | Omitted (already correct) |
| `auth:updateAccount` | `void` | Omitted (already correct) |
| `alumni:getAll` | `Alumni[]` | Array (already correct) |
| `alumni:getById` | `Alumni` | Object (already correct) |
| `alumni:create` | `number` | `id` (plain number) |
| `alumni:update` | `void` | Omitted (already correct) |
| `alumni:delete` | `void` | Omitted (already correct) |
| `analytics:getDashboard` | `DashboardData` | Object (already correct) |
| `analytics:getSurveyData` | `SurveyTableData` | `{ column, label, rows }` (already correct) |
| `analytics:getWeightedMeans` | `WeightedMeanResult[]` | Array (already correct) |
| `profiling:getProfile` | `AlumniProfile` | Object (already correct) |
| `profiling:getTimeline` | `TimelineEntry[]` | Array (already correct) |
| `export:pdf` | `string` | `filePath` (plain string) |
| `export:docx` | `string` | `filePath` (plain string) |
| `export:excel` | `string` | `filePath` (plain string) |
| `email:send` | `void` | Omitted (already correct) |
| `email:getHistory` | `EmailRecord[]` | Array (already correct) |
| `email:getReceived` | `EmailRecord[]` | Array (already correct) |
| `settings:get` | `Settings` | Object (already correct) |
| `settings:save` | `void` | Omitted (already correct) |
| `sync:getStatus` | `SyncStatus` | Object (already correct) |
| `sync:pull` / `sync:push` / `sync:full` | `SyncResult` | Object (already correct) |

### Rule

> **When adding new IPC handlers:** Always verify the `data:` field contains a plain value matching the client's generic type `T`. Never wrap primitives in objects. Test by checking what `ipcClient.<domain>.<method>()` expects to receive.

---

## Appendix: Routes & Components Verified Clean

The following routes and components were audited and found **free of issues**:

| Route | Status | Notes |
|-------|--------|-------|
| `/login` | ✅ Clean | Standalone auth page |
| `/` (Dashboard) | ✅ Fixed | 3 components + 1 hook fixed |
| `/alumni` | ✅ Fixed | Table + index page fixed |
| `/alumni/add` | ✅ Clean | Form uses react-hook-form + zod |
| `/alumni/edit/:id` | ✅ Clean | Pre-filled form |
| `/profiling` | ✅ Clean | Search/browse |
| `/profiling/:id` | ✅ Clean | 3-tab profile detail |
| `/sync` | ✅ Clean | Pull/push/full/auto |
| `/email` | ✅ Fixed | History + received tables fixed |
| `/email/compose` | ✅ Clean | Template vars + preview |
| `/reports` | ✅ Clean | Export filters |
| `/settings` | ✅ Clean | SMTP + Sheets + accounts |
| `/help` | ✅ Clean | 3-tab manual |
| `/about` | ✅ Clean | System info (version fix) |

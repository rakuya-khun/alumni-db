# Alumni DB — AI Agent Instructions

> Comprehensive instructions for AI coding agents working on the Alumni DB Management System.
> This complements `.github/copilot-instructions.md` with deeper context, implementation patterns, and decision guidelines.

---

## 1. Project Context

**Alumni DB** is an offline-first Electron desktop application for managing alumni tracer study data at **Southern Luzon State University (SLSU), College of Engineering**. It supports **PTC-ACBET accreditation by 2027** via Outcome-Based Education (OBE) evaluation.

It serves 4 user roles:

| Role | Scope | Admin Access |
|------|-------|-------------|
| **Dean** | All 3 programs (CE, CpE, EE) | Full: accounts, settings, sync, DB |
| **CE Chair** | CE data only | Preferences only |
| **CpE Chair** | CpE data only | Preferences only |
| **EE Chair** | EE data only | Preferences only |

The app has **10 features**: Login & Accounts, Dashboard, Alumni Directory, Alumni Profiling, Reports & Export, Data Sync, Email, Settings, Help, About.

**Key constraints:**
- Primary users are faculty members (Dean and Chairpersons) who may not be tech-savvy. All UIs should be clear, simple, and well-labeled.
- Only alumni who graduated **2018 or later** (5-year post-graduation evaluation window). Enforce `year_graduated >= 2018` in Zod schemas and the service layer.

### 4 OBE KPIs (Key Performance Indicators)

1. **% Board Passers** — alumni who passed the PRC licensure exam
2. **% Employed** — alumni who are currently employed
3. **% Field-Related** — alumni employed in their field of study
4. **% Supervisory/Managerial** — alumni in supervisory+ positions (CpE uses 6-tier job classification; CE/EE use Yes/No)

### Questionnaire Structure

All 3 programs (CE, CpE, EE) share an identical **7-section** Google Form with ~42 questions:
1. Personal Information
2. Educational Background
3. Employment Details
4. Competency Assessment (9 Likert items, 1–5 scale)
5. Curriculum Relevance (1–5 scale)
6. Professional Development
7. Challenges & Recommendations

**Program-specific differences:** professional titles, industry sector options, specialization lists, job classification tiers. See `docs/technical/data-dictionary.md` for the full ~58-column mapping.

---

## 2. Authentication Architecture

Accounts are stored in a Google Sheets "Accounts" tab — NOT in the local database.

### Login Flow

```
Launch → Login Screen → Enter Credentials
  ├── Online? → Read Sheets "Accounts" tab → Verify → Cache locally (encrypted)
  └── Offline? → Read encrypted local cache → Verify
→ Role Detection → Load Filtered Dashboard
```

### Rules

1. **First account:** Manually added to the Sheets "Accounts" tab (no self-registration)
2. **Dean can add accounts** via the Settings page or directly on the spreadsheet
3. **Offline fallback:** Encrypted cache at `{userData}/auth-cache.enc`, populated on first successful online login
4. **Lockout:** 3 failed attempts → 5-minute lockout (counter persists in `auth.store`, survives page navigation but NOT app restart)
5. **Session:** Stored in Zustand `auth.store`, ends on app close
6. **`is_active` column:** Dean can deactivate accounts without deleting them

### When implementing auth-related features:

- Always check `auth.store.currentUser.role` before showing admin UI
- Always pass `auth.store.accessiblePrograms` to data-fetching IPC calls
- Always apply `WHERE program IN (?)` in repositories for alumni data queries
- Never store plaintext passwords — use bcrypt hashing
- Use AES-256-GCM (via `crypto.ts`) for the offline auth cache

---

## 3. Data Architecture

### Local Database (sql.js)

5 tables: `alumni` (~58 columns), `alumni_history`, `email_history`, `settings`, `meta`

### Google Sheets (External)

2 tabs in the same spreadsheet:
1. **Alumni Data tab** — Alumni records (synced bidirectionally)
2. **Accounts tab** — User accounts for authentication (managed by Dean)

### The separation matters:

- Alumni data lives in BOTH local DB and Sheets (synced)
- Accounts live ONLY in Sheets + encrypted local cache (never in sql.js)
- Settings live ONLY in local DB (never in Sheets)

### Sync Composite Key

Records are matched between local DB and Google Sheets using: `full_name + program + year_graduated`

### 4 Sync Modes

1. **Pull** — Sheets → local DB
2. **Push** — local DB → Sheets
3. **Full Sync** — Pull → resolve conflicts → Push
4. **Auto-Sync** — interval-based automatic full sync, pauses on conflict or offline

---

## 4. Role-Based Data Scoping

**This is the most critical pattern in the entire codebase.** Every data-fetching operation must respect role scope.

### Implementation Pattern

```typescript
// In any hook that fetches alumni data:
const { accessiblePrograms } = useAuthStore();
const data = await ipcClient.alumni.getAll({ programs: accessiblePrograms });

// In any repository:
findAll(programs: string[]): Alumni[] {
  return db.exec(`SELECT * FROM alumni WHERE program IN (${programs.map(() => '?').join(',')})`, programs);
}
```

### Where to apply:

| Module | What's filtered |
|--------|----------------|
| Dashboard | All stat cards, survey tables, charts |
| Alumni Directory | Alumni list, search results |
| Alumni Profiling | Profile list, profile access check |
| Reports & Export | Exported data, stats in headers |
| Email | Recipient list (can only email own program's alumni) |
| Settings | Accounts section visible to Dean only |

---

## 5. Implementation Patterns

### Adding a New Feature

1. Create route folder: `src/routes/<name>/index.tsx` + `-components/`, `-hooks/`, `-schemas/`
2. Add route to `src/app/router.tsx`
3. Add IPC handler: `electron/ipc/<name>.ipc.ts`
4. Add service: `electron/services/<name>.service.ts`
5. Add repository (if DB): `electron/database/<name>.repository.ts`
6. Add IPC channel names to `shared/ipc-channels.ts`
7. Add types to `shared/types/<name>.types.ts`

### Adding a New IPC Channel

```typescript
// 1. shared/ipc-channels.ts
export const CHANNELS = {
  // ... existing
  'newDomain:action': 'newDomain:action',
} as const;

// 2. electron/ipc/new-domain.ipc.ts
ipcMain.handle(CHANNELS['newDomain:action'], async (_, payload) => {
  // Validate → call service → return result
  return service.doSomething(payload);
});

// 3. src/data/ipc-client.ts
newDomain: {
  action: (payload) => window.electron.invoke(CHANNELS['newDomain:action'], payload),
}
```

### Form Implementation

Always use `react-hook-form` + `zod`:

```typescript
// 1. Define schema in -schemas/
const mySchema = z.object({
  field: z.string().min(1, "Required").max(100),
});

// 2. Use in component
const form = useForm({ resolver: zodResolver(mySchema) });

// 3. Handle submit
const onSubmit = form.handleSubmit(async (data) => {
  await ipcClient.domain.create(data);
});
```

---

## 6. Common Anti-Patterns to Avoid

| ❌ Don't | ✅ Do Instead |
|----------|--------------|
| Import from `electron/` in `src/` | Use IPC via `ipc-client.ts` |
| Run SQL in services | Call repository methods |
| Put business logic in IPC handlers | Keep handlers thin; logic in services |
| Use `writeFileSync` for DB saves | Use `safeSave()` from `db-manager.ts` |
| Import from one route into another | Extract to `src/features/` or `src/` shared |
| Use `Context` for global state | Use Zustand stores |
| Forget role-based filtering | Always apply `WHERE program IN (?)` |
| Store passwords in plaintext | Hash with bcrypt, encrypt cache with AES-256-GCM |
| Hardcode IPC channel strings | Import from `shared/ipc-channels.ts` |
| Skip dark mode variants | Add `dark:` Tailwind classes to all new components |
| Skip form validation | Always use Zod schemas for every input |

---

## 7. Validation Standards

Every form in the application must have comprehensive Zod validation:

| Form | Required Validations |
|------|---------------------|
| **Login** | Username: min 3, max 50, alphanumeric+._- only. Password: min 6, max 128. |
| **Account Creation** | Username: min 3, unique. Password: min 8. Role: enum. Full name: min 1. |
| **Alumni Form** | full_name: required. program: enum. year_graduated: range. Likert scales: 1–5. Conditional fields. |
| **Settings (SMTP)** | Host: required. Port: 1–65535. Username: email format. Password: required. |
| **Settings (Sheets)** | Sheet ID: required. Service key: valid JSON. Sheet name: required. |
| **Email Compose** | Subject: required, max 200. Body: required. Recipients: ≥1. |
| **Export Filters** | Valid program/year/specialization combinations. |

---

## 8. Dark Mode

- Tailwind config: `darkMode: 'class'` in `tailwind.config.ts`
- Toggle: `dark` class on `<html>` element
- Persisted: `settings` table → `dark_mode` key
- All components must include `dark:` variants for backgrounds, text, borders

---

## 9. Layout & Component Generation

The UI adapts the **Donezo** project management dashboard template. When generating components:

### Shell Structure

Every authenticated page renders inside `AppLayout` which provides:
- **Fixed sidebar** (`src/layouts/sidebar.tsx`): `w-64` expanded / `w-16` collapsed. 4 nav groups: MENU → ALUMNI → TOOLS → SYSTEM. Logout at bottom.
- **Fixed top bar** (`src/layouts/top-bar.tsx`): Global search, notification bell (pending sync count), user avatar + name + role badge.
- **Main content area**: Scrollable, `bg-surface-secondary`, cards inside.

### Component Style Rules

| Element | Pattern |
|---------|---------|
| All cards | `rounded-xl border bg-card shadow-sm p-6` |
| Highlighted stat card | `rounded-xl bg-primary text-primary-foreground p-6 shadow-sm` |
| Stat card row | `grid grid-cols-4 gap-4` |
| Page header | `flex items-center justify-between mb-6` — title left, actions right |
| Data tables | Full-width card wrapper, `<table>` with sort headers |
| Form sections | Card per section, vertical stack |

### Color Usage

- **Always use semantic Tailwind classes** that reference CSS custom properties: `bg-primary`, `text-sidebar-text`, `bg-surface-secondary`, `bg-card`, `border-card-border`
- **Never use raw Tailwind color values** like `bg-red-800` or `text-gray-500` — these break when the color palette is swapped
- **Status colors** are OK as raw Tailwind: `text-green-500` for success, `text-red-500` for error, etc. (or use `text-success`, `text-error` from tokens)
- **Brand color is Maroon #9B2335** — accent values are `--color-accent: 155 35 53`, `--color-accent-light: 192 75 92`

### UX Priority: Non-IT Faculty Users

Users are non-technical. **High UI/UX score is a grading criterion.** When generating ANY component:

- Buttons: `h-10 px-6` minimum, always with text labels (not icon-only)
- Plain language in all UI text — "Upload changes" not "Push", "Spreadsheet" not "API"
- Confirmation dialogs on every destructive action with clear consequence description
- Visual feedback always: loading spinners → success toasts or error messages with recovery steps
- Generous spacing: `gap-4`+, `p-6` padding, `mb-6` between sections
- Status indicators: color + icon + text (never color-alone for accessibility)
- Error messages must include "what to do next" guidance
- See `docs/FINAL-IMPLEMENTATION-PLAN.md` § "UX Guidelines for Non-IT Faculty Users" for full checklist

### Icon Library

- **Recommended:** `lucide-react` (not yet installed — run `pnpm add lucide-react` first)
- Import pattern: `import { LayoutDashboard, Users, RefreshCw } from 'lucide-react'`
- Sidebar nav items, stat cards, action buttons all use icons

---

## 10. Current Codebase Status

> **~95% of files are empty scaffolds (0 bytes).** Only config files have content.

### What's Working

- All 12 build/config files are verified correct (electron.vite.config, electron-builder.yml, 3 tsconfigs, tailwind, postcss, package.json, index.html, preload.ts, main.tsx, globals.css)
- `electron/preload.ts` has a working IPC bridge
- `src/main.tsx` has a working React entry point
- All dependencies are installed in `node_modules/`

### What Needs Enhancement (Has Content, Incomplete)

- `electron/main.ts` — bare `createWindow()` only. Needs: `setupErrorHandlers()` → `initDb()` → `registerIpcHandlers()` → `createWindow()`
- `src/App.tsx` — placeholder div. Needs: router + theme provider
- `tailwind.config.ts` — needs extended `theme.colors` with CSS variable references
- `src/styles/globals.css` — needs CSS custom properties (design tokens) added

### What's Empty (All 0 Bytes)

`electron/config/` (3), `electron/database/` (9), `electron/integrations/` (6), `electron/ipc/` (10), `electron/services/` (10), `electron/types/` (3), `electron/utils/` (5), `shared/types/` (6+), `shared/schemas/` (4+), `src/stores/` (7), `src/app/` (4), `src/routes/` (~128 files across 9 subdirs), `src/layouts/` (3), `src/lib/` (3), `src/data/` (1), `src/hooks/` (5), `src/types/` (7), `src/contexts/` (1+)

---

## 11. Implementation Plan Reference

**Always consult `docs/FINAL-IMPLEMENTATION-PLAN.md` before implementing any feature.** It contains:

- **229 items** across **12 phases** with exact file paths, component names, and responsibilities
- Phase-by-phase build order (Foundation → Main Process → DB → IPC → Services → Types/Stores → Layout → Pages → Tests)
- The complete route tree with every component, hook, schema, and type listed per page
- Design token values (CSS custom properties for light + dark mode)
- Tailwind config extensions
- Asset swap instructions for when logo/colors arrive

### Phase Order (Must Follow)

1. Foundation: error handling, config, logger (`electron/config/`, `electron/utils/`)
2. Main process: `electron/main.ts` lifecycle
3. Database: sql.js init, schema, repositories (`electron/database/`)
4. IPC: channels + handler registration (`shared/ipc-channels.ts`, `electron/ipc/`)
5. Services + Integrations (`electron/services/`, `electron/integrations/`)
6. Shared types, Zod schemas, Zustand stores, hooks (`shared/`, `src/stores/`, `src/hooks/`)
7. Theming, layout shell, router (`src/styles/`, `src/layouts/`, `src/app/`)
8. Login + Dashboard pages
9. Alumni Directory + Profiling pages
10. Sync + Email + Reports pages
11. Settings + Help + About pages
12. Smoke tests + build verification

---

## 12. Resolved Design Decisions

These decisions were made during project planning. Do NOT revisit them:

| Decision | Resolution |
|----------|------------|
| System Admin role | **No** — Dean handles all admin functions |
| Research/Project Outputs fields | **Not included** — not formalized into questionnaire questions |
| Micro-Credentials fields | **Not included** — docs win over client paper proposal |
| Community & Industry Engagement fields | **Not included** — docs win over client paper proposal |
| Number of sync modes | **4** — Pull, Push, Full Sync, Auto-Sync Timer |
| Dashboard path | `/` not `/dashboard` |
| Help page | **Separate route** `/help` with 3 tabs (User Manual, FAQ, Troubleshooting) — distinct from `/about` |
| Color palette | **Maroon #9B2335** — SLSU College of Engineering brand. CSS vars finalized. Only logo asset pending |
| Logo | **Text fallback** "Alumni DB" until client provides image |

---

## 13. Quick Reference

### Programs & Their Abbreviations

| Full Name | Abbreviation | DB Value |
|-----------|-------------|----------|
| Bachelor of Science in Civil Engineering | BSCE | `BSCE` |
| Bachelor of Science in Computer Engineering | BSCpE | `BSCpE` |
| Bachelor of Science in Electrical Engineering | BSEE | `BSEE` |

### User Roles

| Role | DB/Sheet Value | Programs | Admin |
|------|---------------|----------|-------|
| Dean | `dean` | All | Full |
| CE Chairperson | `ce_chair` | BSCE | Prefs only |
| CpE Chairperson | `cpe_chair` | BSCpE | Prefs only |
| EE Chairperson | `ee_chair` | BSEE | Prefs only |

### Sync Statuses

| Status | Meaning |
|--------|---------|
| `pending` | Created/edited locally, not yet pushed to Sheets |
| `synced` | In sync with Google Sheets |
| `conflict` | Differs from Sheets, needs manual resolution |

### Documentation Map

| Topic | File |
|-------|------|
| **Implementation Plan (START HERE)** | `docs/FINAL-IMPLEMENTATION-PLAN.md` |
| Original gap analysis | `docs/IMPROVEMENT-PLAN.md` |
| Tech stack & requirements | `docs/technical/overview.md` |
| Architecture & data flow | `docs/technical/architecture.md` |
| Database schema & SQL | `docs/technical/database.md` |
| Field mapping (~58 cols) | `docs/technical/data-dictionary.md` |
| System flowcharts | `docs/technical/alumni-db-flowcharts.md` |
| Feature docs | `docs/features/*.md` |
| Client thesis (extracted) | `docs/client/pdf-extracted.txt` |
| Client questionnaires | `docs/client/*.docx` |

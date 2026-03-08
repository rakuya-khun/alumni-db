# Alumni DB — GitHub Copilot Instructions

> This file provides project context for GitHub Copilot and AI coding agents.
> It is automatically read when working in this repository.

---

## Project Summary

**Alumni DB Management System** — An offline-first Electron desktop application (Windows `.exe`) for managing, analyzing, and exporting alumni survey data from three engineering programs (CE, CpE, EE). Data is collected via Google Forms, stored locally in sql.js, and synced with Google Sheets. Access is controlled through role-based authentication with 4 roles (Dean, CE Chair, CpE Chair, EE Chair), with accounts stored in a Google Sheets "Accounts" tab and an encrypted offline login fallback.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Desktop Shell | Electron (Latest LTS) |
| Frontend | React 18+, Vite, TypeScript |
| Routing | React Router v6 (login gate → hub-and-spoke) |
| State | Zustand ^4.x.x |
| Styling | Tailwind CSS ^3.x.x + shadcn/ui (Radix primitives), `darkMode: 'class'` |
| Forms | react-hook-form + zod ^3.x.x |
| Database | sql.js (SQLite compiled to WASM) — single `.db` file on disk |
| Email | nodemailer (SMTP) |
| Google API | googleapis (Sheets API v4 — alumni data sync + accounts auth) |
| Auth | bcryptjs (password hashing), AES-256-GCM (encrypted offline cache) |
| Exports | jspdf + jspdf-autotable (PDF), docx (Docx), exceljs (Excel) |
| Package Manager | pnpm |

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

## Naming Conventions

| Convention | Usage | Examples |
|-----------|-------|---------||
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

| Path | Feature | Role Access |
|------|---------|-------------|
| `/login` | Login & Authentication | All (entry point) |
| `/dashboard` | Analytic Dashboard (hub) | Role-filtered |
| `/alumni` | Alumni Directory | Role-filtered |
| `/alumni/add` | Add Alumni | Role-filtered |
| `/alumni/edit/:id` | Edit Alumni | Role-filtered |
| `/profiling` | Alumni Profiling search | Role-filtered |
| `/profiling/:id` | Alumni Profile detail | Role-filtered |
| `/email` | Email Compose | Role-filtered recipients |
| `/email/history` | Email History | All |
| `/email/received` | Received Emails | All |
| `/sync` | Data Synchronization | All |
| `/reports` | Reports & Exports | Role-filtered |
| `/settings` | Settings | Dean: full, Chairpersons: preferences only |
| `/about` | About | All |

---

## Documentation

For detailed information, see the `docs/` folder:

- [docs/technical/overview.md](../docs/technical/overview.md) — Tech stack, requirements, feature mapping
- [docs/technical/architecture.md](../docs/technical/architecture.md) — Project structure, naming, layers, data flow
- [docs/technical/database.md](../docs/technical/database.md) — sql.js, schema, crash protection, key queries
- [docs/technical/data-dictionary.md](../docs/technical/data-dictionary.md) — Questionnaire → DB column mapping
- [docs/technical/alumni-db-flowcharts.md](../docs/technical/alumni-db-flowcharts.md) — System flowcharts (v2.0, 10 modules)
- [docs/technical/proposed_sitemap_by_client.md](../docs/technical/proposed_sitemap_by_client.md) — Original client requirements
- [docs/features/](../docs/features/) — Per-feature documentation (login, dashboard, alumni, profiling, email, sync, reports, settings, about)

---

## Code Generation Guidelines

When generating code for this project:

1. **Always use TypeScript** — `.ts` for logic, `.tsx` for React components
2. **Use `kebab-case` filenames** — never `camelCase` or `PascalCase` for files
3. **Prefix route modules with `-`** and feature modules with `_`
4. **Use Zustand for state** — no Redux, no Context for global state
5. **Use react-hook-form + zod for forms** — no uncontrolled forms, no manual validation
6. **Use shadcn/ui components** — import from `@/components/ui/`
7. **SQL in repositories only** — services call repositories, never run SQL directly
8. **IPC handlers are thin** — validate input, call service, return result
9. **Encrypt sensitive data** — SMTP passwords and auth cache encrypted via `electron/utils/crypto.ts`
10. **Atomic saves** — always use `safeSave()` from `db-manager.ts`, never raw `writeFileSync`
11. **Role-based filtering** — always apply `WHERE program IN (?)` from `auth.store.accessiblePrograms`
12. **Dark mode support** — use Tailwind `dark:` variants on all new components
13. **Validate all inputs** — Zod schemas for every form (login, alumni, settings, accounts, export filters)

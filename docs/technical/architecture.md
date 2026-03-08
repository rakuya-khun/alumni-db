# Alumni DB — Architecture

> **Pattern:** Feature-Sliced Design + Clean Architecture
> **Processes:** Electron main (backend) + React renderer (frontend)
> **Bridge:** IPC (Inter-Process Communication) via preload context bridge
> **Auth:** Login gate → role-based data scoping throughout

---

## Naming Conventions

| Convention | Usage | Examples |
|-----------|-------|---------||
| `kebab-case` | All folders and files | `alumni-form.tsx`, `email-history/` |
| `_kebab-case` | Feature domain's specific common modules | `_components/`, `_hooks/`, `_types/` |
| `-kebab-case` | Route domain's specific common modules | `-components/`, `-hooks/`, `-types/` |
| `PascalCase` | Classes, types, interfaces, React components | `Alumni`, `SmtpSettings`, `AlumniForm` |
| `snake_case` | Database tables and columns | `alumni`, `email_history`, `sync_status` |
| `camelCase` | Functions, Zod schemas, variables, hooks | `useAlumni`, `alumniSchema`, `formatDate` |

---

## Domain Folders

| Folder | Purpose |
|--------|---------|
| `electron/` | Main process — Node.js backend (database, IPC, auth, integrations) |
| `src/` | Renderer process — React frontend + shared common modules |
| `src/routes/` | Route-level pages (login gate → hub-and-spoke navigation) |
| `src/features/` | Feature domain modules **(Only if necessary)** |
| `shared/` | Code shared between Electron and Renderer (types, schemas, IPC channels) |

---

## Common Modules

These modules can appear at any level — shared (`src/`), feature (`_`-prefixed), or route (`-`-prefixed):

| Module | Purpose |
|--------|---------|
| `assets/` | Static assets (images, fonts, icons) |
| `components/` | UI components (dumb/presentational) |
| `constants/` | Constant values and enums |
| `contexts/` | React Context API providers |
| `data/` | Data access layer (IPC client calls) |
| `hooks/` | Custom hooks |
| `lib/` | 3rd party integration wrappers |
| `schemas/` | Zod validation schemas |
| `services/` | Business logic & orchestration **(Only if necessary)** |
| `stores/` | State stores (Zustand) |
| `types/` | TypeScript type definitions |
| `utils/` | Utility/helper functions |

### Miscellaneous Folders

| Folder | Purpose |
|--------|---------|
| `docs/` | Project documentation, flowcharts, dev guide |
| `resources/` | Static assets for Electron packaging (icons) |
| `.husky/` | Git hooks configuration (pre-commit, pre-push) |

---

## Project Structure

### Shared Modules (Renderer — `src/`)

Shared modules available to all routes and features:

```
src/
├── assets/                     # Shared static assets
├── components/                 # Shared dumb components
│   ├── ui/                     # Primitive UI kit (shadcn/ui: button, input, dialog, etc.)
│   └── shared/                 # App-specific shared components (page-header, filter-bar, etc.)
├── constants/                  # Shared constants (route paths, local storage keys)
├── contexts/                   # Shared React Context API providers
├── data/                       # Shared data access layer
│   └── ipc-client.ts           # Typed IPC invoke functions (renderer → main)
├── hooks/                      # Shared custom hooks
│   ├── use-ipc.ts              # Generic typed IPC invoke wrapper
│   ├── use-network.ts          # Online/offline detection from main process
│   ├── use-toast.ts            # Toast notification trigger
│   ├── use-debounce.ts         # Debounce for search inputs
│   └── use-auth.ts             # Access current user role, session, accessible programs
├── lib/                        # Shared 3rd party integrations
│   ├── template-engine.ts      # {{variable}} substitution logic
│   ├── formatters.ts           # Date formatting, number formatting, truncation
│   └── cn.ts                   # Tailwind className merge utility (clsx + twMerge)
├── stores/                     # Shared state stores (Zustand)
│   ├── auth.store.ts           # User session, role, accessible programs, lockout state
│   ├── alumni.store.ts         # Cached alumni list, filters, selected record
│   ├── profiling.store.ts      # Selected alumni profile, history snapshots
│   ├── analytics.store.ts      # Cached dashboard stats, survey table data
│   ├── settings.store.ts       # Cached settings, isConfigured flag
│   ├── sync.store.ts           # Sync status, last sync time, conflict count, unpushed flag
│   └── ui.store.ts             # Sidebar open/closed, active theme (dark/light), modals
├── types/                      # Shared types
│   ├── auth.types.ts           # UserSession, UserRole, LoginCredentials, AuthResult
│   ├── alumni.types.ts         # Alumni, AlumniFormData, AlumniFilters
│   ├── email.types.ts          # EmailCompose, EmailLog, EmailStatus
│   ├── sync.types.ts           # SyncStatus, SyncConflict, SyncResult
│   ├── settings.types.ts       # InstitutionSettings, SmtpSettings
│   ├── export.types.ts         # ExportType, ExportOptions, FilterCriteria
│   └── ipc.types.ts            # IPC channel names + payload types (mirrors electron/types)
└── utils/                      # Shared utilities
```

### Route Domain (Renderer — `src/routes/`)

Each route is a page in the login gate → hub-and-spoke navigation. Route-specific modules use the `-` prefix:

```
src/routes/<route-name>/
├── index.tsx                   # Route's index page
├── -components/                # Route's components (prefixed with -)
├── -constants/                 # Route's constants
├── -contexts/                  # Route's React Context API
├── -hooks/                     # Route's hooks
├── -schemas/                   # Route's Zod schemas
├── -types/                     # Route's types
└── -utils/                     # Route's utilities
```

> See individual [feature docs](features/) for the full route breakdowns per feature.

### Feature Domain (Optional — `src/features/`)

Only create features when logic is **shared across multiple routes** but doesn't belong in `src/` global shared modules. Feature-specific modules use the `_` prefix:

```
src/features/<feature-name>/
├── _assets/                    # Feature's assets
├── _components/                # Feature's components
├── _constants/                 # Feature's constants
├── _contexts/                  # Feature's React Context API
├── _data/                      # Feature's data access layer
├── _hooks/                     # Feature's custom hooks
├── _lib/                       # Feature's 3rd party integrations
├── _schemas/                   # Feature's Zod schemas
├── _services/                  # Feature's business logic
├── _stores/                    # Feature's state stores (Zustand)
├── _types/                     # Feature's types
└── _utils/                     # Feature's utilities
```

### Electron Backend (`electron/`)

The main process handles all Node.js operations. The renderer never accesses these directly — IPC is the bridge.

```
electron/
├── main.ts                             # App entry: create window, register IPC, lifecycle
├── preload.ts                          # Context bridge: exposes safe IPC API to renderer
│
├── config/                             # ── Configuration ──
│   ├── constants.ts                    # App-wide constants (DB file paths, default SMTP port, etc.)
│   ├── paths.ts                        # Resolved paths (userData, dbDir, logsDir, authCachePath)
│   └── env.ts                          # Environment detection (dev/prod/test)
│
├── database/                           # ── Data Persistence Layer (sql.js + Crash Protection) ──
│   ├── db-manager.ts                   # sql.js init, atomic save (write-rename), crash recovery
│   ├── schema.ts                       # CREATE TABLE statements, DB schema definition
│   ├── alumni.repository.ts            # Alumni CRUD via SQL (SELECT, INSERT, UPDATE, DELETE)
│   ├── alumni-history.repository.ts    # Alumni versioned snapshots (INSERT on every UPDATE)
│   ├── analytics.repository.ts         # Aggregation queries: counts, percentages, weighted means
│   ├── settings.repository.ts          # Settings key-value table read/write
│   ├── email-history.repository.ts     # Email log INSERT/query (completed/pending/failed status)
│   ├── sync-queue.repository.ts        # Pending sync records tracking (sync_status column)
│   └── migrations/                     # Data migration scripts
│       ├── index.ts                    # Migration runner (tracks version in DB `meta` table)
│       └── v1-to-v2.ts               # Example migration
│
├── services/                           # ── Business Logic Layer ──
│   ├── auth.service.ts                 # Authentication: login, offline fallback, lockout, cache mgmt
│   ├── alumni.service.ts               # Alumni business rules (validate, deduplicate, transform)
│   ├── alumni-history.service.ts       # Snapshot creation on update, history retrieval
│   ├── analytics.service.ts            # Dashboard analytics: survey frequency, weighted mean calcs
│   ├── email.service.ts                # Email composition, SMTP transport, template rendering
│   ├── sync.service.ts                 # Google Sheets sync engine (pull/push/full/conflict detect)
│   ├── auto-sync.service.ts            # Interval-based auto-sync scheduler
│   ├── export.service.ts               # PDF, Docx & Excel generation logic
│   ├── settings.service.ts             # Settings validation, SMTP connection test
│   └── conflict.service.ts             # Conflict detection algorithm, diff generation
│
├── ipc/                                # ── IPC Handler Layer (API surface for renderer) ──
│   ├── index.ts                        # Register all IPC handlers
│   ├── auth.ipc.ts                     # Handles: auth:login, auth:logout, auth:getSession,
│   │                                   #          auth:getAccounts, auth:createAccount, auth:updateAccount
│   ├── alumni.ipc.ts                   # Handles: alumni:getAll, alumni:create, alumni:update, alumni:delete
│   ├── profiling.ipc.ts               # Handles: profiling:getProfile, profiling:getHistory
│   ├── analytics.ipc.ts               # Handles: analytics:getDashboard, analytics:getSurveyTables
│   ├── email.ipc.ts                    # Handles: email:send, email:getHistory, email:getReceived
│   ├── sync.ipc.ts                     # Handles: sync:pull, sync:push, sync:full, sync:getStatus,
│   │                                   #          sync:autoSync, sync:resolveConflict
│   ├── export.ipc.ts                   # Handles: export:pdf, export:docx, export:excel, export:filtered
│   ├── settings.ipc.ts                 # Handles: settings:get, settings:save, settings:testSmtp, settings:testSheets
│   └── system.ipc.ts                   # Handles: system:getVersion, system:openExternal
│
├── integrations/                       # ── External Service Adapters ──
│   ├── google-sheets/
│   │   ├── client.ts                   # Google Sheets API v4 client setup (auth, instance)
│   │   ├── sheets.adapter.ts           # Read/write/append rows adapter (alumni data sheet)
│   │   ├── accounts.adapter.ts         # Read/write the "Accounts" tab (user auth data)
│   │   └── mapper.ts                   # Map Sheet rows ↔ Alumni/Account record objects
│   └── smtp/
│       ├── transport.ts                # Nodemailer transport factory
│       └── templates.ts                # HTML email base templates, variable substitution engine
│
├── utils/                              # ── Electron Utilities ──
│   ├── logger.ts                       # File-based logger
│   ├── error-handler.ts                # Global uncaught exception handler
│   ├── crypto.ts                       # Encrypt/decrypt: SMTP password, auth cache (AES-256-GCM)
│   ├── network.ts                      # Online/offline detection
│   └── updater.ts                      # Auto-update logic (optional)
│
└── types/                              # ── Electron-specific types ──
    ├── ipc.types.ts                    # IPC channel names & payload shapes
    ├── database.types.ts               # DB record shapes before they hit the renderer
    └── auth.types.ts                   # Account, CachedAccount, AuthResult shapes
```

### Shared Layer (`shared/`)

Single source of truth for contracts between Electron and Renderer:

```
shared/
├── ipc-channels.ts                     # All IPC channel names (single source of truth)
├── schemas/                            # Zod schemas used by BOTH processes
│   ├── alumni.schema.ts                # Alumni record IPC contract validation
│   ├── settings.schema.ts             # Settings validation
│   ├── login.schema.ts                # Login credentials validation
│   └── account.schema.ts              # Account creation/update validation
└── types/                              # TypeScript types used by BOTH processes
    ├── alumni.types.ts                 # Alumni record shape (all gform-mapped fields)
    ├── profiling.types.ts              # Alumni profile view + history snapshot types
    ├── analytics.types.ts              # Dashboard stats, survey table rows, weighted mean results
    ├── auth.types.ts                   # UserRole, UserSession, LoginCredentials, AuthResult
    ├── settings.types.ts
    └── sync.types.ts
```

> **Note on `alumni.schema.ts`:** Two files share this name at different levels. `shared/schemas/alumni.schema.ts` defines the IPC contract validation (used by both Electron and Renderer). `src/routes/alumni/-schemas/alumni.schema.ts` defines form-level UI validation rules (may extend or import from the shared schema). This is intentional — each schema serves a different layer.

### App Shell & Layout (`src/`)

```
src/
├── main.tsx                            # Vite entry: ReactDOM.createRoot
├── App.tsx                             # Root component: router + layout + auth gate
├── app/                                # ── App Shell ──
│   ├── router.tsx                      # React Router v6 config (all routes defined here)
│   ├── providers.tsx                   # Wraps app with context providers (theme, toast, etc.)
│   └── guards/
│       ├── auth-guard.tsx             # Redirects to /login if not authenticated
│       └── settings-guard.tsx          # Redirects to /settings if not configured (after login)
├── layouts/                            # ── Layout Components ──
│   ├── root-layout.tsx                 # Main layout: sidebar + content area
│   ├── sidebar.tsx                     # Navigation sidebar (hub-and-spoke links, role-aware items)
│   └── top-bar.tsx                     # Header bar: breadcrumbs, sync status, user name, dark mode toggle
└── styles/                             # ── Global Styles ──
    ├── globals.css                     # Tailwind directives, CSS variables, base reset, dark mode tokens
    └── print.css                       # Print-specific styles (@media print)
```

### Config & Tooling (Root)

```
alumni-db/
├── .github/                            # GitHub config + AI agent instructions
│   ├── copilot-instructions.md         # GitHub Copilot project context
│   └── ai-agent-instructions.md        # Comprehensive AI agent instructions
├── .husky/                             # Git hooks (pre-commit lint, pre-push test)
├── docs/                               # Project documentation
├── resources/                          # Static assets for Electron packaging (icons)
├── electron/                           # Main process (backend)
├── src/                                # Renderer process (frontend)
├── shared/                             # Shared contracts
├── .env.example                        # Environment variables template
├── .eslintrc.cjs                       # ESLint config
├── .prettierrc                         # Prettier config
├── .gitignore
├── electron-builder.yml                # Electron Builder packaging config
├── package.json
├── pnpm-lock.yaml                      # Lock file (pnpm)
├── tsconfig.json                       # Base TypeScript config
├── tsconfig.electron.json              # TS config for electron/ (Node target)
├── tsconfig.renderer.json              # TS config for src/ (DOM target)
├── vite.config.ts                      # Vite config with electron-vite plugin
├── tailwind.config.ts                  # Tailwind CSS config (darkMode: 'class')
├── postcss.config.js                   # PostCSS (required by Tailwind)
└── README.md
```

---

## Architecture Principles

| Principle | How It's Applied |
|-----------|-----------------||
| **Feature-Sliced Design** | Each route is a self-contained folder under `src/routes/` with its own `-components/`, `-hooks/`, `-schemas/`, etc. Features under `src/features/` use `_`-prefixed modules. No cross-domain imports except through shared layers. |
| **Clean Separation** | `electron/` = backend (Node.js, file I/O, APIs). `src/` = frontend (React, UI, state). `shared/` = contract between the two. They never import each other directly — IPC is the bridge. |
| **Repository Pattern** | `electron/database/*.repository.ts` files handle all data persistence via SQL queries. Services never touch the DB directly — they go through repositories. |
| **Service Layer** | `electron/services/*.service.ts` files contain business logic. IPC handlers are thin — they validate input, call a service, return the result. |
| **Adapter Pattern** | External integrations (Google Sheets, SMTP) are isolated in `electron/integrations/`. Swap one adapter to change providers. The Accounts adapter reads the "Accounts" tab. |
| **Single Source of Truth** | IPC channel names and shared types live in `shared/`. Both processes import from here, so they can never go out of sync. |
| **Colocation** | Route-specific code lives next to the route's `index.tsx` in `-`-prefixed folders. Feature-specific modules use `_`-prefixed folders. Shared UI components live in `src/components/`. |
| **Role-Based Scoping** | Every data-fetching operation applies `WHERE program IN (?)` filters based on the authenticated user's role. The auth store provides `accessiblePrograms`. |

---

## Data Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                     RENDERER (React + Vite)                     │
│                                                                 │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ Zustand   │   │ React    │   │ Hooks    │   │ IPC      │  │
│  │ Store     │◄──│ Pages    │──►│ (use*)   │──►│ Client   │  │
│  │ (cache)   │   │ + Comps  │   │          │   │          │  │
│  └──────────┘   └──────────┘   └──────────┘   └────┬─────┘  │
│                                                      │        │
└──────────────────────────────────────────────────────│────────┘
                        IPC Bridge (preload.ts)         │
┌──────────────────────────────────────────────────────│────────┐
│                     MAIN PROCESS (Electron/Node.js)  │        │
│                                                      ▼        │
│  ┌──────────┐   ┌──────────┐   ┌──────────┐   ┌──────────┐  │
│  │ IPC      │──►│ Services │──►│ Repos    │──►│ sql.js   │  │
│  │ Handlers │   │ (logic)  │   │ (SQL)    │   │ (.db)    │  │
│  └──────────┘   └─────┬────┘   └──────────┘   └──────────┘  │
│                        │                                      │
│                        ▼                                      │
│                 ┌──────────────┐                               │
│                 │ Integrations │                               │
│                 │ • Sheets API │ ← Alumni data + Accounts tab  │
│                 │ • Nodemailer │                               │
│                 │ • Auth Cache │ ← Encrypted local account file│
│                 └──────────────┘                               │
└──────────────────────────────────────────────────────────────┘
```

### Auth Flow (Login)

1. `src/routes/login/index.tsx` calls `use-login` hook
2. Hook validates with `login.schema.ts` → calls `ipcClient.auth.login(credentials)` via IPC
3. `auth.ipc.ts` receives the call, invokes `authService.login(credentials)`
4. `authService` calls `accountsAdapter.fetchAccounts()` (reads Google Sheets "Accounts" tab)
5. If offline → falls back to `crypto.ts` to decrypt local auth cache
6. Data flows back: adapter → service → IPC → hook → `auth.store` → redirect to `/dashboard`

### Read Flow (Dashboard loads alumni stats)

1. `src/routes/dashboard/index.tsx` calls `use-dashboard-stats` hook
2. Hook calls `ipcClient.analytics.getDashboard(role)` (renderer → main via IPC)
3. `analytics.ipc.ts` receives the call, invokes `analyticsService.getDashboard(role)`
4. `analyticsService` calls `analyticsRepository.getStats(accessiblePrograms)`
5. Repository runs aggregation SQL queries with `WHERE program IN (?)`, returns computed results
6. Data flows back: repo → service → IPC → hook → Zustand store → React re-render

### Write Flow (Add new alumni)

1. `alumni-form.tsx` submits data validated by `alumni.schema.ts` (Zod)
2. Hook calls `ipcClient.alumni.create(data)` via IPC
3. `alumni.ipc.ts` → `alumniService.create(data)` (applies business rules, adds timestamps)
4. Service calls `alumniRepository.insert(record)` → runs `INSERT INTO alumni` + atomic save
5. Service calls `syncQueueRepository.enqueue(record.id)` → marks as "Pending Sync"
6. IPC returns success → hook updates Zustand store → UI updates

---

## Layer Responsibilities

| Layer | Location | Responsibility | Can Import From |
|-------|----------|---------------|-----------------||
| **Login Page** | `src/routes/login/index.tsx` | Authentication form, lockout display | Own route's `-` modules. Shared components. |
| **Auth Guard** | `src/app/guards/auth-guard.tsx` | Redirects to `/login` if not authenticated | `auth.store` |
| **Route Pages** | `src/routes/*/index.tsx` | Route-level page, layout, data orchestration | Own route's `-` modules. Shared components. |
| **Route Modules** | `src/routes/*/-components/` etc. | Route-scoped UI, hooks, types (`-` prefix) | Shared UI components. Own route's types only. |
| **Feature Modules** | `src/features/*/_components/` etc. | Cross-route shared domain logic (`_` prefix) | Shared modules. Own feature's modules only. |
| **Stores** | `src/stores/` | Global cached state, cross-route data sharing | `types/` only (no side effects) |
| **IPC Client** | `src/data/ipc-client.ts` | Typed `window.electron.invoke` wrappers | `shared/ipc-channels.ts`, `shared/types/` |
| **IPC Handlers** | `electron/ipc/` | Receive renderer calls, validate, delegate to services | Services only |
| **Services** | `electron/services/` | Business logic, orchestration, rules | Repositories, Integrations |
| **Repositories** | `electron/database/` | Data persistence (SQL queries via sql.js) | `db-manager.ts`, types |
| **Integrations** | `electron/integrations/` | External API adapters (Sheets, SMTP, Accounts) | External SDKs only |
| **Shared** | `shared/` | IPC channel names, shared types, shared schemas | Nothing (leaf node) |

---

## Web Migration Path

If the client later wants an online version, this architecture makes migration straightforward:

| Layer | Desktop (Current) | Web Version (Replace) |
|-------|-------------------|----------------------|
| `src/` (React UI) | **Keep 100% as-is** | No changes |
| `src/data/ipc-client.ts` | Calls `window.electron.invoke()` | Swap to `fetch('/api/...')` calls |
| `electron/services/` | Runs in Electron main | Move to Express/Fastify server |
| `electron/database/` | sql.js `.db` file on disk | Swap to Supabase/Postgres (same SQL) |
| `electron/integrations/` | Direct SDK calls | Same code, runs on server instead |
| `shared/` | **Keep 100% as-is** | No changes |
| Auth | Sheets "Accounts" tab + local cache | Swap to proper auth service (e.g. Supabase Auth) |

The only file you truly rewrite is `ipc-client.ts` (~50 lines). Everything else either stays or moves to a server.

---

## Related Documentation

| Document | Purpose |
|----------|---------|
| [overview.md](overview.md) | Project summary, tech stack, requirements, packages |
| [database.md](database.md) | sql.js details, crash protection, atomic save |
| [data-dictionary.md](data-dictionary.md) | Questionnaire fields → DB columns → form mapping |
| [features/](features/) | Individual feature documentation |
| [features/login.md](features/login.md) | Login & role-based access |

# Template Migration Guide

> **How to use**: After duplicating the alumni-db project, open this file and follow the steps.
> You can also paste this to an AI assistant as a prompt to automate the cleanup.

---

## AI Prompt (copy-paste this after duplicating)

```
I duplicated an Electron + React + TypeScript template project. Help me migrate it to a new project.

**Template stack (keep all of these):**
- Electron + electron-vite 5 + Vite 6
- React 18 + TypeScript + React Router v6
- Tailwind CSS 3 (darkMode: 'class') + shadcn/ui
- sql.js (SQLite WASM) for local database
- Zustand for state management
- react-hook-form + zod for forms
- exceljs for Excel export
- jspdf + jspdf-autotable for PDF export
- docx for Word export
- electron-builder for Windows .exe packaging

**What to do:**

1. READ the docs/ folder in this project for the new project's requirements and data dictionary
2. UPDATE package.json:
   - Change "name" to my new project name
   - Change "description" to match the new project
   - Remove dependencies I don't need (see removal list below)
   - Keep all dependencies I still need
3. UPDATE electron-builder.yml:
   - Change appId to match new project
   - Change productName to match new project
4. UPDATE index.html <title> to new project name
5. UPDATE src/App.tsx with new project name
6. CLEAN these folders — remove alumni-specific files, keep the structure:
   - shared/types/ → remove alumni-specific types, add new ones
   - shared/schemas/ → remove alumni-specific schemas, add new ones
   - shared/ipc-channels.ts → rewrite channels for new project
   - electron/database/ → rewrite schema.ts and repositories for new data model
   - electron/services/ → rewrite services for new business logic
   - electron/ipc/ → rewrite IPC handlers for new channels
   - electron/integrations/ → remove or replace based on new project needs
   - src/stores/ → rewrite stores for new data model
   - src/routes/ → remove all route folders, create new ones per new project's pages
   - src/hooks/ → keep generic hooks (use-debounce, use-toast), remove domain-specific ones
   - src/types/ → replace with new project types
7. KEEP these files as-is (they're project-agnostic):
   - electron.vite.config.ts
   - tsconfig.json, tsconfig.renderer.json, tsconfig.electron.json
   - tailwind.config.ts, postcss.config.js
   - .gitignore, .prettierrc
   - src/main.tsx
   - src/styles/globals.css
   - src/lib/cn.ts
   - src/vite-env.d.ts
   - electron/main.ts (add IPC registration as needed)
   - electron/preload.ts
   - electron/database/db-manager.ts (change DB filename only)
   - tests/smoke-test.cjs (update project-specific checks)
8. RUN `node tests/smoke-test.cjs` to verify everything still works
9. RUN `pnpm build` to confirm clean compilation
10. RUN `pnpm dev` to test the app launches

**The new project's requirements are in the docs/ folder. Read them first.**
```

---

## Manual Step-by-Step Checklist

### Phase 1: Identity

- [ ] Rename project folder
- [ ] `package.json` → change `name`, `description`, `version` to `"1.0.0"`
- [ ] `electron-builder.yml` → change `appId`, `productName`
- [ ] `index.html` → change `<title>`
- [ ] `src/App.tsx` → change displayed name
- [ ] `README.md` → rewrite for new project

### Phase 2: Remove Online-Only Dependencies (if fully offline)

Remove from `package.json` dependencies:
- [ ] `googleapis` — Google Sheets sync
- [ ] `nodemailer` — SMTP email sending
- [ ] `bcryptjs` — password hashing (if no login)

Remove from `package.json` devDependencies:
- [ ] `@types/nodemailer`
- [ ] `@types/bcryptjs`

Then run `pnpm install` to clean the lockfile.

### Phase 3: Remove Online-Only Code (if fully offline)

- [ ] Delete `electron/integrations/google-sheets/` — Sheets sync adapter
- [ ] Delete `electron/integrations/smtp/` — Email transport
- [ ] Delete `electron/services/sync.service.ts` — Sync logic
- [ ] Delete `electron/services/auto-sync.service.ts` — Auto-sync
- [ ] Delete `electron/services/conflict.service.ts` — Sync conflicts
- [ ] Delete `electron/services/email.service.ts` — Email sending
- [ ] Delete `electron/services/auth.service.ts` — If no login needed
- [ ] Delete `electron/ipc/sync.ipc.ts`
- [ ] Delete `electron/ipc/email.ipc.ts`
- [ ] Delete `electron/ipc/auth.ipc.ts` — If no login
- [ ] Delete `electron/utils/crypto.ts` — If no encrypted auth cache
- [ ] Delete `electron/utils/network.ts` — If fully offline
- [ ] Delete `src/routes/login/` — If no login
- [ ] Delete `src/routes/email/` — If no email
- [ ] Delete `src/routes/sync/` — If no sync
- [ ] Delete `src/stores/sync.store.ts`
- [ ] Delete `src/stores/auth.store.ts` — If no login
- [ ] Delete `src/hooks/use-network.ts` — If fully offline
- [ ] Delete `src/hooks/use-auth.ts` — If no login

### Phase 4: Add New Project Docs

- [ ] Replace contents of `docs/` with new project documentation
- [ ] Add data dictionary for new project
- [ ] Add feature specs for new project

### Phase 5: Rewrite Domain Code

- [ ] `shared/types/` → New project's type definitions
- [ ] `shared/schemas/` → New Zod validation schemas
- [ ] `shared/ipc-channels.ts` → New IPC channel names
- [ ] `electron/database/schema.ts` → New SQLite tables
- [ ] `electron/database/*.repository.ts` → New repositories
- [ ] `electron/services/` → New business logic
- [ ] `electron/ipc/` → New IPC handlers
- [ ] `src/stores/` → New Zustand stores
- [ ] `src/routes/` → New pages and components
- [ ] `src/app/router.tsx` → New route definitions

### Phase 6: Verify

- [ ] `node tests/smoke-test.cjs` — All checks pass
- [ ] `pnpm build` — Compiles cleanly
- [ ] `pnpm dev` — App launches and shows new project name
- [ ] `pnpm build:exe` — Installer builds (when ready)

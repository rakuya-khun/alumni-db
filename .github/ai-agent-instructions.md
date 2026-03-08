# Alumni DB — AI Agent Instructions

> Comprehensive instructions for AI coding agents working on the Alumni DB Management System.
> This complements `.github/copilot-instructions.md` with deeper context, implementation patterns, and decision guidelines.

---

## 1. Project Context

**Alumni DB** is an offline-first Electron desktop application for managing alumni tracer study data at an engineering college. It serves 4 user roles:

| Role | Scope | Admin Access |
|------|-------|-------------|
| **Dean** | All 3 programs (CE, CpE, EE) | Full: accounts, settings, sync, DB |
| **CE Chair** | CE data only | Preferences only |
| **CpE Chair** | CpE data only | Preferences only |
| **EE Chair** | EE data only | Preferences only |

The app has **9 features**: Login & Accounts, Dashboard, Alumni Directory, Alumni Profiling, Reports & Export, Data Sync, Email, Settings, About.

**Key constraint:** The primary users are faculty members (Dean and Chairpersons) who may not be tech-savvy. All UIs should be clear, simple, and well-labeled.

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
- UI store: `ui.store.ts` tracks active theme

---

## 9. Documentation Reference

| Topic | File |
|-------|------|
| Tech stack & requirements | `docs/technical/overview.md` |
| Project structure & architecture | `docs/technical/architecture.md` |
| Database schema & SQL patterns | `docs/technical/database.md` |
| Field mapping (questionnaire → DB) | `docs/technical/data-dictionary.md` |
| System flowcharts (10 modules) | `docs/technical/alumni-db-flowcharts.md` |
| Client requirements | `docs/technical/proposed_sitemap_by_client.md` |
| Feature docs | `docs/features/*.md` |

---

## 10. Quick Reference

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

# Feature: Settings

> **Route:** `/settings` → `src/routes/settings/`
> **Offline:** ✅ (config saved locally)
> **Complexity:** Low–Medium
> **Role Access:** Dean manages all sections; Chairpersons manage preferences only

---

## Overview

Settings is the configuration hub for the application. It stores SMTP credentials, Google Sheets connection details, sync/database info, a Google Form link, a dark mode toggle, and user preferences. A **Settings Gate** (`settings-guard.tsx`) redirects users here after first login until all required fields are saved. **Only the Dean can manage connection settings, sync/database configuration, and accounts. Chairpersons can only manage their own preferences (dark mode, display settings).**

---

## Route Structure

```
src/routes/settings/
├── index.tsx                       # Settings page with role-gated sections
├── -components/
│   ├── smtp-form.tsx               # SMTP host, port, user, password — "Connection for Email"
│   ├── smtp-test-button.tsx        # "Test Connection" button with result feedback
│   ├── google-sheets-config.tsx    # Sheet ID, credentials — "Connection to Spreadsheet"
│   ├── sheets-test-button.tsx      # "Test Connection" for Sheets
│   ├── auto-sync-config.tsx        # Auto-sync interval setting
│   ├── gform-link-config.tsx       # Configure Google Form URL
│   ├── sync-db-info.tsx            # Sync & Database info section (Dean-only)
│   ├── accounts-management.tsx     # Accounts table: add/edit/deactivate (Dean-only)
│   ├── account-form-dialog.tsx     # Dialog for creating/editing an account
│   ├── preferences-form.tsx        # User preferences: dark mode, display
│   └── dark-mode-toggle.tsx        # Dark mode toggle (Tailwind 'class' strategy)
├── -hooks/
│   ├── use-settings.ts             # Settings load/save via IPC
│   ├── use-accounts.ts             # Accounts CRUD via IPC (Dean-only)
│   └── use-dark-mode.ts            # Dark mode toggle logic
├── -schemas/
│   ├── settings.schema.ts          # Zod schema: SMTP (required), Sheets (required)
│   └── account.schema.ts           # Zod schema: account creation/update validation
└── -types/
    └── settings.types.ts           # SettingsConfig, AccountEntry, PreferencesConfig
```

---

## Settings Gate (First-Run Flow)

```
src/app/guards/settings-guard.tsx
```

- After first login, `settings-guard.tsx` checks if settings are configured
- Calls `ipcClient.settings.get()` → checks for required fields (SMTP host, Sheet ID)
- If missing → redirect to `/settings`
- Once saved → guard passes, user proceeds to `/dashboard`
- Persisted in `settings.store.ts` → `isConfigured` flag cached after first check

---

## Sections by Role Access

| Section | Dean | Chairperson | Description |
|---------|------|-------------|-------------|
| **SMTP Configuration** | ✅ Manage | 👁️ View-only | Email server host, port, user, password, TLS |
| **Spreadsheet Connection** | ✅ Manage | 👁️ View-only | Sheet ID, service account key, sheet name |
| **Sync & Database Info** | ✅ Manage | 👁️ View-only | Auto-sync interval, GForm link, DB file info |
| **Accounts Management** | ✅ Full CRUD | ❌ Hidden | Add/edit/deactivate user accounts |
| **User Preferences** | ✅ Manage | ✅ Manage | Dark mode toggle, display preferences |

---

## Configuration Sections

### 1. Institution Name

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| Institution Name | Text | ✅ | Displayed on report headers and export documents |

### 2. SMTP Configuration ("Connection for Email") — *Dean-only*

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| SMTP Host | Text | ✅ | Non-empty string, valid hostname pattern |
| SMTP Port | Number | ✅ | Default `587` (TLS) or `465` (SSL); validated 1–65535 |
| Username | Text | ✅ | Email address format |
| Password | Password | ✅ | App password; encrypted at rest via `crypto.ts` |
| Use TLS | Toggle | ✅ | Default: enabled |

**Test Connection** (`smtp-test-button.tsx`):
- Calls `ipcClient.settings.testSmtp(config)`
- Backend creates a transient `nodemailer` transport → calls `transport.verify()`
- Returns success / failure message to UI with retry loop

### 3. Google Sheets Configuration ("Connection to Spreadsheet") — *Dean-only*

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Spreadsheet ID | Text | ✅ | Non-empty, matches Sheets ID pattern |
| Service Account Key | File / JSON | ✅ | Valid JSON with required GCP fields |
| Sheet Name | Text | ✅ | Non-empty string |

**Test Connection** (`sheets-test-button.tsx`):
- Calls `ipcClient.settings.testSheets(config)`
- Backend authenticates via `googleapis` → attempts to read sheet metadata
- Returns success / failure to UI with retry loop

### 4. Google Form Link — *Dean-only*

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Google Form URL | URL | ✅ | Valid URL format, starts with `https://` |

### 5. Sync & Database Info — *Dean-only*

| Field | Type | Required | Validation |
|-------|------|----------|------------|
| Auto-Sync Enabled | Toggle | ❌ | Default: disabled |
| Interval | Number + Unit | ❌ | e.g., every 5 minutes. Only shown when enabled. Min 30 seconds. |
| Database File Path | Text | — | Read-only display of `alumni.db` file path |
| Database Size | Text | — | Read-only display of file size |
| Last Backup | Text | — | Read-only display of last `.bak` file timestamp |

### 6. Accounts Management — *Dean-only*

- **View all accounts** — Table showing username, role, full name, active status, last login
- **Add account** — Dialog form with Zod validation (username, password, role, full name, is_active)
- **Edit account** — Update any field except username
- **Deactivate/Activate** — Toggle `is_active` flag (soft delete — no permanent removal from Settings)
- Changes are synced to the Google Sheets "Accounts" tab

### 7. User Preferences — *All Users*

| Field | Type | Notes |
|-------|------|-------|
| Dark Mode | Toggle | Tailwind CSS `dark:` class strategy. Saves to `settings` table as `dark_mode` key. |
| Theme | — | Currently dark/light only; extensible to custom themes |

**Dark Mode Implementation:**
- Uses Tailwind's `darkMode: 'class'` strategy in `tailwind.config.ts`
- Toggle adds/removes `dark` class on `<html>` element
- Persisted in `settings` table → loaded on app startup via `use-dark-mode` hook
- All components use `dark:` variants for styling

---

## Database Schema

All settings are stored in the `settings` table as key-value pairs:

```sql
CREATE TABLE IF NOT EXISTS settings (
  key   TEXT PRIMARY KEY,
  value TEXT NOT NULL
);
```

| Key | Example Value |
|-----|---------------|
| `institution_name` | `College of Engineering` |
| `smtp_host` | `smtp.gmail.com` |
| `smtp_port` | `587` |
| `smtp_user` | `alumni@university.edu` |
| `smtp_pass` | *(encrypted)* |
| `smtp_tls` | `true` |
| `sheets_id` | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms` |
| `sheets_key` | *(JSON string — service account key)* |
| `sheets_name` | `Sheet1` |
| `gform_link` | `https://docs.google.com/forms/d/e/...` |
| `auto_sync_enabled` | `false` |
| `auto_sync_interval` | `300` *(seconds)* |
| `dark_mode` | `false` |

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `settings.ipc.ts` | `settings:get`, `settings:save`, `settings:testSmtp`, `settings:testSheets` |
| IPC | `auth.ipc.ts` | `auth:getAccounts`, `auth:createAccount`, `auth:updateAccount` |
| Service | `settings.service.ts` | Validate settings, call test functions, encrypt password |
| Service | `auth.service.ts` | Account CRUD (writes to Sheets "Accounts" tab) |
| Repository | `settings.repository.ts` | Key-value CRUD on `settings` table |
| Utility | `crypto.ts` | Encrypt/decrypt SMTP password at rest |
| Integration | `smtp/transport.ts` | Create transient transport for test connection |
| Integration | `google-sheets/client.ts` | Authenticate for test connection |
| Integration | `google-sheets/accounts.adapter.ts` | Read/write "Accounts" tab |
| Store | `settings.store.ts` | Cached settings, `isConfigured` flag |
| Store | `auth.store.ts` | Role check for section visibility |
| Store | `ui.store.ts` | Active theme (dark/light) |

---

## Data Flow

### Save Settings

1. User fills out sections, clicks Save
2. `use-settings` hook validates via `settings.schema.ts` (Zod)
3. Hook calls `ipcClient.settings.save(data)`
4. `settings.ipc.ts` → `settingsService.save(data)`
5. Service encrypts `smtp_pass` → `settingsRepository.upsertAll(keyValuePairs)`
6. Repository runs `INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)` for each pair
7. Atomic save to `alumni.db`
8. IPC returns success → store updates `isConfigured = true` → guard passes

### Create Account (Dean-only)

1. Dean fills account form → Zod validates
2. Hook calls `ipcClient.auth.createAccount(accountData)`
3. `auth.ipc.ts` → `authService.createAccount(data)`
4. Service hashes password → `accountsAdapter.appendRow()` to Sheets "Accounts" tab
5. IPC returns success → accounts table refreshes

---

## Flowchart Reference

**Settings** — Section 9 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

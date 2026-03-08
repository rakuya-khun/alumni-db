# Feature: Login & Role-Based Access

> **Route:** `/login` → `src/routes/login/`
> **Offline:** ✅ (with encrypted local cache fallback)
> **Complexity:** High

---

## Overview

The Login feature authenticates users against account records stored in the Google Sheets "Accounts" tab. On first successful online login, credentials are encrypted and cached locally for offline access. The system supports 4 roles (Dean, CE Chair, CpE Chair, EE Chair) with data scoping enforced throughout the entire session. A 3-attempt lockout policy protects against brute-force attacks.

---

## Route Structure

```
src/routes/login/
├── index.tsx                       # Login page: credential form, error display, lockout timer
├── -components/
│   ├── login-form.tsx             # Username + password inputs
│   ├── lockout-timer.tsx          # 5-minute countdown display on lockout
│   ├── offline-badge.tsx          # "Offline Mode" indicator when using cached auth
│   └── login-error.tsx            # Error message component (invalid creds, locked, etc.)
├── -hooks/
│   ├── use-login.ts              # Authentication logic via IPC
│   ├── use-lockout.ts            # Track attempt count, enforce lockout timer
│   └── use-auth-mode.ts          # Detect online vs offline auth mode
├── -schemas/
│   └── login.schema.ts           # Zod schema: username (required, min 3), password (required, min 6)
└── -types/
    └── auth.types.ts              # LoginCredentials, AuthResult, UserRole, UserSession
```

---

## Authentication Flow

### Online Authentication (Primary)

1. User enters username & password on the login form.
2. `use-login` hook validates input with `login.schema.ts` (Zod).
3. Hook calls `ipcClient.auth.login({ username, password })` via IPC.
4. `auth.ipc.ts` → `authService.login(credentials)`.
5. Service calls `accountsAdapter.fetchAccounts()` → reads the "Accounts" tab from Google Sheets.
6. Service finds the account by username, verifies password hash, checks `is_active = TRUE`.
7. On success:
   - Encrypt account record and cache locally (for offline fallback).
   - Update `last_login` timestamp on the Sheets "Accounts" tab.
   - Return `{ success: true, user: { username, role, fullName, programs } }`.
8. IPC returns result → `auth.store` saves session → redirect to `/dashboard`.

### Offline Authentication (Fallback)

1. On app launch, if Google Sheets is unreachable (no internet or API error):
2. The system switches to **offline authentication mode**.
3. `authService.loginOffline(credentials)` reads the encrypted local account cache.
4. Decrypts cached accounts → finds by username → verifies password hash.
5. If the user has never logged in online before (no cached record), login fails.
6. If found and valid → start session with cached role and program scope.

### First-Time Setup

- The very first account (typically Dean) is **manually added** to the Google Sheets "Accounts" tab.
- No self-registration exists — this is a security decision.
- The Dean can subsequently add more accounts via the system's Accounts Management section in Settings.

---

## Lockout Policy

| Parameter | Value |
|-----------|-------|
| Max Attempts | 3 consecutive failures |
| Lockout Duration | 5 minutes |
| Counter Reset | On successful login |
| Scope | Per-app-instance (restarting the app does NOT reset the counter — stored in `auth.store`) |

---

## User Roles & Data Access

| Role | `role` Value | Accessible Programs | Account Management | Settings Management |
|------|-------------|---------------------|-------------------|-------------------|
| **Dean** | `dean` | CE, CpE, EE (all) | ✅ Full CRUD | ✅ Full access |
| **CE Chairperson** | `ce_chair` | CE only | ❌ None | ❌ Preferences only |
| **CpE Chairperson** | `cpe_chair` | CpE only | ❌ None | ❌ Preferences only |
| **EE Chairperson** | `ee_chair` | EE only | ❌ None | ❌ Preferences only |

### Role Enforcement

Role-based data scoping is enforced at multiple levels:

1. **Store Level:** `auth.store.ts` exposes `accessiblePrograms: string[]` derived from the user's role.
2. **IPC Level:** Every data-fetching IPC handler receives the user's role context and applies SQL `WHERE program IN (?)` filters.
3. **UI Level:** Navigation items and action buttons are conditionally rendered based on role (e.g., Accounts Management only visible to Dean).

---

## Accounts Sheet Structure

Stored in the **"Accounts" tab** within the Google Sheets spreadsheet:

| Column | Type | Required | Description |
|--------|------|----------|-------------|
| `username` | Text | ✅ | Unique login identifier |
| `password` | Text | ✅ | Hashed password (bcrypt or argon2) |
| `role` | Text | ✅ | `dean`, `ce_chair`, `cpe_chair`, `ee_chair` |
| `full_name` | Text | ✅ | Display name |
| `is_active` | Boolean | ✅ | `TRUE` = can log in, `FALSE` = deactivated |
| `created_at` | Text | ✅ | ISO 8601 creation timestamp |
| `last_login` | Text | ❌ | ISO 8601 last successful login |

---

## Offline Cache Schema

Encrypted local cache stored at `{userData}/auth-cache.enc`:

```typescript
interface CachedAccount {
  username: string;
  passwordHash: string;    // Same hash as in Sheets
  role: UserRole;
  fullName: string;
  isActive: boolean;
  cachedAt: string;        // ISO 8601 — when this cache was created/updated
}
```

- Encrypted using AES-256-GCM via `electron/utils/crypto.ts`.
- Refreshed on every successful online login.
- Only stores accounts that have logged in at least once from this device.

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `auth.ipc.ts` | `auth:login`, `auth:logout`, `auth:getSession`, `auth:getAccounts`, `auth:createAccount`, `auth:updateAccount` |
| Service | `auth.service.ts` | Authenticate, hash passwords, manage lockout, encrypt/decrypt cache |
| Integration | `google-sheets/accounts.adapter.ts` | Read/write the "Accounts" tab |
| Utility | `crypto.ts` | AES-256-GCM encryption for local cache + password hashing |
| Store | `auth.store.ts` | Current user session, role, accessible programs, lockout state |

---

## Validation

### Login Form (`login.schema.ts`)

```typescript
const loginSchema = z.object({
  username: z.string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username too long")
    .regex(/^[a-zA-Z0-9._-]+$/, "Username contains invalid characters"),
  password: z.string()
    .min(6, "Password must be at least 6 characters")
    .max(128, "Password too long"),
});
```

### Account Creation (Dean-only)

```typescript
const accountSchema = z.object({
  username: z.string().min(3).max(50).regex(/^[a-zA-Z0-9._-]+$/),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["dean", "ce_chair", "cpe_chair", "ee_chair"]),
  fullName: z.string().min(1).max(100),
  isActive: z.boolean().default(true),
});
```

---

## Data Flow

### Login (Online)

1. User fills login form → Zod validates → hook calls `ipcClient.auth.login(credentials)`
2. `authService.login()` → `accountsAdapter.fetchAccounts()` (reads Sheets "Accounts" tab)
3. Service finds user, verifies password hash, checks `is_active`
4. On success → encrypt and cache account locally → update `last_login` on Sheets
5. IPC returns `{ success, user }` → `auth.store` saves session → redirect to `/dashboard`

### Login (Offline Fallback)

1. User fills login form → Zod validates → hook calls `ipcClient.auth.login(credentials)`
2. `authService.login()` detects Sheets unreachable → falls back to `authService.loginOffline()`
3. Service reads encrypted cache → decrypts → finds user → verifies hash
4. On success → `auth.store` saves session → redirect to `/dashboard`

---

## Flowchart Reference

**Login & Role-Based Access** — Section 2 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

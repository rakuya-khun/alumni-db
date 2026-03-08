# Feature: Data Synchronization

> **Route:** `/sync` → `src/routes/sync/`
> **Offline:** ❌ Requires Internet
> **Complexity:** High
> **Role Access:** All roles can sync; data is scoped to accessible programs

---

## Overview

The Data Sync feature manages bidirectional synchronization between the local sql.js database and a Google Sheets spreadsheet. It supports **4 sync modes** — Pull, Push, Full Sync, and Auto-Sync Timer — along with unsaved changes notifications, pending changes review, conflict detection and resolution, and network status monitoring.

---

## Route Structure

```
src/routes/sync/
├── index.tsx                       # Sync dashboard: status, actions, conflict list
├── -components/
│   ├── sync-actions.tsx            # Pull / Push / Full Sync / Auto-Sync buttons
│   ├── sync-status.tsx             # Last sync time, pending count, conflict count
│   ├── sync-progress.tsx           # Progress indicator during sync operations
│   ├── pending-changes-list.tsx    # Show all pending (unpushed) local changes
│   ├── conflict-list.tsx           # List of detected conflicts
│   ├── conflict-resolver.tsx       # Side-by-side: local vs remote, pick winner
│   ├── network-status.tsx          # Online/offline indicator (prominent display)
│   ├── unpushed-notification.tsx   # Banner: "You have N unpushed edits"
│   └── auto-sync-config.tsx        # Toggle + interval config (every N secs/mins)
├── -hooks/
│   ├── use-sync.ts                # Sync operations via IPC
│   ├── use-sync-status.ts         # Real-time sync state (idle/pulling/pushing/error)
│   ├── use-conflicts.ts           # Conflict list & resolution handlers
│   ├── use-auto-sync.ts           # Auto-sync interval logic (setInterval via IPC)
│   └── use-unpushed-alert.ts      # Check for unpushed edits, trigger notification
└── -types/
    └── sync.types.ts              # AutoSyncConfig, PendingChange, SyncMode, etc.
```

---

## 4 Sync Modes

### 1. Pull (Sheets → Local)

1. Fetch all rows from Google Sheet
2. Compare with local records (by composite key: `full_name` + `program` + `year_graduated`)
3. New rows in Sheet → `INSERT` into local DB
4. Existing rows with different data → detect conflict
5. Mark all successfully pulled records as `synced`

### 2. Push (Local → Sheets)

1. Query all records where `sync_status = 'pending'`
2. For each pending record:
   - If record exists in Sheet → `UPDATE` the row
   - If new record → `APPEND` a new row
3. On success → update `sync_status = 'synced'`, set `synced_at`

### 3. Full Sync

1. Pull first (get latest from Sheets)
2. Resolve any conflicts
3. Push all pending local changes
4. Both sides are now in sync

### 4. Auto-Sync Timer *(New in v2)*

1. Configurable interval (seconds or minutes)
2. Set up via `auto-sync-config.tsx` or Settings page
3. When triggered: runs a Full Sync silently in the background
4. If conflicts found: pauses auto-sync and shows notification
5. Resumes when conflicts are resolved and connectivity is available

---

## Pre-Sync Flow

Before any sync action, two checks are performed (as shown in the v2-5 flowchart):

1. **Internet Available?** — If NO, show offline indicator and disable sync buttons. If YES, proceed.
2. **Unsaved Changes?** — If YES, show notification banner ("You have N unsaved changes") to alert the user before syncing. Continue regardless.

---

## Conflict Detection

Conflicts occur when the same record has been modified in both the local DB and Google Sheets since the last sync.

### Detection Method

- Each record has `updated_at` (local) and `synced_at` (last sync time)
- On Pull: if a Sheet row differs from local AND local has `sync_status = 'pending'`, it's a conflict
- Alternative: hash-based comparison — hash the record fields, compare hashes

### Resolution UI (`conflict-resolver.tsx`)

- Side-by-side display: Local Version vs Remote Version (from Sheets)
- Highlight differing fields
- User picks: **Keep Local**, **Keep Remote**, or **Merge** (edit manually)
- Resolution updates both local DB and marks for push to Sheets

---

## Unpushed Changes Notification

- `sync.store.ts` maintains an `unpushedCount` derived from `SELECT COUNT(*) FROM alumni WHERE sync_status = 'pending'`
- If count > 0, `unpushed-notification.tsx` shows a persistent banner
- Banner appears on the Sync page and optionally in the top bar (global notification)
- Clicking the banner navigates to the Sync page

---

## Network Status

- `use-network.ts` hook detects online/offline state from the Electron main process
- `network-status.tsx` shows a prominent indicator (green = online, red = offline)
- Sync buttons are disabled when offline
- Auto-sync pauses when offline, resumes when connectivity returns

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `sync.ipc.ts` | `sync:pull`, `sync:push`, `sync:full`, `sync:getStatus`, `sync:autoSync`, `sync:resolveConflict` |
| Service | `sync.service.ts` | Sync engine: pull/push/full, compare records, detect conflicts |
| Service | `auto-sync.service.ts` | Interval-based scheduler (4th sync mode) |
| Service | `conflict.service.ts` | Conflict detection algorithm, diff generation |
| Repository | `sync-queue.repository.ts` | Track `sync_status` per alumni record |
| Repository | `alumni.repository.ts` | Fetch/update records for sync |
| Integration | `google-sheets/client.ts` | Sheets API v4 authentication |
| Integration | `google-sheets/sheets.adapter.ts` | Read/write/append rows |
| Integration | `google-sheets/mapper.ts` | Map Sheet rows ↔ Alumni objects |
| Store | `sync.store.ts` | Sync status, last time, conflict count, unpushed flag |

---

## Key Data Flow

### Push Flow

1. User clicks Push → `use-sync` hook calls `ipcClient.sync.push()`
2. `sync.ipc.ts` → `syncService.push()`
3. Service queries `syncQueueRepository.getPendingRecords()`
4. For each record → `sheetsAdapter.updateRow()` or `sheetsAdapter.appendRow()`
5. On success → `alumniRepository.markSynced(id, timestamp)`
6. IPC returns result → store updates → UI refreshes (pending count = 0)

### Conflict Resolution Flow

1. During Pull, conflicts detected → stored in `sync.store.conflicts`
2. `conflict-list.tsx` renders each conflict
3. User opens `conflict-resolver.tsx` → sees local vs remote side-by-side
4. User picks resolution → hook calls `ipcClient.sync.resolveConflict(id, resolution)`
5. Service applies resolution (keep local / keep remote / merge) → updates record → marks synced

---

## Flowchart Reference

**Data Synchronization** — Section 7 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

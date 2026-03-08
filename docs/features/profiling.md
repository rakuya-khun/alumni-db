# Feature: Alumni Profiling

> **Route:** `/profiling` → `src/routes/profiling/`
> **Offline:** ✅ Yes
> **Complexity:** Medium
> **Role Access:** Dean sees all programs; Chairpersons see own program only

---

## Overview

Alumni Profiling provides a dedicated view for individual alumni records with their complete profile and update history. Every time an alumni record is edited, the system creates a versioned snapshot. The profiling page offers **3 display views** — Full Response History, Latest Updates (highlighted), and Chronological Timeline — with diffs between snapshots.

---

## Route Structure

```
src/routes/profiling/
├── index.tsx                       # Alumni profiling list / search view (role-filtered)
├── profile.tsx                     # Individual alumni profile detail page
├── -components/
│   ├── alumni-profile-card.tsx     # Summary card: name, program, contact, employment
│   ├── alumni-history-timeline.tsx # Timeline of all updates (latest first)
│   ├── history-diff-viewer.tsx     # Side-by-side diff of changed fields per update
│   ├── latest-updates-view.tsx     # Highlighted recent changes with visual diff indicators
│   ├── full-history-view.tsx       # All submissions, complete field display
│   ├── profile-search.tsx          # Search/select an alumnus to view profile
│   └── display-view-tabs.tsx       # Tab selector: History | Latest | Timeline
├── -hooks/
│   ├── use-alumni-profile.ts      # Fetch single alumni + history via IPC
│   └── use-alumni-history.ts      # Fetch versioned update history
└── -types/
    └── profiling.types.ts         # AlumniSnapshot, HistoryEntry, ProfileView, DisplayMode
```

---

## Pages

### Profiling Index (`index.tsx`)

- **Role-filtered** — Only shows alumni within user's accessible programs
- Search/filter to select an alumnus
- Displays a list/grid of alumni with basic info (name, program, year)
- Click to navigate to full profile page

### Profile Detail (`profile.tsx`)

- **Profile Card** — Full alumni data displayed in a read-only card format:
  - Personal info (name, DOB, sex, address, contact, gmail, facebook)
  - Academic profile (program, year, honors)
  - Licensure & certifications
  - Employment data (position, company, region, sector, salary)
  - Career progression (2yr/4yr/6yr positions, awards)
- **Display View Tabs** — 3 views selectable via tabs:

---

## 3 Display Views

### 1. Full Response History

- Displays **all** form submissions and edits chronologically
- Shows every field from every recorded snapshot
- Complete audit trail of all data changes

### 2. Latest Updates (Highlighted)

- Shows only the **most recent** changes
- Highlights fields that differ from the previous snapshot
- Visual diff indicators (green = new value, red = old value)
- Quick at-a-glance view of what changed last

### 3. Chronological Timeline

- A **visual timeline** of all updates
- Each entry shows: date, number of fields changed, summary text
- Click any timeline entry to expand and show the full snapshot + diff
- Most recent updates at the top

---

## History Snapshot System

### When Snapshots Are Created

A snapshot is created every time `alumni.update()` is called (from the Alumni Directory edit page). The snapshot stores:

1. **Full JSON snapshot** of the alumni record at the time of the update
2. **Changed fields** — array of column names that differ from the previous version
3. **Timestamp** — when the update occurred

### Database Table

```sql
CREATE TABLE IF NOT EXISTS alumni_history (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  alumni_id       INTEGER NOT NULL,
  snapshot        TEXT NOT NULL,          -- Full JSON of alumni record
  changed_fields  TEXT,                   -- JSON array: ["full_name", "current_position"]
  updated_at      TEXT NOT NULL,          -- ISO 8601
  FOREIGN KEY (alumni_id) REFERENCES alumni(id) ON DELETE CASCADE
);
```

### Diff Calculation

The diff is computed in the renderer by comparing two consecutive snapshots:

```typescript
// Compare two snapshots to highlight changes
function computeDiff(older: AlumniSnapshot, newer: AlumniSnapshot): FieldDiff[] {
  return Object.keys(newer)
    .filter(key => older[key] !== newer[key])
    .map(key => ({
      field: key,
      oldValue: older[key],
      newValue: newer[key],
    }));
}
```

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `profiling.ipc.ts` | `profiling:getProfile`, `profiling:getHistory` |
| Service | `alumni-history.service.ts` | Snapshot creation, history retrieval |
| Repository | `alumni-history.repository.ts` | `INSERT` snapshot, `SELECT` history by alumni_id |
| Repository | `alumni.repository.ts` | Fetch single alumni record (role-filtered) |
| Store | `profiling.store.ts` | Selected profile, history snapshots |
| Store | `auth.store.ts` | `accessiblePrograms` for role-based access check |

---

## Data Flow

### View Profile

1. User searches/selects an alumnus → navigates to `/profiling/123`
2. `use-alumni-profile` hook calls `ipcClient.profiling.getProfile(id)`
3. IPC → `alumniRepository.findById(id)` returns full record (with role access check)
4. IPC → `alumniHistoryRepository.findByAlumniId(id)` returns all snapshots
5. Results cached in `profiling.store` → profile card + display view tabs render

### History Timeline

1. Timeline shows snapshots ordered by `updated_at DESC` (newest first)
2. Each entry displays: date, number of fields changed, summary text
3. Clicking an entry expands the diff viewer showing old → new values

---

## Flowchart Reference

**Alumni Profiling** — Section 5 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

# Alumni DB — System Flowcharts

> **Version:** v2.0.0
> **Interactive HTML:** [alumni-db-flowcharts-v2-5.html](alumni-db-flowcharts-v2-5.html) — open in a browser for navigable, color-coded SVG diagrams.
> **Description:** Modular flowcharts covering all 10 system flows of the Alumni DB Management System, aligned with role-based access for Dean and Program Chairpersons.

---

## Legend

| Shape | Meaning |
|-------|---------|
| Rounded rectangle / Stadium | Start / End (Terminal) |
| Rectangle | Process |
| Diamond / Rhombus | Decision |
| Parallelogram | Input / Output |
| Hexagon | Sub-process / Action |
| Green arrow | YES path |
| Red arrow | NO / Error path |
| Blue dashed arrow | Return / loop-back |

---

## 1. System Overview

**Purpose:** High-level map of the complete application lifecycle — from launch through login, role-based access, 8 system modules, and exit.

```mermaid
flowchart TD
    A([🚀 Launch Application]) --> B[Display Login Screen]
    B --> C[/"Enter Username & Password"/]
    C --> D{Valid Login?}
    D -- NO --> E[/"Show Error Message"/]
    E --> C
    D -- YES --> F{Identify User Role}
    F -- Dean --> G["All Programs (CE · CpE · EE)"]
    F -- Chairperson --> H["Own Program Only"]
    G --> I{{"Load Filtered Dashboard"}}
    H --> I
    I --> J{Select Module}
    J --> K["1. Analytic Dashboard"]
    J --> L["2. Alumni Directory"]
    J --> M["3. Alumni Profiling"]
    J --> N["4. Reports & Export"]
    J --> O["5. Data Sync"]
    J --> P["6. Sending Emails"]
    J --> Q["7. Settings"]
    J --> R["8. About"]
    K & L & M & N & O & P & Q & R --> S{Exit App?}
    S -- NO --> J
    S -- YES --> T([Application Closed])

    style A fill:#10b981,color:#fff
    style T fill:#ef4444,color:#fff
    style D fill:#8b5cf6,color:#fff
    style F fill:#8b5cf6,color:#fff
    style S fill:#8b5cf6,color:#fff
    style I fill:#06b6d4,color:#fff
    linkStyle 3 stroke:#ef4444
    linkStyle 4 stroke:#3b82f6,stroke-dasharray:5
    linkStyle 5 stroke:#10b981
    linkStyle 27 stroke:#ef4444
    linkStyle 28 stroke:#10b981
```

### Flow Description

1. User launches the application.
2. The system displays the **Login Screen**.
3. User enters credentials (username & password).
4. **Valid Login?**
   - **NO** → Show error message ("Invalid credentials"). Loop back to enter credentials.
   - **YES** → Proceed to role identification.
5. **Identify User Role?** — Based on the `role` field from the accounts data:
   - **Dean** → Access all programs (CE · CpE · EE), full data scope.
   - **Chairperson** → Access own program data only (CE, CpE, or EE).
6. Both paths merge → Load the **Dashboard (Filtered View)** according to role scope.
7. **Select Module** — User navigates to one of 8 modules.
8. After completing work in any module, the user returns to the Dashboard.
9. **Exit App?**
   - **NO** → Loop back to module selection.
   - **YES** → Application Closed (terminal state).

### Additional Details

- **Login Gate:** The v1 "settings gate" is replaced by a login screen. Settings are no longer the entry point — authentication is.
- **Hub-and-Spoke Architecture:** The Dashboard remains the central hub. Every module returns to it.
- **Role-Based Data Scoping:** The role determined at login persists for the entire session and filters all data globally.

---

## 2. Login & Role-Based Access

**Purpose:** Full authentication flow — credential input, validation against accounts stored in the Google Sheets "Accounts" tab (with encrypted offline fallback), attempt lockout, role detection, and session start.

```mermaid
flowchart TD
    A([🚀 Launch Application]) --> B[Display Login Screen]
    B --> C[/"Enter Username & Password"/]
    C --> D{Internet Available?}
    D -- YES --> E{{"Authenticate via Sheets 'Accounts' Tab"}}
    D -- NO --> F{{"Authenticate via Encrypted Local Cache"}}
    E --> G{Valid Credentials?}
    F --> G
    G -- YES --> H{Identify Role}
    G -- NO --> I{Attempts ≥ 3?}
    I -- YES --> J[/"🔒 Account Locked (5 min)"/]
    J --> B
    I -- NO --> K[/"Show Error: Invalid Credentials"/]
    K --> C
    H -- Dean --> L["All Programs (CE · CpE · EE)"]
    H -- CE Chair --> M[CE Data Only]
    H -- CpE Chair --> N[CpE Data Only]
    H -- EE Chair --> O[EE Data Only]
    L & M & N & O --> P{{"Encrypt & Cache Account Locally"}}
    P --> Q{{"Load Filtered Dashboard"}}
    Q --> R[Start User Session]
    R --> S([✅ Access All System Modules])

    style A fill:#10b981,color:#fff
    style S fill:#10b981,color:#fff
    style J fill:#ef4444,color:#fff
    style G fill:#8b5cf6,color:#fff
    style H fill:#8b5cf6,color:#fff
    style I fill:#8b5cf6,color:#fff
    style D fill:#8b5cf6,color:#fff
    linkStyle 3 stroke:#10b981
    linkStyle 4 stroke:#ef4444
    linkStyle 7 stroke:#10b981
    linkStyle 8 stroke:#ef4444
    linkStyle 9 stroke:#10b981
    linkStyle 10 stroke:#3b82f6,stroke-dasharray:5
    linkStyle 11 stroke:#ef4444
    linkStyle 12 stroke:#3b82f6,stroke-dasharray:5
```

### Accounts Sheet Structure

Accounts are stored in a dedicated **"Accounts" tab** within the same Google Sheets spreadsheet:

| Column | Description |
|--------|-------------|
| `username` | Login username (unique) |
| `password` | Hashed password |
| `role` | `dean`, `ce_chair`, `cpe_chair`, or `ee_chair` |
| `full_name` | Display name |
| `is_active` | `TRUE` / `FALSE` — only active accounts can log in |
| `created_at` | ISO 8601 timestamp |
| `last_login` | ISO 8601 timestamp (updated on successful login) |

### Offline Fallback

- On the **first successful online login**, the system encrypts and caches the user's account record locally.
- If the internet is unavailable, the system authenticates against this local encrypted cache.
- Cache is refreshed on every successful online login.

### Additional Details

- **No Self-Registration:** First account is manually added to the Sheets tab.
- **Lockout Policy:** 3 consecutive failures → 5-minute lockout.
- **Session:** Stored in Zustand `auth.store`, ends on app close.

---

## 3. Analytic Dashboard

**Purpose:** Role-filtered data loading, summary stat cards, percentage metrics, and frequency/weighted mean tables.

```mermaid
flowchart TD
    A([📊 Enter Dashboard]) --> B{{"Apply Role-Based Filter"}}
    B --> C{Alumni Data Available?}
    C -- NO --> D[/"Show Empty State"/]
    C -- YES --> E{{"Load Summary Cards"}}
    E --> F["Total Responses"]
    E --> G["CE / CpE / EE Respondents"]
    F & G --> H{{"Compute % Statistics"}}
    H --> I["% Board Passers"]
    H --> J["% Employed Alumni"]
    H --> K["% Field-Related Jobs"]
    H --> L["% Supervisory Roles"]
    I & J & K & L --> M{{"Load Frequency & Weighted Mean Tables"}}
    M --> N["Curriculum Relevance"]
    M --> O["Competencies (9 items)"]
    M --> P["Employment Status"]
    M --> Q["Industry Sector"]
    M --> R["Other Survey Tables"]
    N & O & P & Q & R --> S{{"Render Full Dashboard"}}
    S --> T[/"Display Charts & Tables"/]
    T --> U([✅ Dashboard Displayed])

    style A fill:#06b6d4,color:#fff
    style U fill:#10b981,color:#fff
    style C fill:#8b5cf6,color:#fff
    style B fill:#f59e0b,color:#fff
    linkStyle 2 stroke:#ef4444
    linkStyle 3 stroke:#10b981
```

### Additional Details

- **Role-Based Filter Applied First:** A Chairperson sees only their own program's statistics.
- **Stat Cards (KPIs):** Total Responses, per-program counts, % Board Passers, % Employed, % Field-Related, % Supervisory.
- **Survey Tables:** Frequency distribution and weighted mean (for Likert-scale data).

---

## 4. Alumni Directory

**Purpose:** Full CRUD operations with search/filter, GForm-based add, edit, delete, profile view — all role-filtered.

```mermaid
flowchart TD
    A([📋 Enter Alumni Directory]) --> B{{"Apply Role-Based Filter"}}
    B --> C[Display Filtered Alumni List]
    C --> D{Select Action}

    D -- Search/Filter --> E[Select Filter Options]
    E --> F{{"Apply Filter (Program, Year, Location, etc.)"}}
    F --> G[/"Show Filtered Results"/]
    G --> D

    D -- Add --> H["Open Add Form (GForm Fields)"]
    H --> I[/"Fill All Required Fields"/]
    I --> J{Valid?}
    J -- NO --> I
    J -- YES --> K{{"Save to Local DB (Pending Sync)"}}
    K --> L

    D -- Edit --> M{{"Load Selected Alumni Record"}}
    M --> N[/"Modify Fields"/]
    N --> O{Valid?}
    O -- NO --> N
    O -- YES --> P{{"Create History Snapshot"}}
    P --> Q{{"Update DB (Pending Sync)"}}
    Q --> L

    D -- Delete --> R{Confirm Delete?}
    R -- NO --> D
    R -- YES --> S{{"Remove Record from DB"}}
    S --> L

    D -- View Profile --> T[Open Alumni Profile Page]
    T --> U[/"Show Full Profile + Timeline"/]
    U --> L

    L{Mark for Sync?}
    L -- YES --> V{{"Queue for Sync"}}
    L -- NO --> W[Skip Sync Queue]
    V & W --> X([🔄 Return to Directory])

    style A fill:#06b6d4,color:#fff
    style X fill:#10b981,color:#fff
    style D fill:#8b5cf6,color:#fff
    style J fill:#8b5cf6,color:#fff
    style O fill:#8b5cf6,color:#fff
    style R fill:#8b5cf6,color:#fff
    style L fill:#8b5cf6,color:#fff
    style B fill:#f59e0b,color:#fff
    linkStyle 6 stroke:#3b82f6,stroke-dasharray:5
    linkStyle 10 stroke:#ef4444
    linkStyle 11 stroke:#10b981
    linkStyle 16 stroke:#ef4444
    linkStyle 17 stroke:#10b981
    linkStyle 21 stroke:#ef4444
    linkStyle 22 stroke:#10b981
    linkStyle 27 stroke:#10b981
    linkStyle 28 stroke:#ef4444
```

### Additional Details

- **GForm Integration:** The "Add" action links to the configured Google Form.
- **Validation Loop:** Both Add and Edit have validation loops.
- **Pending Sync:** All created/edited records are marked `sync_status = 'pending'`.
- **Delete Safety:** Requires explicit confirmation dialog.

---

## 5. Alumni Profiling

**Purpose:** Individual alumni profile view — complete response history, latest update highlights, and chronological timeline.

```mermaid
flowchart TD
    A([👤 Enter Alumni Profiling]) --> B{{"Load Alumni Records (Role-Filtered)"}}
    B --> C{Records Found?}
    C -- NO --> D[/"Show 'No Records' Message"/]
    C -- YES --> E["Select Alumni Record"]
    E --> F{{"Load Full Profile Data"}}
    F --> G{Select Display View}

    G -- Full History --> H[/"Display All Submissions & Edits"/]
    H --> I[/"Show Every Field from Every Snapshot"/]

    G -- Latest Updates --> J[/"Display Recent Changes Only"/]
    J --> K[/"Highlight Modified Fields (Diff)"/]

    G -- Timeline --> L[/"Display Visual Timeline"/]
    L --> M[/"Each Entry: Date, Changed Count, Summary"/]

    I & K & M --> N([✅ Profile Displayed])

    style A fill:#06b6d4,color:#fff
    style N fill:#10b981,color:#fff
    style C fill:#8b5cf6,color:#fff
    style G fill:#8b5cf6,color:#fff
    linkStyle 2 stroke:#ef4444
    linkStyle 3 stroke:#10b981
```

### Additional Details

- **History Snapshots:** Every edit creates a JSON snapshot in `alumni_history`.
- **Diff Highlighting:** Latest Updates view shows visual old → new diff indicators.
- **Timeline Navigation:** Click any timeline entry to expand full snapshot.

---

## 6. Reports & Export

**Purpose:** Export alumni data as PDF, DOCX, XLSX; filtered print; and print preview — all role-filtered.

```mermaid
flowchart TD
    A([📄 Enter Reports & Export]) --> B{{"Apply Role-Based Filter"}}
    B --> C{Alumni Data Available?}
    C -- NO --> D[/"Show Empty State"/]
    C -- YES --> E{Select Export Type}

    E -- PDF --> F{{"Generate PDF (Stats + Directory)"}}
    F --> G[/"Download .pdf"/]

    E -- DOCX --> H{{"Generate Styled Word Document"}}
    H --> I[/"Download .docx"/]

    E -- XLSX --> J{{"Export as Excel Workbook"}}
    J --> K[/"Download .xlsx (Multi-Tab)"/]

    E -- Filtered Print --> L["Select Filter Criteria"]
    L --> M{{"Apply Filter & Generate"}}
    M --> N[/"Download Filtered File"/]

    E -- Preview/Print --> O["Open Print Dialog"]
    O --> P{{"Render Print-Optimized View"}}
    P --> Q["Print or Cancel"]

    G & I & K & N & Q --> R{Export Successful?}
    R -- YES --> S([✅ Return to Reports])
    R -- NO --> T[/"Show Error + Retry"/]
    T --> E

    style A fill:#06b6d4,color:#fff
    style S fill:#10b981,color:#fff
    style C fill:#8b5cf6,color:#fff
    style E fill:#8b5cf6,color:#fff
    style R fill:#8b5cf6,color:#fff
    style B fill:#f59e0b,color:#fff
    linkStyle 2 stroke:#ef4444
    linkStyle 3 stroke:#10b981
    linkStyle 21 stroke:#10b981
    linkStyle 22 stroke:#ef4444
    linkStyle 23 stroke:#3b82f6,stroke-dasharray:5
```

### Additional Details

- **Role-Based Filter Applied First:** Chairpersons can only export their own program's data.
- **Excel Multi-Tab:** Data sheet, Filters Applied tab, Summary Statistics tab.
- **Print Preview:** `@media print` optimized view.

---

## 7. Data Synchronization

**Purpose:** Internet check, unsaved change notification, 4 sync modes, pending changes, conflict resolution.

```mermaid
flowchart TD
    A([🔄 Enter Data Sync]) --> B{Internet Available?}
    B -- NO --> C[/"Show Offline Indicator (Buttons Disabled)"/]
    B -- YES --> D{Unsaved Changes?}
    D -- YES --> E[/"⚠️ Show Notification: 'N Unsaved Changes'"/]
    E --> F
    D -- NO --> F{Select Sync Action}

    F -- Pull --> G{{"Pull from Sheets"}}
    G --> H{{"Fetch Remote Data → Merge to Local"}}

    F -- Push --> I{{"Push to Sheets"}}
    I --> J{{"Upload Local Data to Sheets"}}

    F -- Full Sync --> K{{"Full Sync (Pull + Push)"}}
    K --> L{{"Bidirectional Merge"}}

    F -- Auto-Sync --> M{{"Auto-Sync Timer"}}
    M --> N[/"Configure Interval (secs/mins)"/]
    N --> O([⏱️ Timer Configured])

    H & J & L --> P{Pending Changes?}
    P -- YES --> Q[/"Show Pending Changes List"/]
    P -- NO --> R
    Q --> R{Conflicts Detected?}
    R -- YES --> S[/"Show Conflicts → Resolve First"/]
    S --> R
    R -- NO --> T{{"Execute Sync"}}
    T --> U{Sync Successful?}
    U -- YES --> V{{"Update Last Sync Timestamp"}}
    V --> W([✅ Sync Complete])
    U -- NO --> X[/"Show Error + Retry"/]
    X --> T

    style A fill:#06b6d4,color:#fff
    style W fill:#10b981,color:#fff
    style O fill:#10b981,color:#fff
    style C fill:#ef4444,color:#fff
    style B fill:#8b5cf6,color:#fff
    style D fill:#8b5cf6,color:#fff
    style F fill:#8b5cf6,color:#fff
    style P fill:#8b5cf6,color:#fff
    style R fill:#8b5cf6,color:#fff
    style U fill:#8b5cf6,color:#fff
    style E fill:#f59e0b,color:#fff
    linkStyle 1 stroke:#ef4444
    linkStyle 2 stroke:#10b981
    linkStyle 3 stroke:#10b981
    linkStyle 5 stroke:#ef4444
    linkStyle 18 stroke:#10b981
    linkStyle 19 stroke:#ef4444
    linkStyle 21 stroke:#10b981
    linkStyle 22 stroke:#3b82f6,stroke-dasharray:5
    linkStyle 23 stroke:#ef4444
    linkStyle 25 stroke:#10b981
    linkStyle 27 stroke:#ef4444
    linkStyle 28 stroke:#3b82f6,stroke-dasharray:5
```

### Additional Details

- **Internet Gate:** Sync is impossible without internet.
- **Unsaved Changes Notification:** Alerts user before syncing if local edits exist.
- **Auto-Sync Timer:** Configurable interval. Pauses on conflicts.
- **Conflict Resolution:** Manual — keep local, keep remote, or merge.

---

## 8. Sending Emails

**Purpose:** Role-filtered recipients, GForm link decision, compose, send via SMTP, history tracking.

```mermaid
flowchart TD
    A([✉️ Enter Sending Emails]) --> B{Select Action}

    B -- Compose --> C["Select Recipients - Role-Filtered"]
    C --> D["Filter By Program / Year"]
    D --> E[/"Compose Email: Subject + Body"/]
    E --> F{Include GForm Link?}
    F -- YES --> G{{"Attach GForm Link to Body"}}
    F -- NO --> H[Skip]
    G & H --> I{Valid Email Form?}
    I -- NO --> E
    I -- YES --> J{{"Send Email via SMTP"}}
    J --> K{Sent Successfully?}
    K -- YES --> L{{"Log to Email History"}}
    K -- NO --> M[/"Show Error + Retry"/]
    M --> J

    B -- History/Inbox --> N[Email History]
    N --> O[/"Display Status: Completed / Pending / Failed"/]
    O --> P[Received Emails]
    P --> Q[/"View & Read Responses"/]

    L & Q --> R([✉️ Return to Email Page])

    style A fill:#06b6d4,color:#fff
    style R fill:#10b981,color:#fff
    style B fill:#8b5cf6,color:#fff
    style F fill:#8b5cf6,color:#fff
    style I fill:#8b5cf6,color:#fff
    style K fill:#8b5cf6,color:#fff
    linkStyle 5 stroke:#10b981
    linkStyle 6 stroke:#ef4444
    linkStyle 9 stroke:#ef4444
    linkStyle 10 stroke:#10b981
    linkStyle 12 stroke:#10b981
    linkStyle 13 stroke:#ef4444
    linkStyle 14 stroke:#3b82f6,stroke-dasharray:5
```

### Additional Details

- **Role-Based Recipients:** CE Chairperson can only email CE alumni.
- **GForm Link Decision:** Optional inclusion for survey reminders.
- **Template Variables:** `{{fullName}}`, `{{program}}`, `{{yearGraduated}}`, etc.
- **Email History:** Every batch send logged with delivery status.

---

## 9. Settings

**Purpose:** SMTP + Sheets configuration with test/retry loops, Dean-only management sections, and user preferences.

```mermaid
flowchart TD
    A([⚙️ Enter Settings]) --> B{User Role?}

    B -- Dean --> C[All Sections Visible]
    B -- Chairperson --> D[Preferences Only]

    C --> E{Select Setting Type}

    E -- SMTP --> F[/"Enter SMTP Config"/]
    F --> G[/"Configure: Host, Port, Auth"/]
    G --> H{{"Test SMTP Connection"}}
    H --> I{Connection OK?}
    I -- YES --> J[✅ SMTP Config Saved]
    I -- NO --> K[/"Show Error"/]
    K --> G

    E -- Spreadsheet --> L[/"Enter Sheets Config"/]
    L --> M[/"Configure: Sheet ID, Auth Key"/]
    M --> N{{"Test Sheets Connection"}}
    N --> O{Connection OK?}
    O -- YES --> P[✅ Sheets Config Saved]
    O -- NO --> Q[/"Show Error"/]
    Q --> M

    E -- Sync/DB Info --> R[/"Configure Auto-Sync, GForm Link, DB Info"/]
    E -- Accounts --> S{{"Manage Accounts (Add/Edit/Deactivate)"}}

    D --> T["Dark Mode Toggle"]
    D --> U["Display Preferences"]

    J & P & R & S & T & U --> V[Settings Saved & Applied]
    V --> W([🏠 Return to Dashboard])

    style A fill:#06b6d4,color:#fff
    style W fill:#10b981,color:#fff
    style J fill:#10b981,color:#fff
    style P fill:#10b981,color:#fff
    style B fill:#8b5cf6,color:#fff
    style E fill:#8b5cf6,color:#fff
    style I fill:#8b5cf6,color:#fff
    style O fill:#8b5cf6,color:#fff
    linkStyle 8 stroke:#10b981
    linkStyle 9 stroke:#ef4444
    linkStyle 10 stroke:#3b82f6,stroke-dasharray:5
    linkStyle 15 stroke:#10b981
    linkStyle 16 stroke:#ef4444
    linkStyle 17 stroke:#3b82f6,stroke-dasharray:5
```

### Settings Sections by Role Access

| Section | Dean | Chairperson |
|---------|------|-------------|
| SMTP Configuration | ✅ Manage | ❌ View-only |
| Spreadsheet Connection | ✅ Manage | ❌ View-only |
| Sync & Database Info | ✅ Manage | ❌ View-only |
| Accounts Management | ✅ Manage | ❌ Hidden |
| User Preferences | ✅ Manage | ✅ Manage |

---

## 10. About

**Purpose:** System overview, core feature summaries, and a user-friendly manual for non-technical users.

```mermaid
flowchart TD
    A([ℹ️ Enter About Page]) --> B[Render About Page]
    B --> C{Select View Section}

    C -- System Info --> D[System Overview]
    D --> E[/"Display: Purpose, Goals, Version, Credits"/]

    C -- Core Features --> F[Core Features List]
    F --> G[/"Display 9 Feature Summary Cards"/]

    C -- User Manual --> H[User Manual]
    H --> I[/"Step-by-Step Guide for Non-Technical Users"/]
    I --> J[/"FAQs & Contact/Support"/]

    E & G & J --> K([✅ Page Content Displayed])

    style A fill:#06b6d4,color:#fff
    style K fill:#10b981,color:#fff
    style C fill:#8b5cf6,color:#fff
```

### 9 Core Features Listed

1. Login & Accounts
2. Analytics Dashboard
3. Alumni Directory
4. Alumni Profiling
5. Reports & Export
6. Data Sync
7. Sending Emails
8. Settings
9. About

### User Manual Design

- **Simple language** — no technical jargon
- **Large numbered steps** — clear action → result format
- **Visual aids** — screenshots/illustrations where applicable
- **FAQs** — common questions with reassuring answers

---

## Architecture Summary

| Module | Key Characteristics |
|--------|-------------------|
| **System Overview** | Login gate → role detection → hub-and-spoke with 8 modules |
| **Login & Access** | Sheets-based auth, encrypted offline fallback, 3-attempt lockout, 4 roles |
| **Analytic Dashboard** | Role-filtered stats, summary cards, % KPIs, freq/WM survey tables |
| **Alumni Directory** | 5 actions (Search, Add via GForm, Edit, Delete, View Profile), auto-sync queue |
| **Alumni Profiling** | 3 display views (History, Latest, Timeline), snapshot-based history |
| **Reports & Export** | 5 output types (PDF, DOCX, XLSX, Filtered Print, Preview/Print), role filtering |
| **Data Sync** | 4 sync modes (Pull, Push, Full, Auto-Sync), conflict resolution, unsaved change alerts |
| **Sending Emails** | Compose + History/Inbox branches, role-filtered recipients, GForm link option |
| **Settings** | SMTP + Sheets config, Dean-only management, preferences for all, dark mode |
| **About** | 3-section view (System Info, Core Features, User Manual), non-technical manual |

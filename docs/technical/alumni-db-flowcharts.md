# Alumni DB — System Flowcharts

> **Version:** v2.0.0
> **Interactive HTML:** [alumni-db-flowcharts-v2-5.html](alumni-db-flowcharts-v2-5.html) — open in a browser for navigable, color-coded SVG diagrams.
> **Description:** Modular flowcharts covering all 10 system flows of the Alumni DB Management System, aligned with role-based access for Dean and Program Chairpersons.

---

## Legend

| Shape | Meaning |
|-------|---------|
| Rounded rectangle / Oval | Start / End (Terminal) |
| Rectangle (green border) | Process |
| Diamond (purple border) | Decision |
| Rectangle (cyan border) | Input / Output |
| Rectangle (amber border) | Action / Sub-process |
| Rectangle (red border) | Error State |
| Green arrow | YES path |
| Red arrow | NO / Error path |
| Blue dashed arrow | Return / loop-back |
| Amber arrow | Warning / notification path |

---

## 1. System Overview

**Purpose:** High-level map of the complete application lifecycle — from launch through login, role-based access, 8 system modules, and exit.

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
7. **Select Module** — User navigates to one of 8 modules:
   1. Analytic Dashboard
   2. Alumni Directory
   3. Alumni Profiling
   4. Reports & Export
   5. Data Sync
   6. Sending Emails
   7. Settings
   8. About
8. After completing work in any module, the user returns to the Dashboard.
9. **Exit App?**
   - **NO** → Loop back to module selection.
   - **YES** → Application Closed (terminal state).

### Additional Details

- **Login Gate:** The v1 "settings gate" is replaced by a login screen. Settings are no longer the entry point — authentication is.
- **Hub-and-Spoke Architecture:** The Dashboard remains the central hub. Every module returns to it. There is no direct module-to-module navigation.
- **Role-Based Data Scoping:** The role determined at login persists for the entire session and filters all data globally — dashboard stats, alumni lists, export results, and email recipients are all scoped to the user's accessible programs.
- **Exit Control:** The exit decision creates a continuous usage loop until the user explicitly closes the application.

---

## 2. Login & Role-Based Access

**Purpose:** Full authentication flow — credential input, validation against accounts stored in the Google Sheets "Accounts" tab (with encrypted offline fallback), attempt lockout, role detection, program data filtering, and session start.

### Flow Description

1. User launches the application.
2. Display the **Login Screen**.
3. Enter credentials — Username & Password.
4. **Authenticate User** — The system checks credentials against:
   - **Primary:** The "Accounts" tab in the connected Google Sheets spreadsheet (if online and sheet is reachable).
   - **Fallback:** Encrypted local account cache (if offline or Sheets is unreachable). The local cache is populated the first time a user successfully logs in online.
5. **Valid Credentials?**
   - **YES** → Proceed to role identification.
   - **NO** → Check login attempt count.
6. **Attempts ≥ 3?**
   - **YES** → **Account Locked** for 5 minutes. User must wait before retrying.
   - **NO** → Show error ("Invalid credentials"). Loop back to credential input for retry.
7. **Identify User Role?** — 4 branches based on the `role` column in the Accounts sheet:
   - **Dean** → All Programs access (CE · CpE · EE) — full data scope, account management.
   - **CE Chair** → CE Data Only — restricted to Civil Engineering records.
   - **CpE Chair** → CpE Data Only — restricted to Computer Engineering records.
   - **EE Chair** → EE Data Only — restricted to Electrical Engineering records.
8. All role branches merge → **Load Filtered Dashboard** (scoped to the user's accessible programs).
9. **Start User Session** — Session state stored locally with role, accessible programs, and timestamps.
10. → **Access All System Modules** (terminal — hand-off to module navigation).

### Accounts Sheet Structure

Accounts are stored in a dedicated **"Accounts" tab** within the same Google Sheets spreadsheet used for alumni data. The sheet has the following columns:

| Column | Description |
|--------|-------------|
| `username` | Login username (unique) |
| `password` | Hashed password |
| `role` | `dean`, `ce_chair`, `cpe_chair`, or `ee_chair` |
| `full_name` | Display name |
| `is_active` | `TRUE` / `FALSE` — only active accounts can log in |
| `created_at` | ISO 8601 timestamp |
| `last_login` | ISO 8601 timestamp (updated on successful login) |

> **First-time setup:** The very first account (typically Dean) is **manually added** to the Accounts sheet tab for security. There is no self-registration. The Dean can then add additional accounts via the system or directly on the spreadsheet.

### Offline Fallback

- On the **first successful online login**, the system encrypts and caches the user's account record locally (using `electron/utils/crypto.ts`).
- On subsequent launches, if the internet is unavailable or the Sheets API is unreachable, the system authenticates against this local encrypted cache.
- The local cache stores: username, hashed password, role, full_name, is_active status.
- Cache is refreshed (re-encrypted with latest data) on every successful online login.

### Additional Details

- **No Self-Registration:** All accounts are created either manually in the spreadsheet or by the Dean via the Accounts Management module in the system.
- **Lockout Policy:** 3 consecutive failed attempts → 5-minute lockout. The counter resets on successful login.
- **Session Persistence:** Role and program scope are stored in the Zustand `auth.store` and persist for the session duration. Closing the app ends the session.
- **Active Flag:** The `is_active` column allows the Dean to deactivate accounts without deleting them. Deactivated accounts cannot log in.

---

## 3. Analytic Dashboard

**Purpose:** Role-filtered data loading, summary stat cards, percentage metrics, and frequency/weighted mean tables for survey responses.

### Flow Description

1. Enter the **Analytic Dashboard Page**.
2. **Apply Role-Based Filter** — Automatically scope data to the user's accessible programs (Dean = all; Chairpersons = own program).
3. **Alumni Data Available?**
   - **NO** → Show Empty State (friendly empty message).
   - **YES** → Proceed.
4. **Load Summary Cards:**
   - Total Responses
   - CE Respondents
   - CpE Respondents
   - EE Respondents
5. **Compute % Statistics:**
   - % Board Passers
   - % Employed Alumni
   - % Field-Related Jobs
   - % Supervisory / Managerial Roles
6. **Load Frequency & Weighted Mean Tables** — Data tables covering: Curriculum Relevance, Competencies, Employment Status, Specialization, Place of Work, Industry Sector, First Job, Challenges, and more.
7. **Render Full Dashboard** — Compose all cards, charts, and tables into the complete view.
8. **Display Charts & Tables** — Output to user.
9. → **Dashboard Displayed** (terminal).

### Additional Details

- **Role-Based Filter Applied First:** A Chairperson for CE will only see CE-specific statistics, counts, and tables. The Dean sees aggregated data across all three programs.
- **Empty State Guard:** If zero alumni records exist for the user's scope, the dashboard gracefully shows an empty state rather than broken charts.
- **Stat Cards (KPIs):** Total Responses, per-program respondent counts, % Board Passers, % Employed, % Field-Related, % Supervisory.
- **Survey Tables:** Each table shows frequency distribution and weighted mean (for Likert-scale data). Computed via SQL aggregation in `analytics.repository.ts`.

---

## 4. Alumni Directory

**Purpose:** Full CRUD operations with search/filter, GForm-based add, edit, delete, profile view — all with role-based filtering and optional sync queue.

### Flow Description

1. Enter the **Alumni Directory Page**.
2. **Apply Role-Based Filter** — Auto-scope alumni list to user's accessible programs.
3. **Display Filtered Alumni List** — Table of alumni records within scope.
4. **Select Action** — 5 action branches:

**Search/Filter Branch:**
1. Select filter options: Program, Year, Location, Employment Status, etc.
2. Apply filter.
3. Show filtered results.

**Add (GForm) Branch:**
1. Open Google Form (or embedded form equivalent).
2. Fill all required GForm fields (all questionnaire sections).
3. **Valid?** — If NO, loop back to fill fields. If YES:
4. Save to local DB (marks as "Pending Sync").

**Edit Branch:**
1. Load selected alumni record.
2. Modify desired fields.
3. **Valid?** — If NO, loop back to modify. If YES:
4. Create history snapshot → Update DB (marks as "Pending Sync").

**Delete Branch:**
1. **Confirm Delete?** — If NO, return to action selection. If YES:
2. Remove record from database. Cascades to `alumni_history`.

**View Profile Branch:**
1. Open Alumni Profile page.
2. Show full profile data + timeline (links to Profiling module).

5. All branches merge → **Mark for Sync?**
   - **YES** → Queue record for sync.
   - **NO** → Skip sync queue.
6. → **Return to Directory** (terminal).

### Additional Details

- **GForm Integration:** The "Add" action opens or links to the configured Google Form. Form responses flow into Google Sheets and are synced to the local DB via the Data Sync module.
- **Validation Loop:** Both Add and Edit have validation loops — invalid input returns to the form with error messages.
- **Pending Sync:** All created/edited records are marked `sync_status = 'pending'` and queued for upload during the next sync.
- **Delete Safety:** Deletion requires explicit confirmation. Canceling returns to the action selection.
- **View Profile:** Clicking "View Profile" on a record navigates to the Alumni Profiling module for that individual.

---

## 5. Alumni Profiling

**Purpose:** Individual alumni profile view — complete response history, latest update highlights, and chronological timeline.

### Flow Description

1. Enter the **Alumni Profiling Page**.
2. **Load Alumni Records** — Fetches the list of alumni within the user's role scope.
3. **Records Found?**
   - **NO** → Show "No Records" message.
   - **YES** → Proceed.
4. **Select Alumni Record** — User picks an individual alumnus.
5. **Load Full Profile Data** — Retrieve complete record + all history snapshots.
6. **Select Display View** — 3 branches:

**Full Response History:**
- Displays all form submissions and edits chronologically.
- Shows every field from every recorded update.

**Latest Updates (Highlighted):**
- Shows only the most recent changes.
- Highlights recently modified fields with visual diff indicators.

**Chronological Timeline:**
- A visual timeline of all updates.
- Each entry shows date, changed field count, and summary.

7. All branches merge → **Profile Displayed**.
8. → **Return to Directory / Dashboard** (terminal).

### Additional Details

- **History Snapshots:** Every time an alumni record is edited, a JSON snapshot of the full record is stored in `alumni_history`. The profiling page reads these snapshots.
- **Diff Highlighting:** The Latest Updates view visually highlights which fields changed compared to the previous version.
- **Timeline Navigation:** Users can click any timeline entry to expand and view the full snapshot at that point in time.

---

## 6. Reports & Export

**Purpose:** Export alumni data as PDF, DOCX, XLSX; apply filtered print by program/year/specialization/area; and preview before printing.

### Flow Description

1. Enter the **Reports & Export Page**.
2. **Apply Role-Based Filter** — Auto-scope export data to user's accessible programs.
3. **Alumni Data Available?**
   - **NO** → Show Empty State.
   - **YES** → Proceed.
4. **Select Export Type** — 5 branches:

**PDF Branch:**
1. Generate PDF (stats + directory listing).
2. Include program distribution and full alumni table.
3. → Download `.pdf` file.

**DOCX Branch:**
1. Generate styled Word document.
2. Include summary + data tables.
3. → Download `.docx` file.

**XLSX Branch:**
1. Export as Excel workbook.
2. Include formatted sheet + filters tab + summary tab.
3. → Download `.xlsx` file.

**Filtered Print Branch:**
1. Select filter criteria: Program, Year, Specialization, Area/Location.
2. Apply filter to narrow data.
3. → Download filtered file.

**Preview/Print Branch:**
1. Open print dialog.
2. Render print-optimized summary view.
3. → Print or Cancel.

5. All branches merge → **Export Successful?**
   - **YES** → Return to Reports page.
   - **NO** → Show Error with Retry option. Loop back to export.

### Additional Details

- **Role-Based Filter Applied First:** A CE Chairperson can only export CE alumni data. The Dean can export all programs.
- **Empty State Guard:** If no records exist within the user's scope, the system shows a friendly empty state rather than generating blank files.
- **Excel Multi-Tab:** The `.xlsx` export includes: Main Data sheet, Filters Applied tab, and Summary Statistics tab.
- **Print Preview:** Renders a `@media print` optimized view using `print.css` styles.

---

## 7. Data Synchronization

**Purpose:** Internet check, unsaved change notification, 4 sync actions (Pull, Push, Full Sync, Auto-Sync Timer), pending changes review, conflict resolution, and sync execution.

### Flow Description

1. Enter the **Data Sync Page**.
2. **Internet Available?**
   - **NO** → Show Offline indicator (sync buttons disabled).
   - **YES** → Proceed.
3. **Unsaved Changes?**
   - **YES** → Show notification ("You have N unsaved changes"). Continue.
   - **NO / Continue** → Proceed to sync action selection.
4. **Select Sync Action** — 4 branches:

**Pull Branch:**
1. Pull from Sheets — Download remote data.
2. Fetch Remote Data → merge into local DB.

**Push Branch:**
1. Push to Sheets — Upload local changes.
2. Upload Local Data to Google Sheets.

**Full Sync Branch:**
1. Full Sync — Bidirectional merge.
2. Pull first, then push, with conflict detection.

**Auto-Sync Branch:**
1. Auto-Sync Timer — Set interval (seconds/minutes).
2. Configure the auto-sync schedule. (Config-only — no immediate sync.)

5. Pull/Push/Full branches merge → **Pending Changes?**
   - **YES** → Show Pending Changes list.
   - **NO** → Skip directly to conflict check.
6. **Conflicts Detected?**
   - **YES** → Show Conflicts with "Resolve First" prompt. Loop back after resolution.
   - **NO** → Proceed.
7. **Execute Sync** — Run the sync operation.
8. **Sync Successful?**
   - **YES** → Update Last Sync Timestamp → **Sync Complete** (terminal).
   - **NO** → Show Error with Retry option. Loop back to Execute Sync.

### Additional Details

- **Internet Gate:** Sync is impossible without internet. The offline indicator is prominently displayed.
- **Unsaved Changes Notification:** Before initiating any sync, the system alerts the user if there are local edits that haven't been pushed. This prevents data loss.
- **Auto-Sync Timer:** Configurable interval-based automatic sync. Runs Full Sync silently in background. Pauses if conflicts are detected.
- **Conflict Resolution:** When the same record differs between local and remote, the user must manually resolve (keep local, keep remote, or merge). No auto-resolution.
- **Last Sync Timestamp:** Updated on successful sync so users always know when data was last synchronized.

---

## 8. Sending Emails

**Purpose:** Compose emails with role-filtered recipient selection, GForm link inclusion, validation, send via SMTP, log history, and view received emails.

### Flow Description

1. Enter the **Sending Emails Page**.
2. **Select Action** — 2 branches:

**Compose Branch (left):**
1. Select Recipients — Filter by Program/Year (auto-scoped by role).
2. Filter By Program/Year — Role-filtered (Chairpersons can only email their own program's alumni).
3. Compose Email — Subject field + Body field.
4. **Include GForm Link?**
   - **YES** → Attach GForm link to email body.
   - **NO** → Skip attachment.
5. **Valid Email Form?** — Subject & body filled?
   - **NO** → Loop back to Compose Email.
   - **YES** → Proceed.
6. **Send Email** via SMTP.
7. **Sent Successfully?**
   - **YES** → Log to Email History → merge.
   - **NO** → Show Error with Retry option. Loop back to Send.

**History / Inbox Branch (right):**
1. Email History — Open history view.
2. Display Status — Show Completed / Pending / Failed badges.
3. Received Emails — Manual tracking log of alumni responses.
4. View & Read → merge.

3. Both branches merge → **Return to Email Page** (terminal).

### Additional Details

- **Role-Based Recipients:** A CE Chairperson can only send emails to CE alumni. The Dean can email all programs.
- **GForm Link Decision:** Users optionally include the configured Google Form link in the email body. This is a convenience feature for sending survey reminders.
- **Template Variables:** Support for `{{fullName}}`, `{{program}}`, `{{yearGraduated}}`, etc. per recipient.
- **SMTP Dependency:** Requires SMTP configuration from Settings. If unconfigured, sends will fail.
- **Email History:** Every batch send is logged with delivery status (completed/pending/failed).

---

## 9. Settings

**Purpose:** Configure SMTP email connection, Google Sheets spreadsheet connection, sync/database info (Dean-only), and user preferences (dark mode, available to all users).

### Flow Description

1. Enter the **Settings Page**.
2. **Select Setting Type** — 2 main branches:

**Email / SMTP Branch (left):**
1. Enter SMTP Config.
2. Configure SMTP — Host, Port, Auth Credentials.
3. Test SMTP Connection.
4. **Connection OK?**
   - **YES** → **SMTP Config Saved** (terminal for this branch).
   - **NO** → Loop back to Configure SMTP (Retry).

**Spreadsheet Branch (right):**
1. Enter Sheets Config.
2. Configure Sheets — Google Sheets Link, Auth Credentials.
3. Test Sheets Connection.
4. **Connection OK?**
   - **YES** → **Sheets Config Saved** (terminal for this branch).
   - **NO** → Loop back to Configure Sheets (Retry).

3. Both branches merge → **Settings Saved & Applied**.
4. → **Return to Dashboard** (terminal).

### Settings Sections by Role Access

| Section | Dean | Chairperson | Description |
|---------|------|-------------|-------------|
| SMTP Configuration | ✅ Manage | ❌ View-only | Host, port, user, password, TLS |
| Spreadsheet Connection | ✅ Manage | ❌ View-only | Sheet ID, service account key, sheet name |
| Sync & Database Info | ✅ Manage | ❌ View-only | Auto-sync interval, GForm link, DB info |
| Accounts Management | ✅ Manage | ❌ Hidden | Add/edit/deactivate user accounts |
| User Preferences | ✅ Manage | ✅ Manage | Dark mode (Tailwind), display settings |

### Additional Details

- **Dean-Only Management:** Only the Dean can modify SMTP, Spreadsheet, Sync/Database, and Accounts settings. Chairpersons see read-only info or have these sections hidden.
- **Preferences for All:** Dark mode toggle (via Tailwind CSS `dark:` classes) and display preferences are accessible to all users.
- **Test Connections:** Both SMTP and Sheets have "Test Connection" buttons with immediate pass/fail feedback and retry loops.
- **Accounts Management:** The Dean can add, edit, and deactivate accounts directly from Settings. New accounts can also be created manually on the Sheets "Accounts" tab.

---

## 10. About

**Purpose:** System overview, core feature summaries, and a user-friendly manual designed for non-technical users.

### Flow Description

1. Enter the **About Page**.
2. **Render About Page** — Load static content.
3. **Select View Section** — 3 branches:

**System Info Branch:**
1. System Overview.
2. Display: Purpose & Goals, Target Users, Version Info.

**Core Features Branch:**
1. Core Features summary list.
2. Display all 9 features:
   1. Analytics Dashboard
   2. Alumni Directory
   3. Alumni Profiling
   4. Reports & Export
   5. Data Sync
   6. Sending Emails
   7. Settings
   8. About
   9. Login & Accounts

**User Manual Branch:**
1. User Manual — Designed for older, non-technical users.
2. Contents: Step-by-step guide with screenshots, FAQs, Contact/Support.

3. All branches merge → **Page Content Displayed**.
4. → **Return to Dashboard** (terminal).

### Additional Details

- **User-Friendly Manual:** The User Manual section is specifically designed for users who may not be tech-savvy. It uses simple language, large clear steps, visual aids (screenshots/illustrations), and avoids technical jargon.
- **9 Core Features:** The feature list now includes Login & Accounts as the 9th feature (alongside the original 8 from the client sitemap).
- **Static Page:** The About page makes no database queries. The only IPC call is for the app version number.

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

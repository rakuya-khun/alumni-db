# Feature: Help

> **Route:** `/help` → `src/routes/help/`
> **Offline:** ✅ Yes (fully static content)
> **Complexity:** Low
> **Role Access:** All users

---

## Overview

The Help page is a comprehensive, standalone support center with **3 tabs**: User Manual, FAQ, and Troubleshooting. It is designed specifically for **non-technical faculty users** (Dean and Program Chairpersons) who may not be familiar with desktop applications, syncing, or database concepts. Every piece of text uses **plain language**, avoids jargon, and includes reassuring messages.

This page is **distinct from the About page** (`/about`). The About page provides a high-level system overview and condensed manual. The Help page is the full, searchable, detailed reference.

---

## Route Structure

```
src/routes/help/
├── index.tsx                           # Help page shell: title + 3-tab view + search bar
├── -components/
│   ├── user-manual-tab.tsx             # Tab 1: Full step-by-step user manual
│   ├── faq-tab.tsx                     # Tab 2: Frequently Asked Questions (searchable accordion)
│   └── troubleshooting-tab.tsx         # Tab 3: Problem → Solution tables by category
└── -types/
    └── help.types.ts                   # HelpSection, FaqItem, TroubleshootingEntry types
```

---

## UI Design Principles (Non-IT Users)

| Principle | Implementation |
|-----------|---------------|
| **Plain language** | No technical jargon. Say "spreadsheet" not "Google Sheets API." Say "email server" not "SMTP." |
| **Large, clear headings** | Each section and step uses bold numbered headings with generous spacing |
| **Simple sentences** | 1–2 sentences per instruction. No compound instructions. |
| **Consistent structure** | Every step: "What to do" → "Where to click" → "What happens next" |
| **Reassuring tone** | Include messages like "Don't worry — your data is saved automatically" |
| **Visual cues** | Icon next to each section heading. Bold button/menu names in quotes (e.g., Click **"Save"**) |
| **Searchable** | A search input at the top of the help page filters across all 3 tabs |
| **Screenshot placeholders** | Each manual step has a slot for annotated screenshots (added later) |
| **Collapsible sections** | Accordion-style so users aren't overwhelmed by a wall of text |

---

## Tab 1: User Manual

> 20 numbered steps organized into 6 groups. Each step is an accordion item with a title, description, and optional screenshot placeholder.

### Getting Started

#### Step 1: Opening the Application

- **What to do:** Find the "Alumni DB" icon on your desktop and double-click it.
- **What happens:** The application window opens and shows the login screen.
- **Tip:** If you don't see the icon, ask the Dean or your IT support to reinstall the application.

#### Step 2: Logging In

- **What to do:** Type your **username** and **password**, then click **"Log In"**.
- **What happens:** If correct, you'll be taken to the Dashboard. If wrong, you'll see an error message.
- **Important:** After 3 wrong attempts, you'll be locked out for 5 minutes. Just wait and try again.
- **Offline?** If you see an "Offline Mode" badge, don't worry — you can still log in using your saved credentials from the last time you were online.

#### Step 3: First-Time Setup (Dean Only)

- **What to do:** The first time the Dean logs in, the app will ask you to set up connections.
- **Step 3a:** Set up the **email connection** — enter the email server details (the IT department can provide these).
- **Step 3b:** Set up the **spreadsheet connection** — enter the Google Sheet ID and upload the service account key file.
- **Step 3c:** Click **"Test Connection"** for both to make sure they work, then click **"Save"**.
- **What happens:** Once saved, all users can access the full application. You only need to do this once.

#### Step 4: Understanding Your Dashboard

- **What to do:** After logging in, you'll see the Dashboard — this is your home page.
- **What you'll see:**
  - **Total Responses** — How many alumni have responded to the survey
  - **Program Counts** — Number of respondents per program (CE, CpE, EE)
  - **Key Percentages** — Board passers, employed, field-related employment, supervisory positions
  - **Survey Tables** — Detailed breakdown of responses by category
  - **Charts** — Visual graphs showing trends and distributions
- **Role note:** If you're a Chairperson, you'll only see data for your program. The Dean sees everything.

### Managing Alumni Records

#### Step 5: Viewing Alumni Records

- **What to do:** Click **"Alumni Directory"** in the left sidebar.
- **What you'll see:** A table of all alumni records with their name, program, year graduated, and employment status.
- **Searching:** Use the search bar at the top to find a specific person by name.
- **Filtering:** Use the dropdown filters above the table to narrow results by program, year, employment status, or other criteria.

#### Step 6: Adding a New Alumni Record

- **What to do:** On the Alumni Directory page, click the **"Add Alumni"** button in the top right.
- **What happens:** A form opens with 7 sections. Fill in the required fields (marked with a red asterisk *).
- **Sections:** Personal Information → Educational Background → Employment Details → Competency Assessment → Curriculum Relevance → Professional Development → Challenges
- **When done:** Click **"Save"**. The record is saved locally and marked as "Pending Sync."
- **Tip:** You don't need to fill in every field — only the ones marked with * are required.

#### Step 7: Editing an Alumni Record

- **What to do:** In the Alumni Directory, find the record you want to edit and click the **pencil icon** (✏️) or **"Edit"** button.
- **What happens:** The same form opens, pre-filled with the existing data. Make your changes and click **"Save"**.
- **Important:** Every time you edit a record, the system automatically saves a copy of the old version. You can view these past versions in the Alumni Profiling section.

#### Step 8: Deleting an Alumni Record

- **What to do:** In the Alumni Directory, find the record and click the **trash icon** (🗑️) or **"Delete"** button.
- **What happens:** A confirmation dialog appears asking "Are you sure?" Click **"Delete"** to confirm, or **"Cancel"** to go back.
- **Warning:** Deletions are permanent and cannot be undone. Always double-check before confirming.

### Viewing Alumni Profiles

#### Step 9: Browsing Alumni Profiles

- **What to do:** Click **"Alumni Profiling"** in the left sidebar.
- **What you'll see:** A searchable list of all alumni. Click on any name to view their full profile.

#### Step 10: Understanding the Profile Views

- **What you'll see:** Each profile has **3 tabs** to view information:
  - **History** — Shows every version of the record, from the first entry to the latest update
  - **Latest Updates** — Shows only the most recent changes, highlighted in color
  - **Timeline** — A visual timeline showing when each change was made

### Working with Data

#### Step 11: Syncing Data

- **What to do:** Click **"Data Sync"** in the left sidebar.
- **What you'll see:** Your sync status (last sync time, pending changes count), and 4 action buttons:
  - **Pull** — Download the latest data from the spreadsheet to your computer
  - **Push** — Upload your local changes to the spreadsheet
  - **Full Sync** — Do both (download + upload) at once
  - **Auto-Sync** — Turn on automatic syncing at regular intervals
- **Recommendation:** Use **"Full Sync"** before you start working each day, and again when you're done.

#### Step 12: Understanding Sync Status

Each alumni record has a sync indicator:
- 🟢 **Synced** — This record matches what's in the spreadsheet. Everything is up to date.
- 🟡 **Pending** — You've made changes locally that haven't been uploaded yet. Run a sync to update.
- 🔴 **Conflict** — This record was changed both on your computer and in the spreadsheet. You'll need to resolve it.

#### Step 13: Resolving Conflicts

- **What happens:** When a conflict is detected, you'll see a side-by-side comparison showing:
  - **Your version** (left) — What you have on your computer
  - **Spreadsheet version** (right) — What's in the online spreadsheet
  - **Differences highlighted** in color so you can spot exactly what changed
- **What to do:** Choose one of 3 options:
  - **Keep Mine** — Use your local version
  - **Keep Theirs** — Use the spreadsheet version
  - **Merge** — Combine both (pick individual fields from each side)
- **Don't panic:** Conflicts are normal and easy to resolve. Just pick the version that looks most correct.

### Sending Emails

#### Step 14: Selecting Recipients

- **What to do:** Click **"Sending Emails"** in the sidebar, then click **"Compose"**.
- **Step 14a:** Use the filters to select which alumni will receive the email (by program, year, etc.).
- **What you'll see:** A count showing how many alumni have valid email addresses from your selection.
- **Role note:** Chairpersons can only email alumni from their own program.

#### Step 15: Composing and Sending

- **What to do:** Write your **subject line** and **email body**.
- **Template variables:** You can insert personalized placeholders like `{{fullName}}`, `{{program}}`, `{{yearGraduated}}` — these are automatically replaced with each alumni's actual information.
- **Google Form link:** Toggle the switch to automatically include your Google Form survey link at the bottom of each email.
- **Preview:** Click **"Preview"** to see what the email will look like with sample data.
- **Send:** Click **"Send Email"**. A progress bar shows how many emails have been sent.

#### Step 16: Checking Email History

- **What to do:** Go to **"Sending Emails"** → **"History"** tab.
- **What you'll see:** A table showing all previously sent emails with date, subject, number of recipients, and status (Sent / Failed).

### Reports and Exports

#### Step 17: Exporting Data

- **What to do:** Click **"Reports & Exports"** in the left sidebar.
- **What you'll see:** Cards for each export format:
  - **PDF** — Best for printing and sharing formal reports
  - **Word (DOCX)** — Best for editing and adding your own notes
  - **Excel (XLSX)** — Best for working with numbers and making your own tables
- **Filters:** Before exporting, use the filter form to select which program, year, or specialization to include.
- **What happens:** Click **"Generate"**, choose where to save the file, and the export starts.

#### Step 18: Printing a Report

- **What to do:** Use the **"Print Preview"** button to see what the report will look like on paper.
- **What happens:** A print-friendly version appears. Click **"Print"** to send it to your printer.

### Settings (Dean Only)

#### Step 19: Managing User Accounts

- **What to do:** Go to **"Settings"** and scroll to the **"Accounts"** section.
- **What you can do:**
  - **Add a new account** — Click **"Add Account"**, fill in username, password, role, and full name
  - **Edit an account** — Click the pencil icon to change details
  - **Deactivate an account** — Toggle the "Active" switch off (this blocks login without deleting the account)
- **Roles:** Assign "CE Chair", "CpE Chair", or "EE Chair" — each can only see their own program's data.

#### Step 20: Changing Preferences

- **Who:** All users (not just Dean)
- **What to do:** Go to **"Settings"** → **"Preferences"** section.
- **Options:**
  - **Dark Mode** — Toggle between light and dark appearance
  - **Display preferences** — Adjust how information is displayed
- **Tip:** Your preferences are saved automatically and remembered next time you open the app.

---

## Tab 2: Frequently Asked Questions (FAQ)

> 14 Q&A items in a searchable accordion. Users can type a keyword in the search box to filter questions.

### Login & Access

**Q1: What do I do if I can't log in?**
> Check that you're typing the correct username and password. Remember that passwords are case-sensitive (uppercase and lowercase letters matter). If you've tried 3 times and got locked out, wait 5 minutes and try again. If you still can't log in, contact the Dean — they can check your account status.

**Q2: Can I change my password?**
> You cannot change your own password. Contact the Dean — they can update your password through the Settings page or directly in the spreadsheet.

**Q3: What if the internet is down?**
> You can still use the application! When there's no internet, you'll see an "Offline" indicator. You can view all your data, add or edit records, and prepare emails. When the internet comes back, just run a sync to upload your changes.

**Q4: Can multiple people use the app at the same time?**
> Yes, but each person uses the app on their own computer with their own copy of the data. When multiple people make changes, use **Full Sync** regularly to keep everyone's data up to date. If two people edit the same record, the system will show a conflict that can be resolved easily.

### Data & Records

**Q5: What does "Pending Sync" mean?**
> It means you've added or edited a record on your computer, but the change hasn't been uploaded to the online spreadsheet yet. Run a **Full Sync** or **Push** to upload your changes.

**Q6: Can I undo a delete?**
> No — once you confirm a deletion, the record is permanently removed. The application always asks you to confirm before deleting, so read the confirmation message carefully.

**Q7: Why can I only see some alumni records?**
> If you're a Program Chairperson, you can only see records for your program (CE, CpE, or EE). The Dean can see records for all 3 programs. This is by design to protect data privacy.

**Q8: What years are covered in this system?**
> The system tracks alumni who graduated from **2018 onwards** (the 5-year post-graduation evaluation window for PTC-ACBET accreditation).

### Sync & Connectivity

**Q9: How often should I sync?**
> We recommend syncing at the **start and end of each work session**. You can also turn on **Auto-Sync** in the Data Sync page to sync automatically at regular intervals (e.g., every 15 minutes).

**Q10: What is a "conflict" and how do I fix it?**
> A conflict happens when the same alumni record has been changed both on your computer and in the online spreadsheet (e.g., you edited a record while someone else edited the same record online). The system shows you both versions side by side so you can choose which one to keep. See Step 13 in the User Manual for detailed instructions.

### Email

**Q11: Why can't I send emails to all alumni?**
> If you're a Program Chairperson, you can only send emails to alumni from your own program. The Dean can email alumni from all programs. Also, only alumni who have a valid email address on file can receive emails.

**Q12: What are template variables?**
> Template variables are placeholders like `{{fullName}}` that get automatically replaced with each alumni's actual name when the email is sent. This lets you send personalized emails to many people at once without typing each one individually.

### Reports

**Q13: What's the difference between PDF, Word, and Excel exports?**
> **PDF** creates a fixed document that looks the same on every computer — best for printing or sharing formal reports. **Word (DOCX)** creates an editable document — best if you want to add your own notes or modify the report. **Excel (XLSX)** creates a spreadsheet — best for working with numbers, sorting data, or making charts.

**Q14: Can I export data for just one program or year?**
> Yes! Before generating a report, use the filter form to select a specific program, graduation year, specialization, or location. The export will only include records that match your filters.

---

## Tab 3: Troubleshooting

> 8 categories with Problem → Cause → Solution tables. Each category has an icon and summary.

### 1. Application Startup Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| App doesn't open | Installation is corrupted | Reinstall the application from the setup file. Your data is stored separately and won't be lost. |
| App opens but shows a blank white screen | Display error during startup | Close and reopen the app. If it persists, delete the app cache folder and restart. |
| "Database error" on startup | Database file is damaged | The app will attempt automatic recovery. If it fails, restore from the `.bak` backup file in the data folder. Contact the Dean or IT support. |

### 2. Login Problems

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| "Invalid credentials" error | Wrong username or password | Double-check your username and password. Passwords are case-sensitive. |
| "Account locked for 5 minutes" | 3 failed login attempts | Wait 5 minutes, then try again carefully. The timer is shown on screen. |
| "Account is deactivated" | Dean has disabled your account | Contact the Dean to reactivate your account. |
| Can't log in while offline | No cached credentials | You must log in at least once while online. After that, offline login works automatically. |

### 3. Data Sync Problems

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Sync fails with "Network error" | No internet connection | Check your internet connection. The app shows an online/offline indicator in the top bar. |
| Sync fails with "Authentication error" | Google Sheets credentials expired or invalid | Go to **Settings** → **Spreadsheet Connection** and re-enter or re-upload the service account key. Click **"Test Connection"** to verify. |
| Sync takes a very long time | Large number of records to process | This is normal for the first sync or after many changes. Let it complete — don't close the app. |
| Sync shows many conflicts | Multiple users edited the same records | Resolve each conflict one by one using the conflict resolver. See Step 13 in the User Manual. |

### 4. Data & Records Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Can't find an alumni record | Wrong filter applied, or record doesn't exist | Clear all filters (click **"Clear Filters"**) and search by name. If still not found, the record may not have been added yet. |
| Record shows as "Pending" and won't go away | Sync hasn't been run | Run a **Full Sync** to upload your pending changes. |
| Form won't let me save | Required fields are missing or invalid | Look for red error messages under the form fields. Fill in all required fields (marked with *). |
| Alumni data seems outdated | Local data hasn't been synced recently | Run a **Pull** sync to get the latest data from the spreadsheet. |

### 5. Email Problems

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| "Connection failed" when testing email | Wrong email server settings | Go to **Settings** → **Email Connection** and verify the host, port, username, and password. Your IT department can provide the correct settings. |
| Emails not being received | Emails may be in spam folder, or email address is incorrect | Ask recipients to check their spam/junk folder. Verify the email addresses in the alumni records. |
| "0 recipients" shown | No alumni match the current filter, or alumni don't have email addresses | Adjust your filter selection, or check that the alumni records have email addresses filled in. |
| Send progress stuck | Network interruption during sending | Wait a moment — the system retries automatically. If it stays stuck, cancel and try again. Already-sent emails won't be sent twice. |

### 6. Export & Report Problems

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Export file won't open | Missing software on your computer | PDF needs a PDF reader (like Adobe Reader). DOCX needs Microsoft Word or LibreOffice. XLSX needs Microsoft Excel or LibreOffice. |
| Export contains no data | Filters are too restrictive | Adjust the export filters to include more records. Try removing filters to see if data appears. |
| Export file is very large | Many records with all fields included | This is normal for large datasets. Consider filtering to a specific program or year. |

### 7. Display & Interface Issues

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Text is too small or too large | System display scaling | Adjust your Windows display scaling in **Windows Settings** → **Display** → **Scale**. |
| Dark mode isn't saving | Preference save failed | Go to **Settings** → **Preferences** and toggle dark mode off and on again. Your preference is saved to the local database. |
| Sidebar is missing | Sidebar is collapsed | Look for a small arrow or menu icon at the top-left corner of the screen. Click it to expand the sidebar. |
| Charts or tables not loading | Data is still being fetched | Wait a moment — a loading indicator should appear. If nothing loads, try refreshing by navigating away and back. |

### 8. Safety & Data Protection

| Problem | Possible Cause | Solution |
|---------|---------------|----------|
| Worried about losing data | — | Your data is saved automatically to your computer. The system also creates backup files. Regular syncing ensures a copy exists in the spreadsheet. |
| Computer crashed during use | Unexpected power loss or system error | The application uses crash-safe saving. On next launch, it will automatically recover any unsaved changes from the backup file. |
| Someone changed a record I didn't want changed | Another user edited the same record | Use **Alumni Profiling** → **History** tab to see all past versions of a record. You can see exactly what changed and when. |
| Need to share data with someone outside the app | — | Use the **Reports & Exports** page to export data as PDF, Word, or Excel and share the file. |

---

## Search Functionality

The Help page includes a **search input** at the top that filters across all 3 tabs simultaneously:

- Searches through: step titles, step descriptions, FAQ questions, FAQ answers, troubleshooting problems, troubleshooting solutions
- As the user types, only matching items remain visible
- Clear button to reset the search
- Shows "No results found" with a suggestion to try different keywords

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | None | All content is static — no IPC calls needed |
| Store | None | No store needed |

---

## Data Flow

1. `index.tsx` mounts → renders 3-tab view with static content
2. Search input → client-side filtering of visible items
3. Accordion expand/collapse → local UI state only
4. No database queries, no IPC calls, no network requests

---

## Differences from About Page

| Aspect | About (`/about`) | Help (`/help`) |
|--------|------------------|----------------|
| **Purpose** | System overview + condensed quick reference | Full detailed support center |
| **Manual depth** | 20 steps (titles + 1–2 sentence descriptions) | 20 steps (full walkthroughs with tips, warnings, screenshots) |
| **FAQ** | 5 common questions | 14 detailed Q&A with explanations |
| **Troubleshooting** | Not included | 8 categories with 30+ problem/solution entries |
| **Search** | Not included | Full-text search across all tabs |
| **Audience** | Quick reference for familiar users | First-time or struggling users needing guidance |

---

## Flowchart Reference

The Help page is a new addition to the system. It complements the existing About page (Section 10 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md)).

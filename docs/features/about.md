# Feature: About

> **Route:** `/about` → `src/routes/about/`
> **Offline:** ✅ Yes
> **Complexity:** Low
> **Role Access:** All users

---

## Overview

The About page is a 3-section static informational page that provides an overview of the Alumni DB system, explains all 9 core features, and includes a **user-friendly manual** designed specifically for non-technical users (the primary users — faculty members — may not be tech-savvy). No database queries are needed; the only IPC call fetches the app version number.

---

## Route Structure

```
src/routes/about/
├── index.tsx                       # About page with 3-section tabbed view
├── -components/
│   ├── system-info-section.tsx     # Section 1: purpose, goals, target users, version
│   ├── core-features-section.tsx   # Section 2: summary cards for all 9 features
│   ├── user-manual-section.tsx     # Section 3: step-by-step guide for non-technical users
│   ├── feature-summary-card.tsx    # Reusable card: icon + title + description per feature
│   ├── manual-step.tsx             # Reusable step component: number + title + description + screenshot
│   └── faq-accordion.tsx           # Frequently asked questions with collapsible answers
└── -hooks/
    └── use-app-version.ts          # Fetch version from Electron IPC
```

---

## 3-Section View

### Section 1: System Info

| Item | Content |
|------|---------|
| **Purpose** | "The Alumni DB Management System is a desktop application designed for managing alumni tracer study data across three engineering programs (CE, CpE, EE)." |
| **Goals** | Centralize alumni data collection, enable analysis for accreditation, simplify reporting |
| **Target Users** | College Dean, Program Chairpersons (CE, CpE, EE) |
| **Version** | Fetched via `ipcClient.system.getVersion()` → displays app version |
| **Developer** | Attribution / credits |

### Section 2: Core Features

Summary cards for all **9 features** (aligned with the client's sitemap and v2-5 flowchart):

| # | Feature | Icon | Brief Description |
|---|---------|------|-------------------|
| 1 | **Login & Accounts** | 🔐 | Secure authentication with role-based access for Dean and Program Chairpersons |
| 2 | **Analytic Dashboard** | 📊 | Live statistics: total responses, program counts, percentages, survey tables with weighted means |
| 3 | **Alumni Directory** | 📋 | Full CRUD for alumni records with search, 6-dimension filtering, and GForm integration |
| 4 | **Alumni Profiling** | 👤 | Individual alumni profiles with 3 display views: history, latest updates, timeline |
| 5 | **Reports & Export** | 📄 | Export as PDF, DOCX, XLSX; filtered print; print preview — all role-filtered |
| 6 | **Data Sync** | 🔄 | Bidirectional sync with Google Sheets: pull, push, full sync, auto-sync timer |
| 7 | **Sending Emails** | ✉️ | Bulk email via SMTP with template variables, GForm link option, delivery tracking |
| 8 | **Settings** | ⚙️ | SMTP, Spreadsheet, Sync/DB config (Dean-only), dark mode, user preferences |
| 9 | **About** | ℹ️ | System info, feature explanations, and this user manual |

### Section 3: User Manual

> **Design Principle:** This manual is written for users who may not be tech-savvy. It uses **simple language**, **large numbered steps**, **visual aids** (screenshots/illustrations where possible), and avoids technical jargon entirely.

#### Manual Contents

**Getting Started:**
1. Opening the Application — Double-click the app icon on your desktop
2. Logging In — Enter your username and password, click "Login"
3. First-Time Setup — The Dean will be guided to configure email and spreadsheet connections
4. Understanding Your Dashboard — What the numbers and charts mean

**Daily Tasks:**
5. Viewing Alumni Records — How to browse, search, and filter the directory
6. Adding a New Alumni — Step-by-step form walkthrough
7. Editing an Alumni Record — How to update information
8. Viewing an Alumni Profile — How to see their complete history

**Working with Data:**
9. Syncing Data — How to pull from the spreadsheet and push your changes
10. Understanding Sync Status — What "Pending," "Synced," and "Conflict" mean
11. Resolving Conflicts — What to do when a record has been changed in both places

**Sending Emails:**
12. Selecting Recipients — How to filter who receives the email
13. Composing and Sending — Writing the email and using template variables
14. Checking Email History — How to see what was sent and delivery status

**Reports:**
15. Exporting Data — How to create PDF, Word, or Excel reports
16. Printing a Report — How to preview and print filtered data

**Settings (Dean Only):**
17. Managing Accounts — How to add, edit, or deactivate user accounts
18. Configuring Email — How to set up the email server connection
19. Configuring Spreadsheet — How to connect to Google Sheets
20. Changing Preferences — How to toggle dark mode

**FAQs:**
- "What do I do if I can't log in?" — Check credentials, wait if locked out, contact Dean
- "What if the internet is down?" — You can still work offline; sync when back online
- "How do I change my password?" — Contact the Dean to update your account
- "What does 'Pending Sync' mean?" — Your changes are saved locally but not yet uploaded
- "Can I undo a delete?" — No, deletions are permanent. Be careful and confirm when asked.

#### Design Guidelines for Manual UI

- **Large, clear headings** — Each step has a bold numbered heading
- **Simple sentences** — Maximum 1–2 sentences per instruction
- **Screenshot placeholders** — Each step should eventually include a screenshot or annotated illustration
- **Consistent structure** — Every step follows: "What to do" → "Where to click" → "What happens next"
- **No jargon** — Avoid words like "SMTP," "IPC," "repository," "schema" — use "email server," "connection," "data," "form rules"
- **Reassuring tone** — Include messages like "Don't worry, your data is saved automatically"

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `system.ipc.ts` | `system:getVersion` (app version from `package.json`) |
| Store | — | No dedicated store; content is static |

---

## Data Flow

1. `index.tsx` mounts → calls `use-app-version` hook
2. Hook calls `ipcClient.system.getVersion()`
3. Returns version string from `package.json` → displayed in System Info section
4. All other content is static — no database queries

---

## Flowchart Reference

**About** — Section 10 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

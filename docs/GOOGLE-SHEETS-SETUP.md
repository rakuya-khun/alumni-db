# Google Sheets Setup Guide — Alumni DB

> **Audience:** Project developers and the Dean (initial admin) who will configure the system.
> This guide covers all Google-side setup required before the Alumni DB application can sync data.

---

## Table of Contents

1. [What You Already Have](#1-what-you-already-have)
2. [Create a Google Cloud Project](#2-create-a-google-cloud-project)
3. [Enable the Google Sheets API](#3-enable-the-google-sheets-api)
4. [Create a Service Account & Download Key](#4-create-a-service-account--download-key)
5. [Add the Accounts Tab](#5-add-the-accounts-tab)
6. [Share the Spreadsheet with the Service Account](#6-share-the-spreadsheet-with-the-service-account)
7. [Configure the App (Settings Page)](#7-configure-the-app-settings-page)
8. [Create User Accounts](#8-create-user-accounts)
9. [First Data Sync](#9-first-data-sync)
10. [FAQ](#10-faq)
11. [Security Notes](#11-security-notes)
12. [Troubleshooting](#12-troubleshooting)

---

## 1. What You Already Have

The client provided a Google Spreadsheet called **"Raw Data for Alumni Database"** with:

| Tab | Purpose |
|-----|---------|
| `CE` | Civil Engineering form responses |
| `CPE` | Computer Engineering form responses |
| `EE` | Electrical Engineering form responses |

- **3 Google Forms** (one per program) are already connected to this single spreadsheet
- Each form writes responses to its respective tab
- Column headers are the actual Google Form question text (e.g., "1. Full Name (Surname, Given Name, M.I)")
- Extra columns from Forms (Timestamp, Data Privacy Notice, "What is your status?") are handled automatically

**Spreadsheet ID:** `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms`
(Pre-filled as the default in the app — the Dean can change it in Settings)

**You do NOT need:**
- ❌ To rename any column headers (the app uses fuzzy matching)
- ❌ To add Apps Script code
- ❌ To change the Google Form settings
- ❌ To restructure the existing tabs

**You only need to:**
- ✅ Add an **Accounts** tab (for login accounts)
- ✅ Create a **Google Cloud service account** (for API access)
- ✅ **Share** the spreadsheet with the service account
- ✅ **Configure** the app settings (mostly pre-filled)

---

## 2. Create a Google Cloud Project

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Sign in with the **institution Gmail account** (e.g., the SLSU engineering account that owns the Google Forms)
3. Click the **project dropdown** (top-left) → **New Project**
4. Fill in:
   - **Project name:** `Alumni DB` (or any descriptive name)
   - **Organization:** select if applicable, or leave "No organization"
5. Click **Create** and wait for the project to be provisioned
6. Make sure the new project is **selected** in the top-left dropdown

---

## 3. Enable the Google Sheets API

1. In the Cloud Console, go to **APIs & Services → Library** (left sidebar)
2. Search for **Google Sheets API**
3. Click on it → click **Enable**
4. Wait for the API to activate (takes a few seconds)

> **No other APIs are needed.** The app only reads/writes spreadsheet data — it does not use Drive, Gmail, or any other Google API.

---

## 4. Create a Service Account & Download Key

### 4a. Create the Service Account

1. Go to **APIs & Services → Credentials**
2. Click **+ CREATE CREDENTIALS** → **Service account**
3. Fill in:
   - **Service account name:** `alumni-db-sync`
   - **Service account ID:** auto-generated (e.g., `alumni-db-sync@alumni-db-XXXXX.iam.gserviceaccount.com`)
   - **Description:** `Service account for Alumni DB desktop app to read/write spreadsheet data`
4. Click **CREATE AND CONTINUE**
5. Skip the "Grant this service account access" step (no IAM roles needed — access is granted by sharing the spreadsheet)
6. Skip the "Grant users access" step
7. Click **DONE**

### 4b. Download the JSON Key

1. In the **Credentials** page, find the service account you just created
2. Click on its **email address** to open details
3. Go to the **Keys** tab
4. Click **ADD KEY → Create new key**
5. Select **JSON** → click **CREATE**
6. A `.json` file will download — **this is the service account key**

> **Keep this file secure.** It grants read/write access to any spreadsheet shared with the service account. The app encrypts it before storing.

The JSON key file looks like this (relevant fields):

```json
{
  "type": "service_account",
  "project_id": "alumni-db-XXXXX",
  "private_key_id": "...",
  "private_key": "-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n",
  "client_email": "alumni-db-sync@alumni-db-XXXXX.iam.gserviceaccount.com",
  "client_id": "...",
  "auth_uri": "https://accounts.google.com/o/oauth2/auth",
  "token_uri": "https://oauth2.googleapis.com/token",
  ...
}
```

The `client_email` field is the email you will use to share the spreadsheet (Step 6).

---

## 5. Add the Accounts Tab

The app stores login accounts (Dean, CE Chair, CpE Chair, EE Chair) in a tab called **`Accounts`** in the same spreadsheet.

1. Open the spreadsheet in Google Sheets
2. Click the **"+"** button at the bottom-left (next to the CE/CPE/EE tabs) to add a new tab
3. **Right-click** the new tab → Rename → type `Accounts` (exact spelling, capital A)
4. In the **Accounts** tab, add these headers in Row 1:

| A | B | C | D | E | F | G |
|---|---|---|---|---|---|---|
| `username` | `password_hash` | `role` | `full_name` | `is_active` | `created_at` | `last_login` |

5. Leave the rest of the rows empty — the app creates accounts through its Settings page

> **Note:** You don't need to manually add any accounts here. The app has a built-in dev account (`devadmin` / `devadmin`) that works offline for initial setup. Once connected online, you can create the real accounts from within the app.

---

## 6. Share the Spreadsheet with the Service Account

1. Open the JSON key file you downloaded (in Notepad or any text editor)
2. Find the `"client_email"` field — it looks like:
   ```
   alumni-db-sync@alumni-db-XXXXX.iam.gserviceaccount.com
   ```
3. **Copy** that email address
4. Open your Google Spreadsheet → click **Share** (top-right)
5. Paste the service account email → set permission to **Editor**
6. Uncheck "Notify people" (service accounts can't receive email)
7. Click **Share**

---

## 7. Configure the App (Settings Page)

1. Launch the Alumni DB application
2. Log in with `devadmin` / `devadmin` (works offline — built-in dev account)
3. You'll be redirected to **Settings** (since Sheets + SMTP aren't configured yet)
4. In the **Google Sheets Connection** section, fill in:

| Field | Value | Pre-filled? |
|-------|-------|-------------|
| **Spreadsheet ID** | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms` | ✅ Yes (default) |
| **Service Account Key (JSON)** | Paste the **entire contents** of the downloaded `.json` key file | No |
| **CE Tab Name** | `CE` | ✅ Yes (default) |
| **CpE Tab Name** | `CPE` | ✅ Yes (default) |
| **EE Tab Name** | `EE` | ✅ Yes (default) |
| **Google Form URLs** (optional) | Each program's Google Form link | No |

5. Click **"Save Sheets Settings"**
6. Click **"Test Connection"** — should show a green success message
7. Next, configure the **SMTP settings** (for email) in the section below — both Sheets and SMTP must be configured to unlock the full app

---

## 8. Create User Accounts

After the Sheets connection is working:

1. Go to **Settings** → **Account Management** (visible to Dean role)
2. Click **"Add Account"**
3. Create accounts for each user:

| Username | Role | Access |
|----------|------|--------|
| *(choose)* | `dean` | All programs (CE, CpE, EE) |
| *(choose)* | `ce_chair` | CE only |
| *(choose)* | `cpe_chair` | CpE only |
| *(choose)* | `ee_chair` | EE only |

4. The app handles password hashing automatically — each account is written to the **Accounts** tab
5. Users can now log in. **Online** → reads from Sheets. **Offline** → uses encrypted local cache (auto-created on first online login)

---

## 9. First Data Sync

1. Go to **Data Sync** (sidebar)
2. Click **"Pull from Google Sheets"**
3. The app reads all 3 tabs (CE, CPE, EE) and imports alumni responses into the local database
4. Check the **Alumni Directory** to verify data was imported correctly
5. Each record shows `sync_status: synced` after successful import

> **How header matching works:** The app uses fuzzy matching to automatically recognize the Google Form question text as column headers. It strips question numbers (e.g., "1.", "13a."), matches keywords, handles matrix questions (competency ratings in `[brackets]`), and resolves "Others (specify)" follow-up columns by position context. No manual header renaming needed.

---

## 10. FAQ

### Do I need Google Apps Script?

**No.** The app connects directly to Google Sheets via the Google Sheets API v4 using the service account. No Apps Script code is needed. The 3 Google Forms continue writing responses to the spreadsheet as normal.

### What if the Dean changes the spreadsheet?

Go to **Settings → Google Sheets Connection** and update the Spreadsheet ID and tab names. Make sure the new spreadsheet is shared with the service account email.

### What about the "Timestamp", "Data Privacy Notice", and "Status" columns?

- **Timestamp** → mapped to `created_at` in the database (auto-managed by Google Forms)
- **DATA PRIVACY NOTICE...** → automatically skipped (consent acknowledgment, not alumni data)
- **"What is your status?"** → automatically skipped (form routing field, not stored)

### What if some columns don't match?

The mapper uses a multi-strategy approach:
1. Exact match (short-form headers like "Full Name")
2. Question-number stripping ("1. Full Name ..." → "Full Name ...")
3. Long-form match (full Google Form question text)
4. Bracket extraction for matrix questions (competency `[keywords]`)
5. Context-based "Others" resolution (tracks the previous main question)
6. Keyword fallback

If a column still can't be matched, it's safely skipped without errors.

### How does the Accounts tab work?

Columns: `username`, `password_hash` (bcrypt), `role`, `full_name`, `is_active`, `created_at`, `last_login`. Passwords are bcrypt-hashed — never stored as plain text. On first online login, the account is encrypted locally (AES-256-GCM) for offline fallback.

### Can multiple users use the app simultaneously?

The app is an offline-first desktop application. Each installation has its own local database. Data is synchronized with Google Sheets when sync is triggered. If multiple users edit the same record, the conflict resolution system handles it (keep local or keep remote).

---

## 11. Security Notes

- **Service Account Key:** Contains a private key. The app encrypts it with AES-256-GCM before storing in the settings table. Never commit the JSON key to version control.
- **Accounts Tab:** Passwords are bcrypt-hashed (cost factor 10). Raw passwords are never stored.
- **Offline Cache:** When a user logs in online, their credentials are cached in an encrypted file (`auth-cache.enc`) for offline fallback. The encryption key is derived from machine-specific data.
- **Spreadsheet Access:** Only the service account email has access. Revoke it in Google Sheets sharing settings if compromised.
- **Principle of Least Privilege:** The service account has no GCP IAM roles — its only access is to the specific spreadsheet shared with it.
- **Key Rotation:** To rotate the service account key, generate a new key in GCP Console, update the app's Settings, and delete the old key from GCP.

---

## 12. Troubleshooting

| Problem | Cause | Solution |
|---------|-------|----------|
| "Test Connection failed" | Spreadsheet not shared with service account | Share with Editor access (Step 6) |
| "API not enabled" | Sheets API not enabled in GCP | Enable it (Step 3) |
| "Invalid credentials" | Malformed or wrong JSON key | Re-download the key from GCP Console |
| "Sheet not found: CE" | Tab name doesn't match exactly | Check spelling + case in Settings (CE, CPE, EE) |
| "Permission denied" | Service account has Viewer not Editor | Change to Editor in sharing settings |
| Login fails (devadmin) | Must be offline for devadmin to work | Disconnect from internet, or use a real account |
| Login fails (real account) | Account not created yet or `is_active` is FALSE | Create account in Settings → Account Management |
| Login fails offline | Never logged in online before | Log in online at least once first (caches credentials) |
| Sync pulls 0 records | No data rows below header row | Verify alumni have submitted the Google Form |
| Duplicate records after sync | Name/program/year mismatch | Ensure `full_name`, `program`, `year_graduated` match exactly |
| Some columns show as empty | Unrecognized header | Check logs — the mapper logs skipped columns. If critical, add the header text to `HEADER_TO_COLUMN` in `mapper.ts` |

---

## Quick Reference

| Item | Value / Where to Get It |
|------|------------------------|
| **Spreadsheet ID** | `1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms` (pre-filled in app) |
| **Tab Names** | `CE`, `CPE`, `EE` (pre-filled), `Accounts` (you create) |
| **Service Account JSON Key** | Downloaded from GCP Console → Credentials → Keys |
| **Service Account Email** | Inside the JSON key file → `client_email` field |
| **First Login** | `devadmin` / `devadmin` (offline dev account) |
| **Create Real Accounts** | Settings → Account Management (after connecting to Sheets) |

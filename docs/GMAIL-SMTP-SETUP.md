# Gmail SMTP Setup Guide for Alumni DB

> Step-by-step instructions for configuring Google's SMTP to send emails from the Alumni DB Management System.

---

## Overview

Alumni DB uses **Gmail's SMTP server** (via nodemailer) to send tracer study survey invitations, reminders, and updates to alumni. You need a Gmail account with a **Google App Password** — your regular Gmail password will **not** work because Gmail blocks "less secure app" sign-ins.

### What You'll Need

- A Google/Gmail account (new or existing)
- 2-Step Verification enabled on that account
- An App Password generated for Alumni DB

---

## Step 1: Choose or Create a Gmail Account

You can use any Gmail account, but we recommend creating a **dedicated** one for the College of Engineering (e.g., `slsu.coe.alumni@gmail.com`) so that:

- Emails appear from an official address, not a personal one
- Multiple staff can share access if needed
- Sent emails don't mix with personal mail

### To create a new Gmail account:

1. Go to [https://accounts.google.com/signup](https://accounts.google.com/signup)
2. Fill in the details:
   - **First name:** SLSU College
   - **Last name:** of Engineering
   - **Username:** something like `slsu.coe.alumni` or `slsu.engineering.alumni`
3. Complete the setup and verify the phone number

---

## Step 2: Enable 2-Step Verification

Google requires 2-Step Verification before you can create App Passwords.

1. Sign in to the Gmail account
2. Go to **Google Account Security**: [https://myaccount.google.com/security](https://myaccount.google.com/security)
3. Under **"How you sign in to Google"**, click **2-Step Verification**
4. Click **Get started**
5. Follow the prompts:
   - Enter your phone number
   - Choose **Text message** or **Phone call**
   - Enter the verification code sent to your phone
6. Click **Turn on**

> ✅ You should now see "2-Step Verification: On" on the Security page.

---

## Step 3: Generate an App Password

An App Password is a 16-character code that lets Alumni DB sign in to your Gmail without needing your actual password or 2FA prompts.

1. Go to App Passwords: [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
   - If you can't find this page, search "App Passwords" in the search bar at the top of [https://myaccount.google.com](https://myaccount.google.com)
2. You may need to sign in again
3. Under **"App name"**, type: `Alumni DB`
4. Click **Create**
5. Google will display a **16-character password** like: `abcd efgh ijkl mnop`
6. **Copy this password immediately** — you won't be able to see it again

> ⚠️ **Important:** Save this password somewhere safe. If you lose it, you'll need to generate a new one.

---

## Step 4: Configure SMTP in Alumni DB

1. Open **Alumni DB** on your computer
2. Log in with your account
3. Go to **Settings** (in the sidebar under SYSTEM)
4. In the **Email Server (SMTP)** section, fill in the following:

| Field | Value |
|-------|-------|
| **Host** | `smtp.gmail.com` |
| **Port** | `587` |
| **Username** | Your full Gmail address (e.g., `slsu.coe.alumni@gmail.com`) |
| **Password** | The 16-character App Password from Step 3 (without spaces) |
| **Sender Email** | Same Gmail address (e.g., `slsu.coe.alumni@gmail.com`) |

5. Click **Save SMTP Settings**
6. Click **Test Connection** to verify it works

> ✅ If the test succeeds, you'll see a success message. You're ready to send emails!

---

## Step 5: Test by Sending an Email

1. Go to **Email** → **Compose Email** in the sidebar
2. Select a few recipients using the filters
3. Choose a ready-made template (e.g., "Alumni Survey Invitation") or write your own
4. Click **Show Preview** to review
5. Click **Send** to send the emails

---

## Troubleshooting

### "Authentication failed" or "Invalid credentials"

- Make sure you're using the **App Password** (16 characters), NOT your Gmail password
- Remove any spaces from the App Password when pasting
- Verify the Username field matches the exact Gmail address used to generate the App Password

### "Connection timed out"

- Check your internet connection
- Confirm the Host is `smtp.gmail.com` and Port is `587`
- If you're behind a firewall or proxy, port 587 may be blocked — ask your IT department to allow outbound traffic on port 587

### "App Passwords option not showing"

- 2-Step Verification must be **enabled first** (see Step 2)
- App Passwords don't work with Google Workspace accounts that have **admin-disabled** App Passwords — contact your Workspace admin
- Sign out and sign back in, then try again

### "Less secure app access" error

- This is outdated. Google no longer supports "less secure apps." App Passwords are the correct method
- If you see this error, you're likely using your regular Gmail password instead of the App Password

### Rate limits / "Too many messages"

- Gmail allows **~500 emails per day** for regular Gmail accounts
- Gmail Workspace accounts can send **~2,000 per day**
- Alumni DB sends emails one at a time with a short delay between each
- If you hit the limit, wait 24 hours and try again, or split batches across days

---

## Gmail SMTP Quick Reference

| Setting | Value |
|---------|-------|
| SMTP Server | `smtp.gmail.com` |
| Port (TLS/STARTTLS) | `587` |
| Port (SSL) | `465` |
| Authentication | Required (App Password) |
| Encryption | TLS (automatic with port 587) |
| Daily send limit (free Gmail) | ~500 emails |
| Daily send limit (Workspace) | ~2,000 emails |

---

## Security Notes

- The App Password is stored **encrypted** in Alumni DB's local settings database using AES-256-GCM
- The password never leaves your computer except when authenticating with Gmail's servers over TLS
- If the Gmail account or App Password is compromised, revoke it immediately at [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
- You can revoke and regenerate a new App Password at any time without affecting the Gmail account itself

---

## Revoking an App Password

If you need to disable Alumni DB's access to the Gmail account:

1. Go to [https://myaccount.google.com/apppasswords](https://myaccount.google.com/apppasswords)
2. Find **"Alumni DB"** in the list
3. Click the **trash icon** next to it
4. The old password is immediately invalidated
5. Generate a new one if needed and update the Alumni DB settings

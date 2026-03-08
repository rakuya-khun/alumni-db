# Feature: Sending Emails

> **Route:** `/email` → `src/routes/email/`
> **Offline:** ❌ Requires Internet
> **Complexity:** High
> **Role Access:** Dean emails all programs; Chairpersons email own program alumni only

---

## Overview

The Email feature allows bulk sending of emails to **role-filtered** alumni via SMTP. Users compose emails with template variables that auto-substitute per recipient. The feature includes a GForm link inclusion decision, tracks email delivery history (completed/pending/failed), and shows received email responses. Recipients are automatically scoped to the user's accessible programs.

---

## Route Structure

```
src/routes/email/
├── index.tsx                       # Email page: action selection (compose vs history)
├── compose.tsx                     # Email compose: filter → compose → send flow
├── history.tsx                     # Email history (completed & pending status)
├── received.tsx                    # Show received emails / responses
├── -components/
│   ├── recipient-filter.tsx        # Filter by Program / Year (role-scoped)
│   ├── recipient-count.tsx         # "N recipients with valid email" display
│   ├── email-composer.tsx          # Subject + body editor
│   ├── gform-link-toggle.tsx       # Decision: include GForm link in email body?
│   ├── template-var-helper.tsx     # Clickable {{variable}} insertion buttons
│   ├── email-preview.tsx           # Live preview with sample data
│   ├── send-progress.tsx           # Progress bar during SMTP send
│   ├── email-history-table.tsx     # History list: completed & pending badges
│   └── received-emails-table.tsx   # Table of received/response emails
├── -hooks/
│   ├── use-email-send.ts          # Send logic, progress tracking, error handling
│   ├── use-email-history.ts       # Fetch email history (completed + pending)
│   ├── use-received-emails.ts     # Fetch received emails
│   └── use-recipients.ts          # Filter alumni → countable recipients (role-filtered)
└── -schemas/
    └── email.schema.ts            # Zod schema: subject required, body required, recipients validated
```

---

## Pages

### Action Selection (`index.tsx`)

The email page starts with an action selection:
- **Compose** → Navigate to compose flow
- **History / Inbox** → Navigate to email history and received emails

### Compose (`compose.tsx`)

**Step 1 — Filter Recipients (role-scoped):**
- Filter by Program (CE/CpE/EE) and/or Year Graduated
- **Role-filtered:** CE Chair can only select CE alumni as recipients
- Display count: "N recipients with valid Gmail address"
- Only alumni with non-empty `gmail_address` are included

**Step 2 — Compose:**
- Subject line input (required)
- Body textarea with template variable insertion (required)
- **Include GForm Link?** — Toggle to attach the Google Form link to the email body
- Template variable helper buttons: `{{fullName}}`, `{{program}}`, `{{yearGraduated}}`, `{{gmailAddress}}`

**Step 3 — Preview & Send:**
- Live preview with sample alumni data substituted
- Send button triggers SMTP delivery
- Progress bar showing N/total sent
- Error handling with retry option for failed deliveries

### History (`history.tsx`)

- Table of all sent emails with columns: Subject, Recipients, Date, Status
- Status badges: `completed` (green), `pending` (yellow), `failed` (red)
- Click to view full details (recipient list, body, errors)

### Received (`received.tsx`)

- Display received email responses (manual log — entries added manually by user, not IMAP)
- Table showing: From, Subject, Date, Status
- Note: No IMAP integration; this is a simple manual tracking log

---

## Template Variables

The template engine (in `src/lib/template-engine.ts`) substitutes these variables per recipient:

| Variable | Source Column | Example |
|----------|--------------|---------||
| `{{fullName}}` | `full_name` | "Doe, John A." |
| `{{program}}` | `program` | "BSCpE" |
| `{{yearGraduated}}` | `year_graduated` | "2020" |
| `{{gmailAddress}}` | `gmail_address` | "john@gmail.com" |
| `{{firstName}}` | Parsed from `full_name` | "John" |
| `{{lastName}}` | Parsed from `full_name` | "Doe" |

---

## Validation

- **Subject:** Required, minimum 1 character, maximum 200 characters
- **Body:** Required, minimum 1 character
- **Recipients:** At least 1 valid recipient required before send is allowed
- **Email format:** `gmail_address` validated as proper email format
- **GForm link:** If enabled, validates that `gform_link` is configured in Settings

---

## Backend Dependencies

| Layer | File | Role |
|-------|------|------|
| IPC | `email.ipc.ts` | `email:send`, `email:getHistory`, `email:getReceived` |
| Service | `email.service.ts` | Compose per-recipient emails, SMTP transport, template rendering |
| Repository | `email-history.repository.ts` | Log sends to `email_history` table |
| Repository | `alumni.repository.ts` | Fetch role-filtered recipients |
| Integration | `smtp/transport.ts` | Nodemailer transport factory |
| Integration | `smtp/templates.ts` | HTML email templates, variable substitution |
| Store | `auth.store.ts` | `accessiblePrograms` for role-filtered recipients |

---

## Email Send Flow

1. User selects filters (role-scoped) → composes email → optionally includes GForm link → clicks Send
2. `use-email-send` hook validates with `email.schema.ts`
3. Hook calls `ipcClient.email.send({ subject, body, filters, includeGFormLink, programs })`
4. `email.ipc.ts` → `emailService.send()`
5. Service queries `alumniRepository.findByFilters(filters, programs)` → gets role-filtered recipient list
6. Service creates `email_history` record with `status = 'pending'`
7. For each recipient:
   - Substitute template variables in body
   - Optionally append GForm link
   - Send via `nodemailer` transport
   - Track success/failure per recipient
8. Update `email_history.status` → `completed` or `failed`
9. IPC returns result → hook updates UI → progress bar completes

---

## Flowchart Reference

**Sending Emails** — Section 8 in [alumni-db-flowcharts.md](../technical/alumni-db-flowcharts.md) and the [interactive HTML flowchart](../technical/alumni-db-flowcharts-v2-5.html).

# PEO Module — Caveman Edition Explainer 🦴

> **Audience:** Non-IT faculty (Dean, Chairpersons), accreditation reviewers
> **Purpose:** Explain how the PEO Attainment module works in plain language
> **Companion to:** [PEO-IMPLEMENTATION-PLAN.md](PEO-IMPLEMENTATION-PLAN.md) (technical spec)

---

## What This Thing Does

School make 3 promises about graduate. Now we count: **how many alumni really became this?** Big number on screen = proof for accreditation people.

---

## The Three Promises

| PEO | Short Name | The Promise |
|-----|------------|-------------|
| 🏆 **PEO 1** | Professional Competence | Graduate good at job — skilled, licensed, climbing ladder |
| 🤝 **PEO 2** | Ethics & Social Responsibility | Graduate good person — helps community, ethical, recognized |
| 🔬 **PEO 3** | Innovation & Sustainability | Graduate makes new things — research, tech, sustainability |

---

## How It Works — Big Picture Flowchart

```mermaid
flowchart TD
    Start([Faculty opens app]) --> Sidebar[Click PEO Attainment in sidebar]
    Sidebar --> Page[/peo page loads/]
    Page --> Filter[Faculty picks filters:<br/>Programs, Year Range,<br/>Denominator, As-of-Year]

    Filter --> Compute{Computer reads<br/>each alumni row}

    Compute --> P1[Apply PEO 1 rules]
    Compute --> P2[Apply PEO 2 rules]
    Compute --> P3[Apply PEO 3 rules]
    Compute --> OR[Apply Cohort split]

    P1 --> Math1[Count passes ÷ total × 100]
    P2 --> Math2[Count passes ÷ total × 100]
    P3 --> Math3[Count passes ÷ total × 100]
    OR --> CohortMath[Split by years since graduation]

    Math1 --> Show[Show big % cards on screen]
    Math2 --> Show
    Math3 --> Show
    CohortMath --> Show

    Show --> Tiny{Less than 10<br/>alumni in scope?}
    Tiny -->|Yes| Badge[Show yellow<br/>Insufficient Data badge]
    Tiny -->|No| Done[Show clean number]

    Badge --> Export{Faculty wants paper?}
    Done --> Export
    Export -->|Yes| PDF[Export PDF or DOCX]
    Export -->|No| End([Done])
    PDF --> End

    style Start fill:#9B2335,color:#fff
    style End fill:#9B2335,color:#fff
    style Tiny fill:#FFF3CD,color:#000
    style Badge fill:#FFC107,color:#000
```

---

## How Each PEO Gets Counted (Decision Logic)

```mermaid
flowchart TD
    Row([One alumni row]) --> Gate{Working?<br/>is_employed = 1}
    Gate -->|No| Skip[❌ Not counted<br/>for any PEO]

    Gate -->|Yes| Check1{PEO 1 check}
    Gate -->|Yes| Check2{PEO 2 check}
    Gate -->|Yes| Check3{PEO 3 check}

    Check1 --> P1A[Job matches degree?]
    Check1 --> P1B[Has license/cert?]
    Check1 --> P1C[Supervisor/Manager?]
    P1A -->|Any YES| Pass1[✅ COUNT for PEO 1]
    P1B -->|Any YES| Pass1
    P1C -->|Any YES| Pass1

    Check2 --> P2A[Job matches degree?]
    Check2 --> P2B[Community involvement<br/>field filled?]
    Check2 --> P2C[Works in Gov/Academe?]
    Check2 --> P2D[Job title has<br/>volunteer/barangay/etc?]
    Check2 --> P2E[Has awards?]
    P2A -->|Any YES| Pass2[✅ COUNT for PEO 2]
    P2B -->|Any YES| Pass2
    P2C -->|Any YES| Pass2
    P2D -->|Any YES| Pass2
    P2E -->|Any YES| Pass2

    Check3 --> P3A[Job matches degree?]
    Check3 --> P3B[Research conducted<br/>field filled?]
    Check3 --> P3C[In grad school?]
    Check3 --> P3D[Job title has<br/>scientist/researcher/etc?]
    Check3 --> P3E[In tech/innovation sector?]
    P3A -->|Any YES| Pass3[✅ COUNT for PEO 3]
    P3B -->|Any YES| Pass3
    P3C -->|Any YES| Pass3
    P3D -->|Any YES| Pass3
    P3E -->|Any YES| Pass3

    style Skip fill:#F8D7DA,color:#000
    style Pass1 fill:#D4EDDA,color:#000
    style Pass2 fill:#D4EDDA,color:#000
    style Pass3 fill:#D4EDDA,color:#000
    style Gate fill:#FFF3CD,color:#000
```

> **Caveman rule:** Working = MUST. Then any ONE box ticked under that PEO = COUNT.

---

## Step-by-Step Walkthrough

### Step 1 — Faculty Open App

Faculty click sidebar → **"PEO Attainment"** 🏆

Page open. Show 4 tabs at top:

```
[ PEO 1 ] [ PEO 2 ] [ PEO 3 ] [ Outcome Rates ]
```

---

### Step 2 — Faculty Pick Filters

Top of page got buttons:

- **Programs** → pick CE, CpE, EE, or all
- **Year range** → pick 2018 to 2025 (or whatever)
- **Denominator** → "all alumni" or "only employed"
- **As-of-Year** → default = today's year (2026)

> 🔒 *Dean see all programs. CE Chair only see CE — robot enforce this automatically.*

---

### Step 3 — Computer Goes to Database

For **each alumni row**, computer ask 4 questions per PEO. See decision flowchart above ⬆️

---

### Step 4 — Computer Does Math

```
PEO 1 % = (alumni who passed PEO 1) ÷ (total alumni) × 100
PEO 2 % = (alumni who passed PEO 2) ÷ (total alumni) × 100
PEO 3 % = (alumni who passed PEO 3) ÷ (total alumni) × 100
```

**Example:** 250 alumni total. 196 passed PEO 1.
→ **PEO 1 = 78.4%** ✓

---

### Step 5 — Show Big Number on Screen

Faculty see:

```
┌─────────────────────────┐  ┌──────────────────────────┐
│  PEO 1                  │  │  Why they passed:        │
│                         │  │                          │
│  78.4%                  │  │  ✓ Job-related: 180/250  │
│                         │  │  ✓ Has license:  95/250  │
│  196 of 250 alumni      │  │  ✓ Supervisory:  60/250  │
└─────────────────────────┘  └──────────────────────────┘
```

Left card = the big % number.
Right card = **show the work**, like math homework. Accreditor can see exactly which boxes ticked.

---

### Step 6 — Outcome Rates Tab (Cohort Split)

Splits alumni by **how long since graduation:**

```mermaid
flowchart LR
    All([All Alumni]) --> Split{Year Graduated?}
    Split -->|2024-2026| Recent[🌱 Recent Grad<br/>0-2 years out]
    Split -->|2021-2023| Mid[🌳 Mid-Career<br/>3-5 years out]
    Split -->|2018-2020| Est[🏔️ Established<br/>6+ years out]

    Recent --> Align1[How many aligned?<br/>employed AND job-related]
    Mid --> Align2[How many aligned?<br/>employed AND job-related]
    Est --> Align3[How many aligned?<br/>employed AND job-related]

    Align1 --> Show1[Show % per cohort card]
    Align2 --> Show1
    Align3 --> Show1

    style Recent fill:#D1ECF1,color:#000
    style Mid fill:#D4EDDA,color:#000
    style Est fill:#FFF3CD,color:#000
```

| Cohort | Graduated | Why care |
|--------|-----------|----------|
| 🌱 Recent (0–2 yrs) | 2024–2026 | Fresh grads — still finding feet |
| 🌳 Mid-Career (3–5 yrs) | 2021–2023 | Sweet spot for accreditation |
| 🏔️ Established (6+ yrs) | 2018–2020 | Old grads — should score highest |

If old grads score LOW → red flag for school. School not preparing them well.

---

### Step 7 — Faculty Want Paper Report

Faculty click **"Export PDF"** or go to **Reports page** → "PEO Attainment Report" card.

```mermaid
flowchart LR
    Faculty([Faculty]) --> Choice{Where?}
    Choice -->|/peo page| Btn1[Click Export PDF/DOCX<br/>at top of page]
    Choice -->|/reports page| Btn2[Click PEO Report card]

    Btn1 --> Service[Same export service<br/>builds the file]
    Btn2 --> Service

    Service --> File[📄 PDF/DOCX with:<br/>• Cover page<br/>• Big PEO numbers<br/>• Show-the-work tables<br/>• Cohort breakdown<br/>• Methodology footer]

    File --> Print[Faculty brings to<br/>accreditation meeting]

    style Service fill:#9B2335,color:#fff
    style File fill:#D4EDDA,color:#000
```

---

## Safety Nets

### 🟡 "Tiny Number" Warning

If only **8 alumni** match the filter, computer NOT just say "100%!" Computer add **yellow badge:**

> ⚠️ Insufficient data (n=8)

Why? Because "100% from 2 alumni" embarrass school. Honesty better.

### 🔒 Permission Locks

```mermaid
flowchart TD
    Login([User logs in]) --> Role{What role?}
    Role -->|Dean| Dean[See ALL 3 programs<br/>BSCE + BSCpE + BSEE]
    Role -->|CE Chair| CE[See ONLY BSCE]
    Role -->|CpE Chair| CPE[See ONLY BSCpE]
    Role -->|EE Chair| EE[See ONLY BSEE]

    Dean --> Filter[Filter applied<br/>automatically before SQL runs]
    CE --> Filter
    CPE --> Filter
    EE --> Filter

    Filter --> Safe[✅ No way to peek<br/>at other programs]

    style Safe fill:#D4EDDA,color:#000
```

### 📅 Date Auto-Updates

Cohort math uses today's year automatically. Next year, "Recent Grad" shifts from 2024-2026 → 2025-2027 by itself. No manual edit needed.

---

## How Computer Builds This (3-Floor Architecture)

```mermaid
flowchart TD
    UI[🖼️ TOP FLOOR<br/>What faculty sees<br/>/peo page + Reports card]
    Service[🧠 MIDDLE FLOOR<br/>The brain<br/>Apply rules, count, calculate %]
    DB[📚 BOTTOM FLOOR<br/>The library<br/>Read alumni rows from database]

    UI -->|Asks via IPC| Service
    Service -->|Asks via SQL| DB
    DB -->|Returns rows| Service
    Service -->|Returns numbers| UI

    style UI fill:#D1ECF1,color:#000
    style Service fill:#FFF3CD,color:#000
    style DB fill:#D4EDDA,color:#000
```

Each floor talks ONLY to floor below. Clean. Safe. Easy to fix later.

---

## Where Data Comes From (Already in Database!)

| What we check | Database column |
|---------------|-----------------|
| Working? | `is_employed` |
| Job match? | `job_relevance` |
| License? | `has_license` + `other_certifications` |
| Boss role? | `job_level` |
| Community work? | `community_involvement` ⭐ *(direct field exists!)* |
| Research? | `research_conducted` ⭐ *(direct field exists!)* |
| Awards? | `has_awards` |
| Industry? | `industry_sector` |
| When grad? | `year_graduated` |

> **Big win:** Database ALREADY has community + research fields. Don't need to ask alumni again. Just use what we got.

---

## What Computer DOES NOT Do

- ❌ Not change any existing data
- ❌ Not break dashboard or other pages
- ❌ Not need internet (works offline)
- ❌ Not show wrong numbers — has tiny-data warning
- ❌ Not let CE Chair peek at EE numbers — locked by role

---

## End-to-End Journey (One Picture)

```mermaid
sequenceDiagram
    actor F as Faculty
    participant UI as PEO Page
    participant API as IPC Bridge
    participant Svc as PEO Service
    participant DB as SQLite DB

    F->>UI: Click sidebar "PEO Attainment"
    UI->>F: Show filters + 4 tabs

    F->>UI: Pick programs + year range
    UI->>API: peo:compute(filters)
    API->>API: scopeFilters() applies role lock
    API->>Svc: compute(scoped filters)

    Svc->>DB: SELECT alumni WHERE program IN (...)
    DB-->>Svc: 250 rows
    Svc->>Svc: For each row, apply PEO 1/2/3 rules
    Svc->>Svc: Count passes, calculate %
    Svc->>Svc: Check if n < 10 (insufficient)

    Svc-->>API: { peo1: 78.4%, peo2: 45%, peo3: 32%, ... }
    API-->>UI: Result
    UI->>F: Show big % cards + breakdown

    F->>UI: Click "Export PDF"
    UI->>API: export:peoPdf(filters)
    API->>Svc: peoPdf(filePath, filters)
    Svc->>Svc: Build PDF (cover + numbers + tables)
    Svc-->>F: 📄 File saved
```

---

## TL;DR for Non-IT Faculty

> **PEO module = scoreboard.**
> Plug in filters → see big % number → see why → print it for accreditation.
> Safe, locked by role, honest about small samples, auto-updates each year.

---

## Quick Reference Card (Print This!)

| Question | Answer |
|----------|--------|
| Where do I find it? | Sidebar → TOOLS → "PEO Attainment" |
| What can I filter by? | Programs, year range, denominator (all/employed), as-of-year |
| Why does it say "Insufficient data"? | Less than 10 alumni in your filter — too few to trust the % |
| Why can't I see other programs? | Your role only allows your program (CE/CpE/EE Chair) |
| How do I export for accreditation? | Click "Export PDF/DOCX" on /peo page OR go to Reports → "PEO Attainment Report" card |
| Does it update automatically each year? | Yes — cohort years roll forward each January |
| What if alumni didn't fill the community/research field? | Computer falls back to checking job sector + job title keywords |
| Will it slow down the app? | No — same speed as the dashboard |

---

End of explainer. For technical details see [PEO-IMPLEMENTATION-PLAN.md](PEO-IMPLEMENTATION-PLAN.md).

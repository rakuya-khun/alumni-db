# PEO End-to-End Fix Plan

**Status:** Approved — ready to implement.
**Scope:** 8 fixes across 4 files. Re-aligned against the official PEO definitions (College of Engineering accreditation document).
**Validation:** Every item below was verified directly against the actual source code at the cited line numbers AND cross-checked against the official PEO text.

---

## Official PEO Definitions (source of truth)

| PEO | Official wording (key phrases) |
|---|---|
| **PEO 1 — Professional Competence** | Graduates shall demonstrate professional competence by **applying advanced knowledge and skills in their respective fields**, contributing to **academic and industry excellence through innovation, research, and continuous learning** in both local and global contexts. |
| **PEO 2 — Ethics & Social Responsibility** | Graduates shall exhibit **moral integrity, ethical values, and social responsibility** by **addressing community needs, promoting inclusivity**, and upholding professional and societal ethics in their personal and professional undertakings. |
| **PEO 3 — Innovation & Sustainability** | Graduates shall engage in **innovative research, technological advancement, and extension services** that promote **environmental sustainability, resource regeneration, and community empowerment** in support of national and global development. |

---

## Client Decisions (post-PEO-alignment review)

1. **Titles:** Use `Ethics & Social Responsibility` / `Innovation & Sustainability` everywhere. ✅ matches official text.
2. **`SUPERVISORY_SQL`:** Add only `Team Lead`. ✅ maps to PEO 1 "professional competence / career advancement".
3. **`Education` sector:** **REVISED** — add to BOTH PEO 2 community-proxy AND PEO 3 innovation sector for all three programs. Rationale: existing convention already treats `academe/academic/university/research` as matching both PEO 2 ("addressing community needs") AND PEO 3 ("extension services / innovative research"). Original "PEO 2 only" answer would have broken that symmetry.
4. **BSCE `Construction & Infrastructure`:** Counts as BSCE innovation (PEO 3). Caveat noted: "Construction & Infrastructure" is the natural CE field which arguably fits PEO 1 (job-related employment) more than PEO 3 (innovative research). However, without it BSCE PEO 3 would be near-zero, and the existing pattern for BSCpE/BSEE counts the natural field (software/power) as innovation — so BSCE follows suit. ⚠️ **Stakeholder note required:** This methodological choice (treating the natural CE field as PEO 3 evidence) must be explicitly acknowledged in the accreditation report cover letter, not just buried in this fix plan. Without it, BSCE PEO 3 would be near-zero — chairs/Dean must sign off on the convention.

---

## Fix 1 — 🔴 BUG: Innovation-sector keywords miss real form options

**File:** `electron/database/peo.repository.ts` (lines ~84–129, `INNOVATION_SECTOR_SQL`)

**Validated against `temp/Raw Data for Alumni Database - {CE,CPE,EE}.csv`.**

### 1a. BSCpE — current keywords miss most real CPE sectors

Current: `information technology`, `software`, `telecom`, `semiconductor`, `electronics`, `academe`, `research`.

Real CPE values that DON'T match today: `Cybersecurity (...)`, `FinTech/Banking/Payments/InsurTech`, `DevTools & DevOps (...)`, `QA/Testing & Test Automation`, `Hardware & Devices (...IoT...)`, `IT Consulting & Systems Integration`, `Automotive Design`, `Education`. Only `Networking & Telecommunications (...)` matches via `telecom`.

**Add to BSCpE branch (both `industry_sector` and `industry_sector_other`):**
`cyber`, `fintech`, `insurtech`, `devops`, `devtools`, `qa`, `testing`, `test automation`, `hardware`, `embedded`, `iot`, `networking`, `it consulting`, `systems integration`, `data`, `ai`, `machine learning`, `cloud`, `automotive`, `education`, `school`.

**Dropped from candidate list:** standalone `banking` — too broad; would match conventional finance roles unrelated to engineering innovation. The real CPE form value `FinTech/Banking/Payments/InsurTech` is already caught by `fintech` and `insurtech`.

(`education`/`school` per revised decision 3 — academe-style sectors count for both PEO 2 and PEO 3.)

### 1b. BSCE — add construction + education keywords (decisions 3 & 4)

Current: `consulting`, `academe`, `research`. Real CE values include `Construction & Infrastructure`, `NGO - Construction & Infrastructure`, `Real Estate & Property Development`.

**Add to BSCE branch (both columns):** `construction`, `infrastructure`, `education`, `school`.

### 1c. BSEE — add education keywords

Validated: `Renewable Energy` → `energy` ✓, `Power Generation & Distribution` → `power` ✓, `Electronics mfg` → `electronics` ✓.

**Add to BSEE branch (both columns):** `education`, `school` (per revised decision 3).

**Impact:** PEO 3 numerators rise materially for BSCpE and BSCE; small uptick for BSEE.

- [ ] Apply 1a (BSCpE)
- [ ] Apply 1b (BSCE)
- [ ] Apply 1c (BSEE)
- [ ] Re-run dashboard per program; confirm PEO 3 % rises

---

## Fix 2 — 🔴 BUG: Stale SQL strings in "How this is calculated" UI panel

**File:** `src/routes/dashboard/-components/peo/processing-logic.tsx`

**Validated stale strings (read directly from file):**

- **PEO 1, criterion 3** (~L72): currently `LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) = 'yes'` — must be updated after Fix 8a adds `team lead`.
- **PEO 2, criterion 3** (~L98): `industry_sector IN ('Government / Public Works','Academe / Research')` — old enum, no longer in repo SQL.
- **PEO 2, criterion 4** (~L104): malformed `LOWER(current_position) LIKE '%community%' OR LIKE '%extension%' OR LIKE '%volunteer%' ...` (missing column refs after first `LIKE`).
- **PEO 3, criterion 6** (~L144): old per-program `IN (...)` list with literals like `'Information Technology'`, `'Software Development'` — none of these strings exist in real form options.

**Fix:** Rewrite each `expr` to a plain summary of the keyword-LIKE patterns:

- PEO 1 crit 3: `current job_level matches: supervisory, managerial, team lead, or = 'yes'`
- PEO 2 crit 3: `industry_sector OR industry_sector_other contains: government, public sector, public service, public works, lgu, academe, academic, university, education, school, research`
- PEO 2 crit 4: `current_position contains: community, extension, volunteer, outreach, ngo, barangay, welfare, public service, social worker`
- PEO 3 crit 6: `program-specific keywords on industry_sector OR industry_sector_other (BSCE: consulting, construction, infrastructure, academe, research, education, school; BSCpE: cyber, fintech, software, telecom, IT consulting, hardware, IoT, devops, QA, networking, automotive, AI, cloud, education, school, etc.; BSEE: power, energy, renewable, telecom, semiconductor, electronics, academe, research, education, school)`

- [ ] Apply fix
- [ ] Visual review of all three "How calculated" panels

---

## Fix 3 — 🟡 INCONSISTENCY: PEO 2/3 titles disagree

**Decision 1 locked in: use export wording (matches official PEO text).**

**File:** `src/routes/dashboard/-components/peo/peo-cards-row.tsx`
- Line 52: change `'Service & Community'` → `'Ethics & Social Responsibility'`
- Line 62: change `'Research & Innovation'` → `'Innovation & Sustainability'`

`electron/services/export.service.ts` already uses these strings (lines 116–120) — no change needed there.

Optional follow-up: extract to `shared/constants/peo.constants.ts` to prevent future drift. **Skip for now**.

- [ ] Apply title changes to peo-cards-row.tsx

---

## Fix 4 — 🟡 INCONSISTENCY: `RESEARCH_ADVANCED_REASON_SQL` uses literal-cased pattern

**File:** `electron/database/peo.repository.ts` line 94

**Current:** `advanced_study_reason LIKE '%Research interest%'`. Works today (SQLite default LIKE is case-insensitive) but inconsistent with rest of file. Risk if anyone sets `PRAGMA case_sensitive_like = ON`.

**Fix:** `LOWER(advanced_study_reason) LIKE '%research interest%'`

- [ ] Apply fix

---

## Fix 5 — 🟡 INCONSISTENCY: `COMMUNITY_DIRECT_SQL` and `RESEARCH_DIRECT_SQL` count "None"/"N/A" as present

**File:** `electron/database/peo.repository.ts` lines 70 and 92

**Current:** Non-empty checks only. Validated raw values include `None`, `N/A`, `n/a`, `No`, `-` — these inflate the indicator counts.

**Fix:**
~~~ts
const COMMUNITY_DIRECT_SQL = `(
  community_involvement IS NOT NULL
  AND LOWER(TRIM(community_involvement)) NOT IN ('', 'none', 'n/a', 'na', 'no', '-', '0')
)`
const RESEARCH_DIRECT_SQL = `(
  research_conducted IS NOT NULL
  AND LOWER(TRIM(research_conducted)) NOT IN ('', 'none', 'n/a', 'na', 'no', '-', '0')
)`
~~~

- [ ] Apply fix

---

## Fix 6 — 🟡 INCONSISTENCY: `data-fields-used.tsx` doesn't list `industry_sector_other`

**File:** `src/routes/dashboard/-components/peo/data-fields-used.tsx`

**Validated:** PEO 2 array (lines ~36–51) and PEO 3 array (lines ~70–82) list `industry_sector` only. Current SQL also reads `industry_sector_other`.

**Fix:** Add to both PEO 2 and PEO 3 arrays, immediately after the `industry_sector` entry:

~~~ts
{
  name: 'industry_sector_other',
  type: 'TEXT',
  purpose: "Free-text fallback when 'Other' is selected — also scanned for keywords",
},
~~~

- [ ] Apply to PEO 2 array
- [ ] Apply to PEO 3 array

---

## Fix 7 — 🟡 INCONSISTENCY: `data-fields-used.tsx` PEO 3 mentions literal-cased pattern

**File:** `src/routes/dashboard/-components/peo/data-fields-used.tsx` ~L64

**Current:** `purpose: "LIKE '%Research interest%' — proxy"`
**After Fix 4:** `purpose: "LOWER(...) LIKE '%research interest%' — proxy"`

- [ ] Apply alongside Fix 4

---

## Fix 8 — 🟡 Decision-driven additions

### 8a. Add `team lead` to `SUPERVISORY_SQL` (decision 2)

**File:** `electron/database/peo.repository.ts` line 67

**Validated current:** `(LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) = 'yes')`

Real value `Supervisory/Team Lead` already matches via `%supervisory%`. Add `%team lead%` to also catch standalone `Team Lead` values.

**Fix:**
~~~ts
const SUPERVISORY_SQL = `(LOWER(job_level) LIKE '%supervisory%' OR LOWER(job_level) LIKE '%managerial%' OR LOWER(job_level) LIKE '%team lead%' OR LOWER(job_level) = 'yes')`
~~~

### 8b. Add `education`, `school` (and `university` to main column) to `COMMUNITY_PROXY_SECTOR_SQL` (revised decision 3)

**File:** `electron/database/peo.repository.ts` lines 71–88

**Validated current keywords:**
- `industry_sector`: `government`, `public sector`, `public service`, `public works`, `academe`, `academic`, `research` (NOTE: `university` is missing from main column).
- `industry_sector_other`: same plus `lgu`, `university`.

`Education` (CPE form value) doesn't match `academe`/`academic`/`university`. Add `education` and `school` and adds missing `%research%` to `industry_sector_other` for symmetry with the main column. Also add `university` to the main `industry_sector` for symmetry.

**Fix:**
~~~ts
const COMMUNITY_PROXY_SECTOR_SQL = `(
  LOWER(industry_sector) LIKE '%government%'
  OR LOWER(industry_sector) LIKE '%public sector%'
  OR LOWER(industry_sector) LIKE '%public service%'
  OR LOWER(industry_sector) LIKE '%public works%'
  OR LOWER(industry_sector) LIKE '%academe%'
  OR LOWER(industry_sector) LIKE '%academic%'
  OR LOWER(industry_sector) LIKE '%university%'
  OR LOWER(industry_sector) LIKE '%education%'
  OR LOWER(industry_sector) LIKE '%school%'
  OR LOWER(industry_sector) LIKE '%research%'
  OR LOWER(industry_sector_other) LIKE '%government%'
  OR LOWER(industry_sector_other) LIKE '%public sector%'
  OR LOWER(industry_sector_other) LIKE '%public service%'
  OR LOWER(industry_sector_other) LIKE '%public works%'
  OR LOWER(industry_sector_other) LIKE '%lgu%'
  OR LOWER(industry_sector_other) LIKE '%academe%'
  OR LOWER(industry_sector_other) LIKE '%academic%'
  OR LOWER(industry_sector_other) LIKE '%university%'
  OR LOWER(industry_sector_other) LIKE '%education%'
  OR LOWER(industry_sector_other) LIKE '%school%'
  OR LOWER(industry_sector_other) LIKE '%research%'
)`
~~~

- [ ] Apply 8a (team lead)
- [ ] Apply 8b (education/school/university)

---

## Implementation Order

### Step 0 — Capture baseline (BEFORE any code change)

- [ ] Record current PEO 1 / PEO 2 / PEO 3 attainment % for **each program** (CE, CpE, EE, and "All programs"). Save screenshot or copy values into a scratch file. This is the regression baseline.
- [ ] Record current `Outcomes` (Field-Aligned Employment) % per program.
- [ ] Note the current count for each indicator row in the PEO accordion (job-related, license, supervisory, community-direct, community-proxy-sector, community-proxy-keyword, has-awards, research-direct, research-grad-school, research-advanced-reason, research-proxy-keyword, innovation-sector).

### Step 1 — Code changes (in order)

1. **Fix 4** — trivial, no risk
2. **Fix 5** — repo constants, no UI impact
3. **Fix 8a** (team lead) — small additive change
4. **Fix 8b** (education/school/university/research-symmetry) — additive change to PEO 2 community-proxy-sector
5. **Fix 1a + 1b + 1c** — biggest data impact (PEO 3 numerators)
6. **Fix 2** — UI strings; must follow Fixes 1, 8 so panel matches reality
7. **Fix 3** — title alignment
8. **Fix 6 + Fix 7** — UI panel polish

### Step 2 — Verify deltas

- [ ] After Fix 5 — `communityDirect` and `researchDirect` indicator counts should DROP (no-value tokens excluded).
- [ ] After Fix 8a — PEO 1 `supervisory` indicator should rise IF any alumni have standalone `Team Lead` job_level.
- [ ] After Fix 8b — PEO 2 `communityProxySector` indicator should rise (Education + research-other now matched).
- [ ] After Fix 1 — PEO 3 `innovationSector` indicator should rise materially for CpE and CE; small uptick for EE.
- [ ] PEO 1 / PEO 2 / PEO 3 / Outcomes overall % per program — compare against baseline, sanity check direction (mostly upward; nothing should drop except `communityDirect`/`researchDirect` from Fix 5).

### Step 3 — Visual review

- [ ] Dashboard PEO cards show updated PEO 2/3 titles.
- [ ] "How calculated" panels for all three PEOs show updated `expr` strings (no stale `IN (...)` enums).
- [ ] "Data fields used" panels for PEO 2 and PEO 3 list `industry_sector_other`.
- [ ] PDF + DOCX exports still produce identical numbers to dashboard (export uses same service).

---

## Files Touched

| File | Fixes |
|---|---|
| `electron/database/peo.repository.ts` | 1, 4, 5, 8a, 8b |
| `src/routes/dashboard/-components/peo/processing-logic.tsx` | 2 |
| `src/routes/dashboard/-components/peo/data-fields-used.tsx` | 6, 7 |
| `src/routes/dashboard/-components/peo/peo-cards-row.tsx` | 3 |

**Verified clean and NOT touched:** `peo.service.ts`, `peo.ipc.ts`, `peo.store.ts`, `ipc-client.ts`, `peo.types.ts`, `peo.schema.ts`, `mapper.ts`, `schema.ts`, `preload.ts`, `ipc-channels.ts`, `export.service.ts`.

---

## Out of Scope

- Inc 8 (rewrite `PEO_METHODOLOGY` text in exports) — defer.
- Extracting PEO titles to a shared constant — defer to future PR.
- Adding a "continuous learning" indicator to PEO 1 (PEO 1 official text mentions it but currently has no dedicated indicator) — defer; flag for client.
- Adding an "extension services" indicator to PEO 3 (PEO 3 official text mentions it but currently overlaps with PEO 2 community proxy) — defer; flag for client.

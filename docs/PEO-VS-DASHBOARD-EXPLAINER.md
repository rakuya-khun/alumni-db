# PEO vs Dashboard Stat Cards — Correlation Explainer

> **Audience:** Non-IT faculty (Dean, Chairpersons), accreditation reviewers
> **Purpose:** Explain why PEO percentages and Dashboard percentages differ even though they come from the same alumni records
> **Companion to:** [PEO-EXPLAINER.md](PEO-EXPLAINER.md) (caveman edition of PEO logic) and [PEO-IMPLEMENTATION-PLAN.md](PEO-IMPLEMENTATION-PLAN.md) (technical spec)

---

## TL;DR

| Card type | Asks | Numerator | Denominator |
|-----------|------|-----------|-------------|
| **Dashboard cards** | "What % of alumni meet *this one* condition?" | One condition | Varies (all / employed / CE+EE) |
| **PEO cards** | "What % attain *this objective* (multiple paths)?" | OR of several criteria | Total respondents (default) |

PEO cards are **broader numerators on a stable denominator**. Dashboard cards are **narrow numerators on whichever denominator makes the KPI meaningful**.

---

## Side-by-Side: What Each Card Actually Computes

### Dashboard stat cards (bottom row of the dashboard)

| Card | Numerator | Denominator | Pass condition |
|------|-----------|-------------|----------------|
| **Board Passers** | `has_license = 1` | Alumni in **CE + EE only** (CpE excluded — no PRC board) | single condition |
| **Employed** | `is_employed = 1` | **All alumni** in scope | single condition |
| **Field-Related Work** | `is_employed = 1 AND job_relevance ∈ {highly, moderately}` | **Employed alumni only** | single condition |
| **Supervisory / Managerial** | `is_employed = 1 AND job_level ∈ {supervisory, managerial}` | **Employed alumni only** | single condition |

These are **single-axis KPIs** — each measures one thing.

### PEO stat cards (top row of the dashboard)

| Card | Numerator | Denominator | Pass condition |
|------|-----------|-------------|----------------|
| **PEO 1 — Professional Competence** | passing PEO 1 | All in scope (`denominatorMode='total'`) | `is_employed=1 AND (job-related OR has-license/cert OR supervisory)` — **OR of 3 criteria** |
| **PEO 2 — Ethics & Social Responsibility** | passing PEO 2 | All in scope | `is_employed=1 AND (job-related OR community OR awards)` — OR of 5 sub-criteria |
| **PEO 3 — Innovation & Sustainability** | passing PEO 3 | All in scope | `is_employed=1 AND (job-related OR research OR innovation-sector)` — OR of 6 sub-criteria |
| **Outcomes (Field-Aligned Employment)** | aligned alumni | All in scope | `is_employed=1 AND job-related` — same numerator as Field-Related card, **different denominator** |

PEO cards are **OR-composite scores** — many ways to pass.

---

## Worked Comparisons (Numbers from the Sample Screenshot)

Sample scope: **688 total respondents · 570 employed · 476 in CE+EE**.

### 1. PEO 1 (76.2% on 688) vs Field-Related (78.4% on 570)

- Numerators differ. PEO 1 counts anyone *employed who is job-related **OR** licensed **OR** supervisory* — a **broader** numerator than Field-Related.
- But PEO 1 divides by **688** (everyone), while Field-Related divides by **570** (employed only).
- Field-Related's smaller denominator pushes its rate up; PEO 1's broader numerator partly compensates → they end up close, but PEO 1 is slightly lower.

### 2. Outcomes 65.0% (447/688) vs Field-Related 78.4% (447/570)

- **Same 447 numerator.** The difference is 100% denominator choice.
- Outcomes uses *total respondents* (the accreditation-defensible default).
- Field-Related uses *employed only* (the operational HR-style KPI).

### 3. PEO 1 76.2% vs Board Passers 63.0%

- **Not directly comparable.**
- Board Passers excludes CpE entirely (476 denominator).
- PEO 1 includes CpE in its 688.
- Having a license is just *one of three* paths to PEO 1.

### 4. Why are PEO numbers all lower than Employed (82.8%)?

Every PEO has the **employment gate** built in. A PEO % can never exceed the Employed %. Outcomes (65.0%) ≤ Employed (82.8%) for the same reason.

---

## Quick Rule of Thumb

> **Dashboard cards** = single survey question, % of relevant population.
>
> **PEO cards** = *attainment of an objective* satisfied by multiple alternative criteria, % of total respondents (so accreditors can compare across cohorts on a stable base).

If you toggle the PEO accordion's **Denominator → "Employed only"**, the PEO percentages will jump because the same passing count is divided by 570 instead of 688.

---

## What "As-of Year" Does in the PEO Filter

`asOfYear` is **the reference year used to assign each alumnus to a cohort** for the Outcomes card. It does **not** filter rows — it relabels them.

Default: server-side `new Date().getFullYear()` (currently **2026**).

The cohort boundaries are computed as `Y = asOfYear`:

| Cohort | Window | Years since graduation |
|--------|--------|------------------------|
| Recent Graduate | `year_graduated >= Y − 2` | 0–2 |
| Mid-Career | `year_graduated BETWEEN Y − 5 AND Y − 3` | 3–5 |
| Established | `year_graduated BETWEEN 2018 AND Y − 6` | 6+ |

### Example with default Y = 2026

- **Recent** = grads from **2024–2026**
- **Mid** = grads from **2021–2023**
- **Established** = grads from **2018–2020**

If you set `asOfYear = 2025`, the same alumnus who graduated in 2023 moves from "Mid" to "Recent" — because in 2025 they were only 2 years out, not 3.

### Why expose it as an override?

1. **Reproducing a past report.** Reviewers may ask: *"Show me the cohort breakdown as it would have looked when you filed in 2024."* Setting `asOfYear=2024` rebuilds the cohort splits as they stood that year.
2. **Year-over-year reproducibility.** Today's "Established" cohort drifts every January 1. Pinning `asOfYear` freezes the math.
3. **Accreditation evidence trail.** The PDF/DOCX export prints the `asOfYear` on the cover page so the document is self-describing.

### What `asOfYear` does NOT affect

- PEO 1, PEO 2, PEO 3 attainment percentages — they don't use cohorts.
- Year From / Year To filters — those exclude rows; `asOfYear` only relabels them.
- The schema floor of 2018 — Established is always clamped at `>= 2018`.

So: leave it blank for "current snapshot," set it explicitly when reproducing a historical report or freezing numbers for a formal submission.

---

# 🦴 Caveman Edition

> Same explanation, fewer big words.

## Why two rows of percent cards confuse people

Top row of cards = **PEO numbers** (the accreditation promises).
Bottom row of cards = **Dashboard numbers** (regular survey stats).

They count from the same alumni list. But they ask different questions, so numbers different. That is OK. That is by design.

---

## Caveman: Dashboard cards

| Card | Caveman question |
|------|------------------|
| **Board Passers** | "How many CE and EE alumni have license?" (CpE no take board exam, so we skip them.) |
| **Employed** | "How many alumni have job?" |
| **Field-Related Work** | "Of those who have job, how many job match their degree?" |
| **Supervisory** | "Of those who have job, how many are boss?" |

One question. One simple number. Bottom of denominator changes — sometimes "all alumni," sometimes "only employed alumni."

---

## Caveman: PEO cards

| Card | Caveman question |
|------|------------------|
| **PEO 1 — Professional Competence** | "How many alumni became GOOD at job?" (Pass if employed AND job-related OR has license OR is boss.) |
| **PEO 2 — Ethics & Social Responsibility** | "How many alumni became GOOD person who help community?" (Pass if employed AND job-related OR community work OR awards.) |
| **PEO 3 — Innovation & Sustainability** | "How many alumni became MAKER of new things?" (Pass if employed AND job-related OR research OR work in tech/innovation sector.) |
| **Outcomes** | "How many alumni doing job that matches their school degree?" (Same as Field-Related card but uses ALL alumni as bottom number.) |

Many ways to pass. Bottom of denominator always = ALL alumni in scope (default). This makes accreditation people happy because the bottom number doesn't move around.

---

## Caveman: Why numbers different

### Same numerator, different bottom

**Outcomes 65.0% (447/688)** and **Field-Related 78.4% (447/570)** = SAME 447 people on top.
Just different bottom number.

- 447 ÷ 688 (everyone) = 65%
- 447 ÷ 570 (only employed) = 78%

Same people. Different math. Different percentage.

### Different paths to pass

**PEO 1** counts anyone who is employed AND (job-related OR licensed OR boss).
**Field-Related** counts anyone who is employed AND job-related.

PEO 1 has more ways to pass → bigger top number.
But PEO 1 divides by everyone (688) → smaller percentage push.
End result: PEO 1 (76.2%) and Field-Related (78.4%) end up close.

### Big rule

PEO number can NEVER be bigger than Employed number. Why? Because every PEO requires job first. No job = no PEO. So PEO ceiling = Employed %.

If Employed = 82.8%, no PEO card can show more than 82.8%.

---

## Caveman: What is "As-of Year"?

Default = today's year (right now: **2026**).

This year decides which cohort each alumnus belongs to:

- Graduated in last 2 years → **Recent**
- Graduated 3–5 years ago → **Mid-Career**
- Graduated 6+ years ago (but not before 2018) → **Established**

It does NOT remove anyone. It just RELABELS them.

### Caveman example

Alumnus graduated in 2023.

- Today (2026), 2026 − 2023 = 3 years → **Mid-Career**.
- If you set as-of-year to 2025, then 2025 − 2023 = 2 years → **Recent**.

Same alumnus. Different bucket. Because the question changed from "how does it look today?" to "how did it look last year?"

### Why this control exists

1. **Old report rerun.** Accreditation people say "show us 2024 numbers." You set as-of-year to 2024. Boom — same data, but cohorts assigned the way they were back then.
2. **Frozen snapshot.** January 1 comes and suddenly people who used to be "Mid" become "Established." If you want a report that doesn't drift, lock as-of-year.
3. **Paper trail.** When you export PDF/Word, the cover page prints the as-of-year. So if reviewer asks later, "what year was this run as?" — answer is on page 1.

### What it does NOT do

- Does NOT change PEO 1 / PEO 2 / PEO 3 percentages (those don't care about cohorts).
- Does NOT remove any alumni from the data (Year From / Year To do that).
- Cannot go before 2018 (database doesn't allow alumni earlier than that).

### Caveman summary

> Leave it blank = "right now."
> Set it = "pretend it's that year." Useful for old reports and frozen numbers.

---

## Caveman: Cheat Sheet

```
PEO % can never beat Employed %.            (Job is required.)

Outcomes uses ALL alumni as bottom.          (447 ÷ 688)
Field-Related uses ONLY employed as bottom.  (447 ÷ 570)
Same top number. Different math.

PEO 1/2/3 = "many doors to pass."            (Bigger top.)
Dashboard = "one door to pass."              (Smaller top, but smaller bottom too.)

As-of-year = relabel into cohorts.           Does not remove anyone.
Default = today's year.
Set it = pretend it's that year.
```

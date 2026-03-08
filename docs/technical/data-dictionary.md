# Data Dictionary — Alumni Tracer Study

> **Source:** Google Form questionnaires for 3 engineering programs (CE, CpE, EE)
> **Purpose:** Maps every questionnaire field → database column → form input → Google Sheets column
> **Programs:** BSCE (Civil Engineering), BSCpE (Computer Engineering), BSEE (Electrical Engineering)

---

## Questionnaire Sections Overview

| Section | Questions | Description |
|---------|-----------|-------------|
| I. Informed Consent | Consent checkbox | Data Privacy Act compliance — not stored as alumni data |
| II. Respondent Information | Q1–Q7 | Personal & contact information |
| III. Academic Profile | Q8–Q11 | Program, graduation year, honors |
| IV. Program Outcomes & Curriculum Relevance | Q12–Q15 | OBE compliance — Likert scales & competency ratings |
| V. Licensure & Professional Qualifications | Q16–Q23 | PRC license, certifications, graduate school, specialization |
| VI. Employment Data | Q24–Q37/Q38 | Core tracer indicators — employment status, job details, salary |
| VII. Career Progression | Q38–Q42 / Q39–Q43 | Longitudinal data — positions over time, awards |

---

## Section II: Respondent Information

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 1 | Full Name (Surname, Given Name, M.I) | Text | `full_name` | `TEXT NOT NULL` | |
| 2 | Date of Birth | Date | `date_of_birth` | `TEXT` | Format: MM/DD/YYYY |
| 3 | Sex | Radio | `sex` | `TEXT` | Options: Male, Female, Prefer not to say, Others |
| 3a | Others (specify) | Text | `sex_other` | `TEXT` | Conditional: if sex = "Others" |
| 4 | Permanent Home Address | Text | `permanent_address` | `TEXT` | |
| 5 | Contact Number | Text | `contact_number` | `TEXT` | |
| 6 | Active Gmail Address | Email | `gmail_address` | `TEXT` | Used as email recipient for bulk sends |
| 7 | Facebook Profile Link | URL | `facebook_link` | `TEXT` | |

---

## Section III: Academic Profile

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 8 | Degree and Program/Course Taken | Radio | `program` | `TEXT NOT NULL` | Values: `BSCE`, `BSCpE`, `BSEE` |
| 9 | Year Graduated | Number | `year_graduated` | `INTEGER NOT NULL` | e.g., 2018 |
| 10 | Latin Honors or Special Awards? | Radio | `has_honors` | `INTEGER` | 0 = No, 1 = Yes |
| 11 | Specify Honors/Awards | Text | `honors_received` | `TEXT` | Conditional: if has_honors = 1 |

---

## Section IV: Program Outcomes & Curriculum Relevance

### Q12 — Curriculum Relevance (Single 1–5 Linear Scale)

| Q# | Question | Input Type | DB Column | DB Type | Scale |
|----|----------|-----------|-----------|---------|-------|
| 12 | How relevant is the curriculum to your current employment? | Linear Scale | `curriculum_relevance` | `INTEGER` | 1=Not Relevant, 2=Slightly, 3=Moderately, 4=Relevant, 5=Highly Relevant |

### Q13 — Competency Ratings (Matrix: 9 rows × 5 columns)

Each row is a competency rated 1–5 (1=Very Poor, 2=Poor, 3=Fair, 4=Good, 5=Excellent):

| Row | Competency | DB Column | DB Type |
|-----|-----------|-----------|---------|
| 13a | Engineering knowledge and technical competence | `comp_engineering_knowledge` | `INTEGER` |
| 13b | Problem-solving ability | `comp_problem_solving` | `INTEGER` |
| 13c | Engineering design and project development | `comp_engineering_design` | `INTEGER` |
| 13d | Communication skills | `comp_communication` | `INTEGER` |
| 13e | Teamwork and collaboration | `comp_teamwork` | `INTEGER` |
| 13f | Ethical and professional responsibility | `comp_ethics` | `INTEGER` |
| 13g | Leadership and initiative | `comp_leadership` | `INTEGER` |
| 13h | Lifelong learning skills | `comp_lifelong_learning` | `INTEGER` |
| 13i | Use of modern engineering tools and technologies | `comp_modern_tools` | `INTEGER` |

> **Dashboard Analytics:** These 9 columns are used for frequency distribution tables and weighted mean calculations on the dashboard.

### Q14–Q15 — Competency Usefulness & Improvement Areas

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 14 | Most useful competencies in your job | Multi-select Checkbox | `useful_competencies` | `TEXT` | JSON array. Options: Technical/Engineering knowledge, Analytical and problem-solving skills, Communication skills, Teamwork skills, Leadership skills, Research skills, Software tools (CAD — CE/EE; generic — CpE), Project management skills, Others |
| 14a | Others (specify) | Text | `useful_competencies_other` | `TEXT` | Conditional |
| 15 | Areas university should improve | Long Text | `areas_to_improve` | `TEXT` | Free-form text |

---

## Section V: Licensure & Professional Qualifications

### Q16–19 — Licensure / Certification

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 16 | PRC License / Professional Certificate? | Radio | `has_license` | `INTEGER` | 0 = No, 1 = Yes. CE/EE: "PRC License", CpE: "Primary Professional Certificates" |
| 17 | Professional Title | Radio | `professional_title` | `TEXT` | **Program-specific** — see below |
| 17a | Others (specify) | Text | `professional_title_other` | `TEXT` | Conditional |
| 18 | Exam Date (Month and Year) | Text | `license_exam_date` | `TEXT` | e.g., "April 2025" |
| 19 | Other Certifications | Text | `other_certifications` | `TEXT` | Free-form (TESDA, PMP, Cisco, Safety Officer, etc.) |

**Professional Title Options by Program:**

| Program | Options |
|---------|---------|
| **BSCE** | Registered Civil Engineer, Master Plumber, Others |
| **BSCpE** | Certified Computer Engineer, Professional Computer Engineer, Others |
| **BSEE** | Registered Master Electrician, Registered Electrical Engineer, Professional Electrical Engineer, Others |

### Q20–23 — Graduate School & Specialization

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 20 | Enrolled / have been enrolled in Graduate School? | Radio | `has_grad_school` | `INTEGER` | 0 = No, 1 = Yes |
| 21 | Graduate School program | Text | `grad_school_program` | `TEXT` | Conditional: if has_grad_school = 1 |
| 22 | Reason for advanced studies | Multi-select Checkbox | `advanced_study_reason` | `TEXT` | JSON array. Options: Career advancement, Promotion requirement, Specialization, Research interest, Personal development, Others |
| 22a | Others (specify) | Text | `advanced_study_reason_other` | `TEXT` | Conditional |
| 23 | Specialization | Radio | `specialization` | `TEXT` | **Program-specific** — see below. Conditional: if Q22 includes "Specialization" |

**Specialization Options by Program:**

| Program | Options |
|---------|---------|
| **BSCE** | MSCE - Construction Management, MSCE - Structural Engineering, MSCE - Geotechnical Engineering, MSCE - Transportation Engineering, MSCE - Water Resource Engineering, MSCE - Environmental Engineering, Others |
| **BSCpE** | Networking, Hardware System, Security, Web Development, Software Development, Programming, Video Game Development, Data, Artificial Intelligence, Information Technology, Mobile Development, Others |
| **BSEE** | Master of Engineering (MEng), MSEE - Power System, MSEE - Electronics & Communication, MSEE - Control System, MSEE - Renewable Energy, Doctor of Philosophy in Electrical Engineering (PhD EE), Others |

---

## Section VI: Employment Data (Core Tracer Indicators)

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 24 | Currently employed? | Radio | `is_employed` | `INTEGER` | 0 = No, 1 = Yes |
| 25 | Reason not employed | Multi-select Checkbox | `unemployment_reason` | `TEXT` | JSON array. Conditional: if is_employed = 0. Options: Advance/Further Study, Family Concern, Health-related, Lack of Work Experience, No Job Opportunity, Did not Look for a Job, Others |
| 25a | Others (specify) | Text | `unemployment_reason_other` | `TEXT` | Conditional |
| 26 | Current Employment Status | Radio | `employment_status` | `TEXT` | Options: Regular/Permanent, Temporary, Casual, Contractual, Self-Employed, Others |
| 26a | Others (specify) | Text | `employment_status_other` | `TEXT` | Conditional |
| 27 | Present Position/Designation | Text | `current_position` | `TEXT` | "Please do not abbreviate" |
| 28 | Job Level / Classification | Radio | `job_level` | `TEXT` | **Program-specific** — see below |
| 29 | Company/Organization Name | Text | `company_name` | `TEXT` | "Please do not abbreviate" |
| 30 | Company/Organization Address | Text | `company_address` | `TEXT` | |
| 31 | Place of Work Assignment | Radio | `work_region` | `TEXT` | Philippine regions — see below |
| 31a | Others (specify) | Text | `work_region_other` | `TEXT` | For international work assignments |
| 32 | Industry Sector | Radio | `industry_sector` | `TEXT` | **Program-specific** — see below |
| 32a | Others (specify) | Text | `industry_sector_other` | `TEXT` | Conditional |
| 33 | Job related to degree? | Radio | `job_relevance` | `TEXT` | Options: Highly related, Moderately related, Slightly related, Not related |
| 34 | Monthly Salary Range | Radio | `salary_range` | `TEXT` | Options: Below ₱15,000 / ₱15,000–25,000 / ₱25,001–35,000 / ₱35,001–50,000 / Above ₱50,000 |
| 35 | Time to first job after graduation | Radio | `time_to_first_job` | `TEXT` | Options: Immediately / 1–3 months / 3–5 months / 6–8 months / 9–12 months / More than 1 year / Others |
| 36 | How obtained first job | Radio | `first_job_method` | `TEXT` | Options: Online job portal, University career services, Internship absorption, Faculty referral, Family/Friend referral, Walk-in application, Social media, Others |
| 36a | Others (specify) | Text | `first_job_method_other` | `TEXT` | Conditional |
| 37* | Is current job your first job since graduating? | Radio | `is_first_job` | `INTEGER` | **EE only** — 0 = No, 1 = Yes |
| 37/38 | Challenges finding first job | Multi-select Checkbox | `job_challenges` | `TEXT` | JSON array. Options: Lack of experience, Limited job openings, Low salary offers, High competition, Location constraints, Lack of licensure, Others |
| 37a/38a | Others (specify) | Text | `job_challenges_other` | `TEXT` | Conditional |

**Q28 — Job Level/Classification (Program-specific):**

| Program | Question Wording | Options |
|---------|-----------------|---------|
| **BSCE** | "Are you in the Supervisory/Managerial Level?" | Yes, No |
| **BSCpE** | "What is your Job classification?" | Consultant/Developer, Supervisory/Team Lead, Managerial, Senior Resource, Mid Level, Entry Level/Rank-and-file |
| **BSEE** | "Are you in the Supervisory/Managerial Level?" | Yes, No |

> **DB Design Note:** Store as `TEXT` to accommodate both formats. Dashboard aggregates by checking value for supervisory/managerial percentage.

**Q31 — Place of Work Assignment (All Programs):**

NCR, CAR, Region I–XIII, BARMM, Others (for international)

**Q32 — Industry Sector Options by Program:**

| Program | Options |
|---------|---------|
| **BSCE** | Construction & Infrastructure, Government & Public Sector, Consulting & Engineering Firms, Real Estate & Property Development, Transportation & Traffic Engineering, Academe, Others |
| **BSCpE** | BPO, Cloud/Datacenter/Hosting (IaaS/PaaS), Cybersecurity, DevTools & DevOps, Engineering/R&D Services, FinTech/Banking/Payments/InsurTech, Government Employee, Hardware & Devices, IT Consulting & Systems Integration, Managed Services & MSPs, Networking & Telecommunications, QA/Testing & Test Automation, Others |
| **BSEE** | Construction & Building Services, Power Generation & Distribution, Renewable Energy, Government & Public Sector, Consulting & Engineering Firms, Transportation & Traffic Engineering, Academe, Others |

---

## Section VII: Career Progression (Longitudinal Data)

| Q# | Question | Input Type | DB Column | DB Type | Notes |
|----|----------|-----------|-----------|---------|-------|
| 38/39 | Job Position after 2 years from graduation | Text | `position_2yr` | `TEXT` | |
| 39/40 | Job Position after 4 years from graduation | Text | `position_4yr` | `TEXT` | |
| 40/41 | Job Position after 6 years from graduation | Text | `position_6yr` | `TEXT` | |
| 41/42 | Awards, recognitions, or promotions? | Radio | `has_awards` | `INTEGER` | 0 = No, 1 = Yes |
| 42/43 | Specify awards | Text | `awards_received` | `TEXT` | Conditional: if has_awards = 1 |

> **Note:** Question numbers differ slightly between EE (has extra Q37) and CE/CpE.

---

## System / Metadata Columns

These columns are not from the questionnaire — they are managed by the application:

| DB Column | DB Type | Purpose |
|-----------|---------|---------|
| `id` | `INTEGER PRIMARY KEY AUTOINCREMENT` | Unique record ID |
| `sync_status` | `TEXT DEFAULT 'pending'` | Values: `pending`, `synced`, `conflict` |
| `created_at` | `TEXT` | ISO 8601 timestamp — when record was added locally |
| `updated_at` | `TEXT` | ISO 8601 timestamp — last local modification |
| `synced_at` | `TEXT` | ISO 8601 timestamp — last successful sync with Sheets |

---

## Complete Column Count Summary

| Category | Columns | Notes |
|----------|---------|-------|
| Respondent Info (Q1–Q7) | 7 + 1 conditional | `sex_other` |
| Academic Profile (Q8–Q11) | 4 | |
| Curriculum & Competencies (Q12–Q15) | 13 + 2 conditional | 9 competency rating columns + `useful_competencies_other`, `areas_to_improve` |
| Licensure & Grad School (Q16–Q23) | 8 + 3 conditional | `professional_title_other`, `advanced_study_reason_other` |
| Employment Data (Q24–Q37/38) | 16 + 5 conditional | Most conditional fields are "Others (specify)" |
| Career Progression (Q38–Q42) | 5 | |
| System/Metadata | 5 | Auto-managed |
| **Total** | **~58 columns** | Including conditional "Others" fields |

---

## Dashboard Analytics — Aggregation Queries

The dashboard computes statistics from these columns:

### Stat Cards (Top-Level KPIs)

| Card | Query Logic | Source Columns |
|------|-------------|----------------|
| Total Responses | `COUNT(*)` | — |
| CE / CpE / EE Respondents | `COUNT(*) WHERE program = ?` | `program` |
| % Board Passers | `COUNT(has_license=1) / COUNT(*)` | `has_license` |
| % Employed | `COUNT(is_employed=1) / COUNT(*)` | `is_employed` |
| % Field-Related Jobs | `COUNT(job_relevance IN ('Highly related','Moderately related')) / COUNT(is_employed=1)` | `job_relevance` |
| % Supervisory/Managerial | CE/EE: `COUNT(job_level='Yes')`, CpE: `COUNT(job_level IN ('Supervisory/Team Lead','Managerial'))` / total employed | `job_level` |

### Survey Response Tables (Frequency + Weighted Mean)

These tables show how many respondents chose each option, plus a computed weighted mean:

| Table | Source Column(s) | Rows | Columns |
|-------|-----------------|------|---------|
| Curriculum Relevance | `curriculum_relevance` | 1-5 scale values | Frequency, %, Weighted Mean |
| Competency Ratings | `comp_*` (9 columns) | 9 competencies | 1, 2, 3, 4, 5, Weighted Mean |
| Advanced Studies Reasons | `advanced_study_reason` | 6+ reason options | Frequency, % |
| Employment Status | `employment_status` | 6 status options | Frequency, % |
| Work Assignment (Region) | `work_region` | 18 regions | Frequency, % |
| Industry Sector | `industry_sector` | Program-specific options | Frequency, % |
| Time to First Job | `time_to_first_job` | 7 time ranges | Frequency, % |
| How Obtained First Job | `first_job_method` | 8 methods | Frequency, % |
| Job Challenges | `job_challenges` | 7 challenge types | Frequency, % |
| Job Relevance | `job_relevance` | 4 relevance levels | Frequency, %, Weighted Mean |

### Weighted Mean Calculation

For Likert-scale responses (1–5), the weighted mean formula is:

```
Weighted Mean = Σ(scale_value × frequency) / Σ(frequency)
```

Example for Curriculum Relevance:
| Scale | Label | Frequency (f) | f × scale |
|-------|-------|---------------|-----------|
| 5 | Highly Relevant | 45 | 225 |
| 4 | Relevant | 30 | 120 |
| 3 | Moderately Relevant | 15 | 45 |
| 2 | Slightly Relevant | 8 | 16 |
| 1 | Not Relevant | 2 | 2 |
| **Total** | | **100** | **408** |
| **Weighted Mean** | | | **4.08** |

---

## Cross-Program Field Differences Summary

| Field | CE | CpE | EE |
|-------|----|----|-----|
| Q17 Professional Title | Registered Civil Engineer, Master Plumber | Certified/Professional Computer Engineer | Registered Master Electrician, Registered/Professional Electrical Engineer |
| Q23 Specialization | MSCE variants (6) | Tech fields (11) | MSEE variants + MEng + PhD (6) |
| Q28 Job Level | Supervisory/Managerial (Yes/No) | Job Classification (6 tiers) | Supervisory/Managerial (Yes/No) |
| Q32 Industry Sector | Construction-focused (6) | IT/Tech-focused (12) | Power/Energy-focused (7) |
| Q37 First job = current? | — | — | **EE only** |
| Q14 Software tools example | "CAD" | Generic | "ex. CAD" |

> **Implementation Note:** The form dynamically shows/hides program-specific options based on the selected `program` field (Q8). The database stores the selected value as `TEXT` regardless of program, making cross-program queries straightforward.

---

## Google Sheets Column Mapping

The Google Sheets spreadsheet mirrors the `alumni` table columns. The sync engine maps between them:

| Sheets Column (Header Row) | DB Column | Direction |
|---------------------------|-----------|-----------|
| `Timestamp` | `created_at` | Sheets → DB (on pull) |
| `Full Name` | `full_name` | Bidirectional |
| `Date of Birth` | `date_of_birth` | Bidirectional |
| `Sex` | `sex` | Bidirectional |
| `Permanent Address` | `permanent_address` | Bidirectional |
| `Contact Number` | `contact_number` | Bidirectional |
| `Gmail Address` | `gmail_address` | Bidirectional |
| `Facebook Link` | `facebook_link` | Bidirectional |
| `Program` | `program` | Bidirectional |
| `Year Graduated` | `year_graduated` | Bidirectional |
| ... *(all other fields)* | ... | Bidirectional |

> **Sync Key:** Records are matched between Sheets and DB using a composite key of `full_name` + `program` + `year_graduated`, or a dedicated `row_id` column added to the sheet.

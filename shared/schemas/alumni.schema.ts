import { z } from 'zod'

const PROGRAMS = ['BSCE', 'BSCpE', 'BSEE'] as const
const LIKERT_SCALE = z.coerce.number().int().min(1).max(5).nullable().optional()

/** Preprocess for boolean 0/1 fields: convert empty string to null before coercion */
const booleanInt = z.preprocess(
  (val) => (val === '' || val === null || val === undefined ? null : val),
  z.coerce.number().int().min(0).max(1).nullable().optional()
)

export const alumniSchema = z.object({
  // Section II: Respondent Information
  full_name: z.string().min(1, 'Full name is required').max(200),
  date_of_birth: z.string().nullable().optional(),
  sex: z.string().nullable().optional(),
  sex_other: z.string().nullable().optional(),
  permanent_address: z.string().nullable().optional(),
  contact_number: z.string().nullable().optional(),
  gmail_address: z.string().email('Invalid email address').nullable().optional(),
  facebook_link: z.string().nullable().optional(),

  // Section III: Academic Profile
  program: z.enum(PROGRAMS, { required_error: 'Program is required' }),
  year_graduated: z.coerce
    .number({ required_error: 'Year graduated is required' })
    .int()
    .min(2018, 'Year must be 2018 or later')
    .max(new Date().getFullYear() + 1, 'Year cannot be in the far future'),
  has_honors: booleanInt,
  honors_received: z.string().nullable().optional(),

  // Section IV: Competencies & Curriculum
  curriculum_relevance: LIKERT_SCALE,
  comp_engineering_knowledge: LIKERT_SCALE,
  comp_problem_solving: LIKERT_SCALE,
  comp_engineering_design: LIKERT_SCALE,
  comp_communication: LIKERT_SCALE,
  comp_teamwork: LIKERT_SCALE,
  comp_ethics: LIKERT_SCALE,
  comp_leadership: LIKERT_SCALE,
  comp_lifelong_learning: LIKERT_SCALE,
  comp_modern_tools: LIKERT_SCALE,
  useful_competencies: z.string().nullable().optional(),
  useful_competencies_other: z.string().nullable().optional(),
  areas_to_improve: z.string().nullable().optional(),

  // Section V: Licensure & Professional Qualifications
  has_license: booleanInt,
  professional_title: z.string().nullable().optional(),
  professional_title_other: z.string().nullable().optional(),
  license_exam_date: z.string().nullable().optional(),
  other_certifications: z.string().nullable().optional(),
  has_grad_school: booleanInt,
  grad_school_program: z.string().nullable().optional(),
  advanced_study_reason: z.string().nullable().optional(),
  advanced_study_reason_other: z.string().nullable().optional(),
  specialization: z.string().nullable().optional(),

  // Section VI: Employment Data
  is_employed: booleanInt,
  unemployment_reason: z.string().nullable().optional(),
  unemployment_reason_other: z.string().nullable().optional(),
  employment_status: z.string().nullable().optional(),
  employment_status_other: z.string().nullable().optional(),
  current_position: z.string().nullable().optional(),
  job_level: z.string().nullable().optional(),
  company_name: z.string().nullable().optional(),
  company_address: z.string().nullable().optional(),
  work_region: z.string().nullable().optional(),
  work_region_other: z.string().nullable().optional(),
  industry_sector: z.string().nullable().optional(),
  industry_sector_other: z.string().nullable().optional(),
  job_relevance: z.string().nullable().optional(),
  salary_range: z.string().nullable().optional(),
  time_to_first_job: z.string().nullable().optional(),
  first_job_method: z.string().nullable().optional(),
  first_job_method_other: z.string().nullable().optional(),
  is_first_job: booleanInt,
  job_challenges: z.string().nullable().optional(),
  job_challenges_other: z.string().nullable().optional(),

  // Research & Projects
  research_conducted: z.string().nullable().optional(),

  // Section VII: Career Progression
  position_2yr: z.string().nullable().optional(),
  position_4yr: z.string().nullable().optional(),
  position_6yr: z.string().nullable().optional(),
  has_awards: booleanInt,
  awards_received: z.string().nullable().optional(),
  community_involvement: z.string().nullable().optional(),
})

export type AlumniFormData = z.infer<typeof alumniSchema>

export const alumniFilterSchema = z.object({
  programs: z.array(z.string()).optional(),
  yearFrom: z.coerce.number().int().min(2018).optional(),
  yearTo: z.coerce.number().int().optional(),
  syncStatus: z.string().optional(),
  isEmployed: z.coerce.number().int().min(0).max(1).optional(),
  hasLicense: z.coerce.number().int().min(0).max(1).optional(),
  search: z.string().optional(),
})

export type AlumniFilterData = z.infer<typeof alumniFilterSchema>

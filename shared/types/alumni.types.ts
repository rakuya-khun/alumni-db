export interface Alumni {
  id: number
  full_name: string
  date_of_birth: string | null
  sex: string | null
  sex_other: string | null
  permanent_address: string | null
  contact_number: string | null
  gmail_address: string | null
  facebook_link: string | null
  program: string
  year_graduated: number
  has_honors: number | null
  honors_received: string | null
  curriculum_relevance: number | null
  comp_engineering_knowledge: number | null
  comp_problem_solving: number | null
  comp_engineering_design: number | null
  comp_communication: number | null
  comp_teamwork: number | null
  comp_ethics: number | null
  comp_leadership: number | null
  comp_lifelong_learning: number | null
  comp_modern_tools: number | null
  useful_competencies: string | null
  useful_competencies_other: string | null
  areas_to_improve: string | null
  has_license: number | null
  professional_title: string | null
  professional_title_other: string | null
  license_exam_date: string | null
  other_certifications: string | null
  has_grad_school: number | null
  grad_school_program: string | null
  advanced_study_reason: string | null
  advanced_study_reason_other: string | null
  specialization: string | null
  is_employed: number | null
  unemployment_reason: string | null
  unemployment_reason_other: string | null
  employment_status: string | null
  employment_status_other: string | null
  current_position: string | null
  job_level: string | null
  company_name: string | null
  company_address: string | null
  work_region: string | null
  work_region_other: string | null
  industry_sector: string | null
  industry_sector_other: string | null
  job_relevance: string | null
  salary_range: string | null
  time_to_first_job: string | null
  first_job_method: string | null
  first_job_method_other: string | null
  is_first_job: number | null
  job_challenges: string | null
  job_challenges_other: string | null
  research_conducted: string | null
  position_2yr: string | null
  position_4yr: string | null
  position_6yr: string | null
  has_awards: number | null
  awards_received: string | null
  community_involvement: string | null
  sync_status: 'pending' | 'synced' | 'conflict'
  created_at: string
  updated_at: string
  synced_at: string | null
}

export type AlumniCreate = Omit<Alumni, 'id' | 'sync_status' | 'created_at' | 'updated_at' | 'synced_at'>

export type AlumniUpdate = Partial<Omit<Alumni, 'id' | 'created_at'>>

export interface AlumniFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
  syncStatus?: string
  isEmployed?: number
  hasLicense?: number
  search?: string
  specialization?: string[]
  workRegion?: string[]
  employmentPosition?: string[]
  jobRelevance?: string[]
  jobLevel?: string[]
  employmentStatus?: string[]
  industrySector?: string[]
}

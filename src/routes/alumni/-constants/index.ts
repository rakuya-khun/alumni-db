export const PROGRAMS = ['BSCE', 'BSCpE', 'BSEE'] as const

export const PROGRAM_LABELS: Record<string, string> = {
  BSCE: 'Civil Engineering',
  BSCpE: 'Computer Engineering',
  BSEE: 'Electrical Engineering',
}

export const EMPLOYMENT_STATUSES = [
  'Regular/Permanent',
  'Temporary',
  'Casual',
  'Contractual',
  'Self-Employed',
  'Other',
] as const

export const JOB_RELEVANCE_OPTIONS = [
  'Highly related',
  'Moderately related',
  'Slightly related',
  'Not related',
] as const

export const SALARY_RANGES = [
  'Below ₱15,000',
  '₱15,001 – ₱25,000',
  '₱25,001 – ₱35,000',
  '₱35,001 – ₱50,000',
  'Above ₱50,000',
] as const

export const TIME_TO_FIRST_JOB = [
  'Immediately after graduation',
  '1 – 3 months',
  '3 – 5 months',
  '6 – 8 months',
  '9 – 12 months',
  'More than 1 year',
] as const

export const FIRST_JOB_METHODS = [
  'Online job portal',
  'Career services / job fair',
  'Internship / OJT (absorbed)',
  'Faculty referral',
  'Family / friend referral',
  'Walk-in application',
  'Social media',
  'Other',
] as const

export const WORK_REGIONS = [
  'NCR (National Capital Region)',
  'CAR (Cordillera Administrative Region)',
  'Region I (Ilocos Region)',
  'Region II (Cagayan Valley)',
  'Region III (Central Luzon)',
  'Region IV-A (CALABARZON)',
  'Region IV-B (MIMAROPA)',
  'Region V (Bicol Region)',
  'Region VI (Western Visayas)',
  'Region VII (Central Visayas)',
  'Region VIII (Eastern Visayas)',
  'Region IX (Zamboanga Peninsula)',
  'Region X (Northern Mindanao)',
  'Region XI (Davao Region)',
  'Region XII (SOCCSKSARGEN)',
  'Region XIII (Caraga)',
  'BARMM',
  'Others / Abroad',
] as const

export const INDUSTRY_SECTORS_CE = [
  'Construction',
  'Consulting',
  'Government / Public Works',
  'Real Estate / Property Development',
  'Manufacturing',
  'Academe / Research',
  'Other',
] as const

export const INDUSTRY_SECTORS_CPE = [
  'Information Technology',
  'Telecommunications',
  'Semiconductor / Electronics',
  'Software Development',
  'BPO / Shared Services',
  'Academe / Research',
  'Other',
] as const

export const INDUSTRY_SECTORS_EE = [
  'Power Generation / Distribution',
  'Telecommunications',
  'Manufacturing',
  'Semiconductor / Electronics',
  'Building / Facility Management',
  'Academe / Research',
  'Other',
] as const

export const INDUSTRY_SECTORS_BY_PROGRAM: Record<string, readonly string[]> = {
  BSCE: INDUSTRY_SECTORS_CE,
  BSCpE: INDUSTRY_SECTORS_CPE,
  BSEE: INDUSTRY_SECTORS_EE,
}

export const JOB_LEVEL_CE = [
  'Entry Level/Rank-and-file',
  'Mid Level',
  'Consultant/Planner',
  'Supervisory/Team Lead',
  'Managerial',
  'Senior Resource',
] as const
export const JOB_LEVEL_EE = [
  'Entry Level/Rank-and-file',
  'Mid Level',
  'Consultant/Technician',
  'Supervisory/Team Lead',
  'Managerial',
  'Senior Resource',
] as const
export const JOB_LEVEL_CPE = [
  'Entry Level/Rank-and-file',
  'Mid Level',
  'Consultant/Developer',
  'Supervisory/Team Lead',
  'Managerial',
  'Senior Resource',
] as const

export const JOB_LEVEL_BY_PROGRAM: Record<string, readonly string[]> = {
  BSCE: JOB_LEVEL_CE,
  BSCpE: JOB_LEVEL_CPE,
  BSEE: JOB_LEVEL_EE,
}

export const ADVANCED_STUDY_REASONS = [
  'Career advancement',
  'Higher salary',
  'Professional development',
  'Academic / research interest',
  'Requirement for promotion',
  'Personal fulfillment',
  'Other',
] as const

export const UNEMPLOYMENT_REASONS = [
  'Advance / Further Study',
  'Family Concern',
  'Health-related',
  'Lack of Work Experience',
  'No Job Opportunity',
  'Did not Look for a Job',
  'Other',
] as const

export const JOB_CHALLENGES = [
  'Lack of work experience',
  'Limited job openings in the field',
  'Low salary offers',
  'High competition',
  'Location / relocation issues',
  'Licensure / certification requirements',
  'Other',
] as const

export const PROFESSIONAL_TITLES_CE = [
  'Registered Civil Engineer',
  'Master Plumber',
  'Other',
] as const

export const PROFESSIONAL_TITLES_CPE = [
  'Certified Computer Engineer',
  'Professional Computer Engineer',
  'Other',
] as const

export const PROFESSIONAL_TITLES_EE = [
  'Registered Master Electrician',
  'Registered Electrical Engineer',
  'Professional Electrical Engineer',
  'Other',
] as const

export const PROFESSIONAL_TITLES_BY_PROGRAM: Record<string, readonly string[]> = {
  BSCE: PROFESSIONAL_TITLES_CE,
  BSCpE: PROFESSIONAL_TITLES_CPE,
  BSEE: PROFESSIONAL_TITLES_EE,
}

export const COMPETENCY_LABELS: Record<string, string> = {
  comp_engineering_knowledge: 'Engineering Knowledge',
  comp_problem_solving: 'Problem-Solving Ability',
  comp_engineering_design: 'Engineering Design',
  comp_communication: 'Communication Skills',
  comp_teamwork: 'Teamwork & Collaboration',
  comp_ethics: 'Ethics & Responsibility',
  comp_leadership: 'Leadership & Initiative',
  comp_lifelong_learning: 'Lifelong Learning',
  comp_modern_tools: 'Modern Tools & Technology',
}

export const LIKERT_LABELS: Record<number, string> = {
  1: 'Very Poor',
  2: 'Poor',
  3: 'Fair',
  4: 'Good',
  5: 'Excellent',
}

export const SEX_OPTIONS = ['Male', 'Female', 'Other'] as const

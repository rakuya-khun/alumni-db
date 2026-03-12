import { useMemo } from 'react'
import type { HistoryEntry, FieldDiff } from '../-types/profiling.types'

const FIELD_LABELS: Record<string, string> = {
  full_name: 'Full Name',
  date_of_birth: 'Date of Birth',
  sex: 'Sex',
  permanent_address: 'Permanent Address',
  contact_number: 'Contact Number',
  gmail_address: 'Gmail Address',
  facebook_link: 'Facebook Link',
  program: 'Program',
  year_graduated: 'Year Graduated',
  has_honors: 'Has Honors',
  honors_received: 'Honors Received',
  curriculum_relevance: 'Curriculum Relevance',
  comp_engineering_knowledge: 'Engineering Knowledge',
  comp_problem_solving: 'Problem Solving',
  comp_engineering_design: 'Engineering Design',
  comp_communication: 'Communication',
  comp_teamwork: 'Teamwork',
  comp_ethics: 'Ethics',
  comp_leadership: 'Leadership',
  comp_lifelong_learning: 'Lifelong Learning',
  comp_modern_tools: 'Modern Tools',
  useful_competencies: 'Useful Competencies',
  areas_to_improve: 'Areas to Improve',
  has_license: 'Has License',
  professional_title: 'Professional Title',
  license_exam_date: 'License Exam Date',
  other_certifications: 'Other Certifications',
  has_grad_school: 'Has Grad School',
  grad_school_program: 'Grad School Program',
  advanced_study_reason: 'Advanced Study Reason',
  specialization: 'Specialization',
  is_employed: 'Employed',
  unemployment_reason: 'Unemployment Reason',
  employment_status: 'Employment Status',
  current_position: 'Current Position',
  job_level: 'Job Level',
  company_name: 'Company Name',
  company_address: 'Company Address',
  work_region: 'Work Region',
  industry_sector: 'Industry Sector',
  job_relevance: 'Job Relevance',
  salary_range: 'Salary Range',
  time_to_first_job: 'Time to First Job',
  first_job_method: 'First Job Method',
  is_first_job: 'Is First Job',
  job_challenges: 'Job Challenges',
  position_2yr: 'Position (2 yr)',
  position_4yr: 'Position (4 yr)',
  position_6yr: 'Position (6 yr)',
  has_awards: 'Has Awards',
  awards_received: 'Awards Received',
}

export function computeDiffs(
  older: Record<string, unknown>,
  newer: Record<string, unknown>
): FieldDiff[] {
  const diffs: FieldDiff[] = []
  const allKeys = new Set([...Object.keys(older), ...Object.keys(newer)])
  for (const key of allKeys) {
    if (key === 'id' || key === 'created_at' || key === 'updated_at' || key === 'synced_at' || key === 'sync_status') continue
    const before = older[key] ?? null
    const after = newer[key] ?? null
    if (String(before) !== String(after)) {
      diffs.push({
        field: key,
        label: FIELD_LABELS[key] ?? key,
        before,
        after,
      })
    }
  }
  return diffs
}

export function useAlumniHistory(history: HistoryEntry[]) {
  const sorted = useMemo(
    () => [...history].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()),
    [history]
  )

  const diffsPerEntry = useMemo(() => {
    const map = new Map<number, FieldDiff[]>()
    for (let i = 0; i < sorted.length; i++) {
      const entry = sorted[i]
      const older = i + 1 < sorted.length ? sorted[i + 1].snapshot : {}
      map.set(entry.id, computeDiffs(older, entry.snapshot))
    }
    return map
  }, [sorted])

  return { sorted, diffsPerEntry, latest: sorted[0] ?? null }
}

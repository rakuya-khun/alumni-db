import { analyticsRepository } from '../database/analytics.repository'
import type { SurveyTableData, FrequencyRow } from '../../shared/types/analytics.types'

const COLUMN_LABELS: Record<string, string> = {
  employment_status: 'Employment Status',
  job_level: 'Job Level',
  job_relevance: 'Job Relevance',
  salary_range: 'Salary Range',
  time_to_first_job: 'Time to First Job',
  first_job_method: 'Method of Finding First Job',
  work_region: 'Place of Work Assignment',
  industry_sector: 'Industry Sector',
  curriculum_relevance: 'Curriculum Relevance',
  has_grad_school: 'Graduate School',
  has_license: 'Board Licensure',
  has_honors: 'Academic Honors',
  has_awards: 'Awards Received',
  competencies: 'Competencies Assessment',
  advanced_study_reason: 'Reasons for Advanced Studies',
  job_challenges: 'Challenges in Finding Employment',
}

export const analyticsService = {
  getDashboard(programs?: string[]) {
    return {
      totalCount: analyticsRepository.getTotalCount(programs),
      boardPasserRate: analyticsRepository.getBoardPasserRate(programs),
      employmentRate: analyticsRepository.getEmploymentRate(programs),
      fieldRelatedRate: analyticsRepository.getFieldRelatedRate(programs),
      supervisoryRate: analyticsRepository.getSupervisoryRate(programs),
      countByProgram: analyticsRepository.getCountByProgram(programs),
      countByYear: analyticsRepository.getCountByYear(programs)
    }
  },

  getSurveyData(programs?: string[], column?: string): SurveyTableData | Record<string, SurveyTableData> {
    if (column) {
      let rows: FrequencyRow[]
      if (column === 'competencies') {
        rows = analyticsRepository.getCompetencyFrequency(programs)
      } else if (column === 'advanced_study_reason' || column === 'job_challenges' || column === 'first_job_method') {
        rows = analyticsRepository.getJsonArrayFrequency(column, programs)
      } else {
        rows = analyticsRepository.getFrequencyDistribution(column, programs)
      }
      return { column, label: COLUMN_LABELS[column] ?? column, rows }
    }
    // Return all common survey distributions
    const columns = [
      'employment_status', 'job_level', 'job_relevance', 'salary_range',
      'time_to_first_job', 'first_job_method', 'work_region',
      'industry_sector', 'curriculum_relevance', 'has_grad_school',
      'has_license', 'has_honors', 'has_awards'
    ]
    const result: Record<string, SurveyTableData> = {}
    for (const col of columns) {
      const rows = analyticsRepository.getFrequencyDistribution(col, programs)
      result[col] = { column: col, label: COLUMN_LABELS[col] ?? col, rows }
    }
    return result
  },

  getWeightedMeans(programs?: string[]) {
    return analyticsRepository.getCompetencyMeans(programs)
  }
}

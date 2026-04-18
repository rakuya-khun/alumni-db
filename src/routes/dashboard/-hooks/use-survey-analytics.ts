import { useCallback, useEffect, useState } from 'react'
import { useAnalyticsStore } from '../../../stores/analytics.store'
import { useAuth } from '../../../hooks/use-auth'
import type { SurveyTableData } from '../-types/analytics.types'
import type { DashboardFilters } from '../../../../shared/types/analytics.types'

const SURVEY_COLUMNS = [
  'curriculum_relevance',
  'competencies',
  'advanced_study_reason',
  'employment_status',
  'work_region',
  'industry_sector',
  'time_to_first_job',
  'first_job_method',
  'job_challenges',
  'professional_title',
  'specialization',
  'useful_competencies',
] as const

export function useSurveyAnalytics(extraFilters?: { yearFrom?: number; yearTo?: number; programs?: string[] }) {
  const { accessiblePrograms } = useAuth()
  const { surveyTables, fetchSurveyData, fetchWeightedMeans, weightedMeans } = useAnalyticsStore()
  const [loading, setLoading] = useState(false)

  const filters: DashboardFilters = {
    programs: extraFilters?.programs && extraFilters.programs.length > 0
      ? extraFilters.programs
      : accessiblePrograms.length > 0 ? accessiblePrograms : undefined,
    yearFrom: extraFilters?.yearFrom,
    yearTo: extraFilters?.yearTo,
  }

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        ...SURVEY_COLUMNS.map((col) => fetchSurveyData(col, filters)),
        fetchWeightedMeans(filters),
      ])
    } finally {
      setLoading(false)
    }
  }, [filters.programs, filters.yearFrom, filters.yearTo, fetchSurveyData, fetchWeightedMeans])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const getTable = (column: string): SurveyTableData | null => {
    return surveyTables.get(column) ?? null
  }

  return { getTable, weightedMeans, loading, refresh: fetchAll }
}

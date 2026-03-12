import { useCallback, useEffect, useState } from 'react'
import { useAnalyticsStore } from '../../../stores/analytics.store'
import { useAuth } from '../../../hooks/use-auth'
import type { SurveyTableData } from '../-types/analytics.types'

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
] as const

export function useSurveyAnalytics() {
  const { accessiblePrograms } = useAuth()
  const { surveyTables, fetchSurveyData, fetchWeightedMeans, weightedMeans } = useAnalyticsStore()
  const [loading, setLoading] = useState(false)

  const programs = accessiblePrograms.length > 0 ? accessiblePrograms : undefined

  const fetchAll = useCallback(async () => {
    setLoading(true)
    try {
      await Promise.all([
        ...SURVEY_COLUMNS.map((col) => fetchSurveyData(col, programs)),
        fetchWeightedMeans(programs),
      ])
    } finally {
      setLoading(false)
    }
  }, [programs, fetchSurveyData, fetchWeightedMeans])

  useEffect(() => {
    fetchAll()
  }, [fetchAll])

  const getTable = (column: string): SurveyTableData | null => {
    return surveyTables.get(column) ?? null
  }

  return { getTable, weightedMeans, loading, refresh: fetchAll }
}

import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface CurriculumRelevanceTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function CurriculumRelevanceTable({ data, loading }: CurriculumRelevanceTableProps) {
  return (
    <SurveyResponseTable
      title="Curriculum Relevance"
      data={data}
      loading={loading}
      showWeightedMean
    />
  )
}
import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface CompetenciesLearnedTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function CompetenciesLearnedTable({ data, loading }: CompetenciesLearnedTableProps) {
  return (
    <SurveyResponseTable
      title="Competencies Learned"
      data={data}
      loading={loading}
      totalLabel="Total mentions"
    />
  )
}

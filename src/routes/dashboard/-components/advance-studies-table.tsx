import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface AdvanceStudiesTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function AdvanceStudiesTable({ data, loading }: AdvanceStudiesTableProps) {
  return (
    <SurveyResponseTable
      title="Reasons for Pursuing Advanced Studies"
      data={data}
      loading={loading}
    />
  )
}
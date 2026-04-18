import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface SpecializationTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function SpecializationTable({ data, loading }: SpecializationTableProps) {
  return (
    <SurveyResponseTable
      title="Specialization"
      data={data}
      loading={loading}
      totalLabel="Total mentions"
    />
  )
}

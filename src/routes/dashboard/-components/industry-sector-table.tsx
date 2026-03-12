import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface IndustrySectorTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function IndustrySectorTable({ data, loading }: IndustrySectorTableProps) {
  return (
    <SurveyResponseTable
      title="Industry Sector Distribution"
      data={data}
      loading={loading}
    />
  )
}
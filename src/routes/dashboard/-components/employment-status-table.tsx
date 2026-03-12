import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface EmploymentStatusTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function EmploymentStatusTable({ data, loading }: EmploymentStatusTableProps) {
  return (
    <SurveyResponseTable
      title="Employment Status Distribution"
      data={data}
      loading={loading}
    />
  )
}
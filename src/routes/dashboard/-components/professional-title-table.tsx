import { SurveyResponseTable } from './survey-response-table'
import type { SurveyTableData } from '../-types/analytics.types'

interface ProfessionalTitleTableProps {
  data: SurveyTableData | null
  loading?: boolean
}

export function ProfessionalTitleTable({ data, loading }: ProfessionalTitleTableProps) {
  return (
    <SurveyResponseTable
      title="Professional Title"
      data={data}
      loading={loading}
      totalLabel="Total mentions"
    />
  )
}

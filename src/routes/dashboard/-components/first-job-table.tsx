import { Loader2 } from 'lucide-react'
import type { SurveyTableData } from '../-types/analytics.types'
import { SurveyResponseTable } from './survey-response-table'

interface FirstJobTableProps {
  timeData: SurveyTableData | null
  methodData: SurveyTableData | null
  challengesData: SurveyTableData | null
  loading?: boolean
}

export function FirstJobTable({ timeData, methodData, challengesData, loading }: FirstJobTableProps) {
  if (loading) {
    return (
      <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm">
        <h3 className="mb-4 text-lg font-semibold text-text-primary">Methods of Finding First Job - Challenges Faced in Finding Employment</h3>
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-text-muted" />
        </div>
      </div>
    )
  }

  return (
    <div className="rounded-xl border border-card-border bg-card p-6 shadow-sm space-y-6">
      <h3 className="text-lg font-semibold text-text-primary">Methods of Finding First Job - Challenges Faced in Finding Employment</h3>
      
      <div className="space-y-4">
        <SurveyResponseTable
          title="Time to First Job"
          data={timeData}
          loading={loading}
        />
        <SurveyResponseTable
          title="Method of Finding First Job"
          data={methodData}
          loading={loading}
        />
        <SurveyResponseTable
          title="Challenges Faced in Finding Employment"
          data={challengesData}
          loading={loading}
        />
      </div>
    </div>
  )
}
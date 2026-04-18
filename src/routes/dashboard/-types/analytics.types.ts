import type { DashboardStats, SurveyTableData, FrequencyRow, WeightedMeanResult, RateResult } from '../../../../shared/types/analytics.types'

export type { DashboardStats, SurveyTableData, FrequencyRow, WeightedMeanResult, RateResult }

export interface StatCardProps {
  title: string
  value: string | number
  subtitle?: string
  icon: React.ComponentType<{ className?: string }>
  highlighted?: boolean
}

export interface SurveyTableProps {
  title: string
  data: SurveyTableData | null
  loading?: boolean
  showWeightedMean?: boolean
  headerSlot?: React.ReactNode
  totalLabel?: string
}

export interface ChartDataPoint {
  label: string
  value: number
  color?: string
}

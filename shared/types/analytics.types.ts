export interface DashboardFilters {
  programs?: string[]
  yearFrom?: number
  yearTo?: number
}

export interface DashboardStats {
  totalCount: number
  boardPasserRate: RateResult
  employmentRate: RateResult
  fieldRelatedRate: { employed: number; fieldRelated: number; rate: number }
  supervisoryRate: { employed: number; supervisory: number; rate: number }
  countByProgram: { program: string; count: number }[]
  countByYear: { year: number; count: number }[]
}

export interface RateResult {
  total: number
  passers?: number
  employed?: number
  rate: number
}

export interface FrequencyRow {
  value: string
  count: number
  percentage?: number
}

export interface WeightedMeanResult {
  competency: string
  mean: number
}

export interface SurveyTableData {
  column: string
  label: string
  rows: FrequencyRow[]
  weightedMean?: number
}
